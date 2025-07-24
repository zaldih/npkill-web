export type IncomingMessageType = "START_SCAN" | "STOP_SCAN" | "DELETE_RESULT";

interface Message {
  type: IncomingMessageType;
  payload: any;
}

export interface StartScanMessage extends Message {
  type: "START_SCAN";
  payload: {
    rootPath: string;
    targetDirs: string[];
    excludePattern: string[];
    excludeHidden: boolean;
  };
}

export interface StopScanMessage extends Message {
  type: "STOP_SCAN";
  payload: null;
}

export interface DeleteResultMessage extends Message {
  type: "DELETE_RESULT";
  payload: {
    path: string;
    size: number;
  };
}

export type IncomingWsMessage =
  | StartScanMessage
  | StopScanMessage
  | DeleteResultMessage;
