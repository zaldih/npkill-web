import { LogEntry } from "npkill";
import { NpkillResult } from "../npkill-result.interface.js";
import { ServerState } from "../app-state.interface.js";

export type OutgoingMessageType =
  | "SERVER_STATE"
  | "NEW_RESULT"
  | "UPDATE_RESULT"
  | "LOG";

interface Message {
  type: OutgoingMessageType;
  payload: any;
}

export interface ServerStateMessage extends Message {
  type: "SERVER_STATE";
  payload: ServerState;
}

export interface NewResultMessage extends Message {
  type: "NEW_RESULT";
  payload: NpkillResult[];
}

export interface UpdateResultMessage extends Message {
  type: "UPDATE_RESULT";
  payload: NpkillResult;
}

export interface LogMessage extends Message {
  type: "LOG";
  payload: {
    message: LogEntry[];
  };
}

export type OutgoingWsMessage =
  | ServerStateMessage
  | NewResultMessage
  | UpdateResultMessage
  | LogMessage;
