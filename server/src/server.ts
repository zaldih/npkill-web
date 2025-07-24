import express from "express";
import { Server } from "node:http";
import {
  Npkill,
  ScanOptions,
  ScanFoundFolder,
  GetFolderSizeOptions,
  GetFolderLastModificationOptions,
  GetFolderSizeResult,
  GetFolderLastModificationResult,
  LogEntry,
} from "npkill";
import { WebSocketServer, WebSocket } from "ws";
import { NpkillResult } from "../../shared/npkill-result.interface.js";
import {
  IncomingWsMessage,
  OutgoingWsMessage,
} from "../../shared/websocket/index.js";
import { take, tap, Subject } from "rxjs";
import { ServerState } from "../../shared/app-state.interface.js";
import { homedir } from "node:os";
import { FilesService } from "./files.service.js";

class NpkillServer {
  private app = express();
  private port = 2420;
  private onlyLocalhost = true;
  private server!: Server;
  private wss!: WebSocketServer;
  private clients: WebSocket[] = [];
  private results: NpkillResult[] = [];
  private logs: LogEntry[] = [];
  private npkill: Npkill | null = null;
  private searchLocalConfig = {
    excludeHidden: true,
  };
  private serverState: ServerState = {
    isScanning: false,
    settings: {
      rootPath: homedir(),
      targetDirs: ["node_modules"],
      excludePattern: [".git"],
      excludeHidden: true,
    },
    information: {
      userHomePath: homedir(),
      npkillWebVersion: "0.0.0-dev",
    },
    storage: {
      initialDiskSize: 0,
    },
    stats: {
      releasableSpace: 0,
      releasedSpace: 0,
      totalResults: 0,
      deletedResults: 0,
    },
  };

  private destroy$ = new Subject<void>();

  constructor(private readonly filesService: FilesService) {
    this.initializeServer().then(() => {
      this.initializeSocketListeners();
    });
  }

  private async initializeServer() {
    const host = this.onlyLocalhost ? "127.0.0.1" : "";
    this.serverState.storage.initialDiskSize =
      await this.filesService.getTotalDiskSize();
    this.server = this.app.listen(this.port, host, () => {
      console.log(`📦💥 Npkill server running on port ${this.port} (${host})`);
    });
    this.wss = new WebSocketServer({ server: this.server });
  }

  private initializeSocketListeners() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected");
      this.clients = [...this.clients, ws];

      this.sendMessage(ws, { type: "SERVER_STATE", payload: this.serverState });

      const liveResults = this.results.filter((r) => r.status === "live");
      this.sendMessage(ws, { type: "NEW_RESULT", payload: liveResults });

      this.sendMessage(ws, { type: "LOG", payload: { message: this.logs } });
      this.sendMessage(ws, {
        type: "STATS_UPDATE",
        payload: this.serverState.stats,
      });

