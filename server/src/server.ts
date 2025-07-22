import express from "express";
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
import { Message } from "../../shared/websocket/websocket-messages.interface.js";
import { take, tap, Subject } from "rxjs";

class NpkillServer {
  private app = express();
  private port = 2420;
  private server = this.app.listen(this.port, () => {
    console.log(`📦💥 Npkill server running on port ${this.port}`);
  });
  private wss = new WebSocketServer({ server: this.server });
  private npkillStarted = false;
  private clients: WebSocket[] = [];
  private results: NpkillResult[] = [];
  private logs: LogEntry[] = [];
  private destroy$ = new Subject<void>();

  constructor() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected");
      this.clients = [...this.clients, ws];

      if (!this.npkillStarted) {
        this.startNpkill();
        this.npkillStarted = true;
      }

      this.sendMessage(ws, { type: "NEW_RESULT", payload: this.results });

      this.sendMessage(ws, { type: "LOG", payload: this.logs });

      ws.on("close", () => {
        console.log("Client disconnected");
        this.clients = this.clients.filter((client) => client !== ws);
      });
    });
  }

  private startNpkill() {
    const npkill = new Npkill();
    const scanOptions: ScanOptions = {
      rootPath: "/home/zaldih/projects",
      target: "node_modules",
      exclude: [".git"],
    };
    npkill
      .getLogs$()
      .pipe(
        tap((log) => {
          this.logs = log;
          this.clients.forEach((client) => {
            this.sendMessage(client, { type: "LOG", payload: log });
          });
        })
      )
      .subscribe();

    npkill
      .startScan$(scanOptions)
      .pipe(
        tap((found: ScanFoundFolder) => {
          const result: NpkillResult = {
            path: found.path,
            isDangeroud: false,
            modificationTime: -1,
            size: -1,
            status: "live",
          };
          this.results = [...this.results, result];
          this.clients.forEach((client) => {
            this.sendMessage(client, { type: "NEW_RESULT", payload: [result] });
          });

          const sizeOptions: GetFolderSizeOptions = { path: found.path };
          npkill
            .getFolderSize$(sizeOptions)
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
                this.clients.forEach((client) => {
                  this.sendMessage(client, {
                    type: "UPDATE_RESULT",
                    payload: this.results[idx],
                  });
                });

                const modOptions: GetFolderLastModificationOptions = {
                  path: found.path,
                };
                npkill
                  .getFolderLastModification(modOptions)
                  .then((modResult: GetFolderLastModificationResult) => {
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
                  });
              })
            )
            .subscribe();
        })
      )
      .subscribe();
  }

  private sendMessage<T extends Message>(ws: WebSocket, message: T): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
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

const npkillServer = new NpkillServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  npkillServer.destroy();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  npkillServer.destroy();
});
