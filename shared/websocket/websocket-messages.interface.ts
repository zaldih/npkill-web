import { IncomingWsMessage } from "./websocket-messages-incoming.interface.js";
import { OutgoingWsMessage } from "./websocket-messages-outgoing.interface.js";

export type WsMessage = IncomingWsMessage | OutgoingWsMessage;
