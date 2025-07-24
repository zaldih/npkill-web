import { LogEntry } from "npkill";
import { NpkillResult } from "../npkill-result.interface.js";
import { ServerState } from "../app-state.interface.js";

export type OutgoingMessageType =
  | "SERVER_STATE"
  | "NEW_RESULT"
  | "UPDATE_RESULT"
  | "SCAN_END"
  | "LOG"
  | "STATS_UPDATE";

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

export interface ScanEndMessage extends Message {
  type: "SCAN_END";
  payload: null;
}

export interface LogMessage extends Message {
  type: "LOG";
  payload: {
    message: LogEntry[];
  };
}

export interface StatsUpdateMessage extends Message {
  type: "STATS_UPDATE";
  payload: {
    releasableSpace: number;
    releasedSpace: number;
    totalResults: number;
    deletedResults: number;
  };
}

export type OutgoingWsMessage =
  | ServerStateMessage
  | NewResultMessage
  | UpdateResultMessage
  | ScanEndMessage
  | LogMessage
  | StatsUpdateMessage;
