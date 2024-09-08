import express from "express";
import { Npkill } from "npkill";
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
  npkill
    .findFolders({ path: "/home/zaldih/projects", target: "node_modules" })
    .pipe(
      tap((rawResult) => {
        const result: NpkillResult = {
          path: rawResult,
          isDangeroud: false,
          modificationTime: -1,
          size: -1,
          status: "live",
        };
        results = [...results, result];

        clients.forEach((client) => {
          sendMessage(client, { type: "NEW_RESULT", payload: [result] });
        });

        npkill
          .getFolderStats(rawResult)
          .pipe(
            take(1),
            tap((size) => {
              const a = results.findIndex((r) => r.path === rawResult);
              if (a === -1) {
                console.log({ rawResult, size, a });
                throw new Error("Result not found.");
              }
              results[a] = { ...results[a], size };

              clients.forEach((client) => {
                sendMessage(client, {
                  type: "UPDATE_RESULT",
                  payload: results[a],
                });
              });

              npkill.getRecentModification(rawResult).then((lastModTime) => {
                const a = results.findIndex((r) => r.path === rawResult);
                if (a === -1) {
                  throw new Error("Result not found.");
                }
                // Convert to days from today
                const modificationTime = Math.floor(
                  (new Date().getTime() / 1000 - lastModTime) / 86400
                );
                results[a] = { ...results[a], modificationTime };

                clients.forEach((client) => {
                  sendMessage(client, {
                    type: "UPDATE_RESULT",
                    payload: results[a],
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