      ws.on("message", (wsMessage: string) => {
        try {
          const message: IncomingWsMessage = JSON.parse(wsMessage);
          if (message.type === "START_SCAN") {
            const { rootPath, targetDirs, excludePattern, excludeHidden } =
              message.payload;
            const scanOptions: ScanOptions = {
              rootPath,
              target: targetDirs[0],
              exclude: excludePattern,
            };
            this.searchLocalConfig.excludeHidden = excludeHidden;
            this.serverState.settings = {
              rootPath,
              targetDirs,
              excludePattern,
              excludeHidden,
            };
            this.startNpkill(scanOptions);
          } else if (message.type === "STOP_SCAN") {
            console.warn("// TODO stop need to be implemented in npkill core.");
          } else if (message.type === "DELETE_RESULT") {
            this.handleDeleteResult(message.payload.path, message.payload.size);
          }
        } catch (error) {
          console.error("Error processing ws message:", error);
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected");
        this.clients = this.clients.filter((client) => client !== ws);
      });
    });
  }

  private startNpkill(scanOptions: ScanOptions): void {
    console.log(
      "Starting new scan with options: " + JSON.stringify(scanOptions)
    );
    this.serverState.isScanning = true;
    this.results = [];
    this.resetStats();
    this.npkill = new Npkill();
    this.npkill
      .getLogs$()
      .pipe(
        tap((log) => {
          this.logs = log;
          this.clients.forEach((client) => {
            this.sendMessage(client, {
              type: "LOG",
              payload: { message: log },
            });
          });
        })
      )
      .subscribe();

    this.npkill
      .startScan$(scanOptions)
      .pipe(
        tap((found) => {
          const result: NpkillResult = {
            path: found.path,
            isDangerous: this.npkill!.getFileService().isDangerous(found.path),
            modificationTime: -1,
            size: -1,
            status: "live",
          };

          if (result.isDangerous && this.searchLocalConfig.excludeHidden) {
            return;
          }

          this.results = [...this.results, result];
          this.clients.forEach((client) => {
            this.sendMessage(client, { type: "NEW_RESULT", payload: [result] });
          });

          if (this.searchLocalConfig.excludeHidden && result.isDangerous) {
            return;
          }
          const sizeOptions: GetFolderSizeOptions = { path: found.path };
          this.npkill!.getFolderSize$(sizeOptions)
            .pipe(
              take(1),
              tap((sizeResult: GetFolderSizeResult) => {
                const idx = this.results.findIndex(
                  (r) => r.path === found.path
                );
                if (idx === -1) throw new Error("Result not found.");
                this.results[idx] = {
                  ...this.results[idx],
                  size: sizeResult.size,
                };
                this.updateStats();
                this.clients.forEach((client) => {
                  this.sendMessage(client, {
                    type: "UPDATE_RESULT",
                    payload: this.results[idx],
                  });
                });

                const modOptions: GetFolderLastModificationOptions = {
                  path: found.path,
                };
                this.npkill!.getFolderLastModification(modOptions).then(
                  (modResult: GetFolderLastModificationResult) => {
                    const idx2 = this.results.findIndex(
                      (r) => r.path === found.path
                    );
                    if (idx2 === -1) throw new Error("Result not found.");
                    const modificationTime = Math.floor(
                      (Date.now() / 1000 - modResult.timestamp) / 86400
                    );
                    this.results[idx2] = {
                      ...this.results[idx2],
                      modificationTime,
                    };
                    this.clients.forEach((client) => {
                      this.sendMessage(client, {
                        type: "UPDATE_RESULT",
                        payload: this.results[idx2],
                      });
                    });
                  }
                );
              })
            )
            .subscribe();
        }),
        tap({
          complete: () => {
            this.serverState.isScanning = false;
            console.log("Scan completed");
            this.clients.forEach((client) => {
              this.sendMessage(client, {
                type: "SCAN_END",
                payload: null,
              });
            });
            this.serverState.isScanning = false;
            this.clients.forEach((client) => {
              this.sendMessage(client, {
                type: "SERVER_STATE",
                payload: this.serverState,
              });
            });
          },
        })
      )
      .subscribe();
  }

  private sendMessage<T extends OutgoingWsMessage>(
    ws: WebSocket,
    message: T
  ): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private async handleDeleteResult(path: string, size: number) {
    if (!this.npkill) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(`Removing folder: ${path} (${size} bytes)`);
    const result = await this.npkill.deleteFolder({ path });
    if (!result.success) {
      console.error(`Failed to delete folder: ${path}`);
      return;
    }
    console.log(`Successfully deleted folder: ${path}`);

    const resultIndex = this.results.findIndex((r) => r.path === path);
    if (resultIndex !== -1) {
      this.results[resultIndex] = {
        ...this.results[resultIndex],
        status: "deleted",
      };

      this.updateStats();

      this.clients.forEach((client) => {
        this.sendMessage(client, {
          type: "UPDATE_RESULT",
          payload: this.results[resultIndex],
        });
      });

      console.log(`Successfully deleted folder: ${path}`);
    }
  }

  private updateStats(): void {
    const liveResults = this.results.filter(
      (r) => r.status === "live" && r.size > 0
    );
    const deletedResults = this.results.filter((r) => r.status === "deleted");

    const releasableSpace = liveResults.reduce(
      (acc, result) => acc + result.size,
      0
    );
    const releasedSpace = deletedResults.reduce(
      (acc, result) => acc + result.size,
      0
    );

    this.serverState.stats = {
      releasableSpace,
      releasedSpace,
      totalResults: liveResults.length,
      deletedResults: deletedResults.length,
    };

    this.clients.forEach((client) => {
      this.sendMessage(client, {
        type: "STATS_UPDATE",
        payload: this.serverState.stats,
      });
    });
  }

  private resetStats(): void {
    this.serverState.stats = {
      releasableSpace: 0,
      releasedSpace: 0,
      totalResults: 0,
      deletedResults: 0,
    };

    this.clients.forEach((client) => {
      this.sendMessage(client, {
        type: "STATS_UPDATE",
        payload: this.serverState.stats,
      });
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clients.forEach((ws) => ws.close());
    this.server.close(() => {
      process.exit(0);
    });
  }
}

const filesService = new FilesService();
const npkillServer = new NpkillServer(filesService);

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  npkillServer.destroy();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  npkillServer.destroy();
});
