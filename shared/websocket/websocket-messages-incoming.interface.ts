export type IncomingMessageType = "START_SCAN" | "STOP_SCAN";

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

export type IncomingWsMessage = StartScanMessage | StopScanMessage;
