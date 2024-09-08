import { NpkillResult } from "../npkill-result.interface.js";

export interface Message {
  type: "NEW_RESULT" | "UPDATE_RESULT" | "LOG";
  payload: any;
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
    message: string;
  };
}
