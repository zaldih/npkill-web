import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SidenavComponent } from './features/sidenav/sidenav.component';
import { WsService, ConnectionState } from './services/ws.service';
import { AppStateService } from './services/app-state.service';
import { MessageHandlerService } from './services/message-handler.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Npkill';
  private destroy$ = new Subject<void>();

  constructor(
    private wsService: WsService,
    private appStateService: AppStateService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit(): void {
    this.initializeWebSocketConnection();
    this.subscribeToConnectionState();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect();
  }

  private initializeWebSocketConnection(): void {
    this.wsService.connect();
  }

  private subscribeToConnectionState(): void {
    this.wsService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        const isConnected = state === ConnectionState.CONNECTED;
        this.appStateService.updateConnectionStatus(isConnected);

        if (state === ConnectionState.ERROR) {
          console.error('WebSocket connection error');
        }
      });
  }

  private subscribeToMessages(): void {
    this.wsService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.messageHandler.handleMessage(message);
      });
  }
}
