import express from "express";
import { Server } from "node:http";
import {
  Npkill,
  ScanOptions,
  GetFolderLastModificationOptions,
  LogEntry,
} from "npkill";
import { WebSocketServer, WebSocket } from "ws";
import { NpkillResult } from "../../shared/npkill-result.interface.js";
import {
  IncomingWsMessage,
  OutgoingWsMessage,
} from "../../shared/websocket/index.js";
import { take, tap, Subject, finalize } from "rxjs";
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
    console.log("[Npkill] Starting new scan:", scanOptions);

    this.serverState.isScanning = true;
    this.results = [];
    this.resetStats();
    this.npkill = new Npkill();

    this.npkill
      .getLogs$()
      .pipe(
        tap((log) => {
          this.logs = log;
          this.broadcast({ type: "LOG", payload: { message: log } });
        })
      )
      .subscribe();

    this.npkill
      .startScan$(scanOptions)
      .pipe(
        tap((found) => this.handleFoundPath(found)),
        finalize(() => this.onScanComplete())
      )
      .subscribe();
  }

  private handleFoundPath(found: { path: string }): void {
    const isDangerous = this.npkill!.getFileService().isDangerous(found.path);

    if (this.searchLocalConfig.excludeHidden && isDangerous) return;

    const result: NpkillResult = {
      path: found.path,
      isDangerous,
      modificationTime: -1,
      size: -1,
      status: "live",
    };

    this.results = [...this.results, result];
    this.broadcast({ type: "NEW_RESULT", payload: [result] });

    this.npkill!.getFolderSize$({ path: found.path })
      .pipe(
        take(1),
        tap((sizeResult) => this.updateResultSize(found.path, sizeResult.size))
      )
      .subscribe();
  }

  private updateResultSize(path: string, size: number): void {
    const idx = this.results.findIndex((r) => r.path === path);
    if (idx === -1)
      return console.error(`[Npkill] Result not found for ${path}`);

    this.results[idx] = { ...this.results[idx], size };
    this.updateStats();
    this.broadcast({ type: "UPDATE_RESULT", payload: this.results[idx] });

    const modOptions: GetFolderLastModificationOptions = { path };
    this.npkill!.getFolderLastModification(modOptions)
      .then((modResult) =>
        this.updateResultModificationTime(path, modResult.timestamp)
      )
      .catch((err) =>
        console.error(
          `[Npkill] Failed to get modification time for ${path}`,
          err
        )
      );
  }

  private updateResultModificationTime(path: string, timestamp: number): void {
    const idx = this.results.findIndex((r) => r.path === path);
    if (idx === -1)
      return console.error(`[Npkill] Result not found for ${path}`);

    const modificationTime = Math.floor(
      (Date.now() / 1000 - timestamp) / 86400
    );
    this.results[idx] = { ...this.results[idx], modificationTime };
    this.broadcast({ type: "UPDATE_RESULT", payload: this.results[idx] });
  }

  private onScanComplete(): void {
    console.log("[Npkill] Scan completed");

    this.serverState.isScanning = false;
    this.broadcast({ type: "SCAN_END", payload: null });
    this.broadcast({ type: "SERVER_STATE", payload: this.serverState });
  }

  private broadcast(message: OutgoingWsMessage): void {
    this.clients.forEach((client) => {
      this.sendMessage(client, message);
    });
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
