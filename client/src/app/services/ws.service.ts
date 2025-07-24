import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, timer } from 'rxjs';
import {
  takeUntil,
  retry,
  delayWhen,
  tap,
  finalize,
  filter,
} from 'rxjs/operators';
import {
  IncomingWsMessage,
  OutgoingWsMessage,
} from '../../../../shared/websocket';

const WS_URL = 'ws://localhost:2420';
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

@Injectable({
  providedIn: 'root',
})
export class WsService implements OnDestroy {
  private socket: WebSocket | null = null;
  private destroy$ = new Subject<void>();
  private messagesSubject = new Subject<OutgoingWsMessage>();
  private connectionStateSubject = new BehaviorSubject<ConnectionState>(
    ConnectionState.DISCONNECTED
  );
  private reconnectAttempts = 0;

  readonly messages$ = this.messagesSubject.asObservable();
  readonly connectionState$ = this.connectionStateSubject.asObservable();
  readonly isConnected$ = this.connectionState$.pipe(
    filter((state) => state === ConnectionState.CONNECTED)
  );

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.connectionStateSubject.next(ConnectionState.CONNECTING);
    this.createConnection();
  }

  disconnect(): void {
    this.destroy$.next();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionStateSubject.next(ConnectionState.DISCONNECTED);
  }

  sendMessage(message: IncomingWsMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private createConnection(): void {
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStateSubject.next(ConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as OutgoingWsMessage;
          this.messagesSubject.next(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStateSubject.next(ConnectionState.ERROR);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.socket = null;

        if (
          !event.wasClean &&
          this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS
        ) {
          this.scheduleReconnect();
        } else {
          this.connectionStateSubject.next(ConnectionState.DISCONNECTED);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.connectionStateSubject.next(ConnectionState.ERROR);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    this.connectionStateSubject.next(ConnectionState.RECONNECTING);

    console.log(
      `Attempting to reconnect... (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
    );

    timer(RECONNECT_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.createConnection();
      });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.complete();
    this.messagesSubject.complete();
    this.connectionStateSubject.complete();
  }
}
