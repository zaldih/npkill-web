import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../../../shared/websocket/websocket-messages.interface';

const WS_URL = 'ws://localhost:2420';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private socket: WebSocket | null = null;

  connect(): Observable<Message> {
    return new Observable((observer) => {
      if (!this.socket) {
        this.socket = new WebSocket(WS_URL);
      }
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (error) {
          observer.error(error);
        }
      };
      this.socket.onerror = (event) => observer.error(event);
      this.socket.onclose = () => observer.complete();
    });
  }

  sendMessage(message: string): void {
    if (!this.socket) {
      throw new Error('Cannot send message, no connection');
    }

    this.socket.send(message);
  }
}
