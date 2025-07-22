import express from "express";
import {
  Npkill,
  ScanOptions,
  ScanFoundFolder,
  GetFolderSizeOptions,
  GetFolderLastModificationOptions,
  GetFolderSizeResult,
  GetFolderLastModificationResult,
} from "npkill";

import { WebSocketServer, WebSocket } from "ws";
import { NpkillResult } from "../../shared/npkill-result.interface.js";
import { Message } from "../../shared/websocket/websocket-messages.interface.js";
import { take, tap } from "rxjs";

const app = express();
const port = 2420;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const wss = new WebSocketServer({ server });

let npkillStarted = false;
let clients: WebSocket[] = [];
let results: NpkillResult[] = [];

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");
  clients = [...clients, ws];

  if (!npkillStarted) {
    startNpkill();
    npkillStarted = true;
  }

  sendMessage(ws, { type: "NEW_RESULT", payload: results });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client !== ws);
  });
});

function startNpkill() {
  const npkill = new Npkill();
  const scanOptions: ScanOptions = {
    rootPath: "/home/zaldih/projects",
    target: "node_modules",
    exclude: [".git"],
  };
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
        results = [...results, result];
        clients.forEach((client) => {
          sendMessage(client, { type: "NEW_RESULT", payload: [result] });
        });

        const sizeOptions: GetFolderSizeOptions = { path: found.path };
        npkill
          .getFolderSize$(sizeOptions)
          .pipe(
            take(1),
            tap((sizeResult: GetFolderSizeResult) => {
              const idx = results.findIndex((r) => r.path === found.path);
              if (idx === -1) throw new Error("Result not found.");
              results[idx] = { ...results[idx], size: sizeResult.size };
              clients.forEach((client) => {
                sendMessage(client, {
                  type: "UPDATE_RESULT",
                  payload: results[idx],
                });
              });

              const modOptions: GetFolderLastModificationOptions = {
                path: found.path,
              };
              npkill
                .getFolderLastModification(modOptions)
                .then((modResult: GetFolderLastModificationResult) => {
                  const idx2 = results.findIndex((r) => r.path === found.path);
                  if (idx2 === -1) throw new Error("Result not found.");
                  const modificationTime = Math.floor(
                    (Date.now() / 1000 - modResult.timestamp) / 86400
                  );
                  results[idx2] = { ...results[idx2], modificationTime };
                  clients.forEach((client) => {
                    sendMessage(client, {
                      type: "UPDATE_RESULT",
                      payload: results[idx2],
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

function sendMessage<T extends Message>(ws: WebSocket, message: T): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
