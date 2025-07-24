import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppStateService } from '../../services/app-state.service';
import { WsService, ConnectionState } from '../../services/ws.service';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="connection-status" [class]="statusClass()">
      <mat-icon>{{ statusIcon() }}</mat-icon>
      <span>{{ statusText() }}</span>
      @if (!isConnected()) {
      <button mat-icon-button (click)="reconnect()" title="Reconnect">
        <mat-icon>refresh</mat-icon>
      </button>
      }
    </div>
  `,
  styles: [
    `
      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .connected {
        background-color: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #4caf50;
      }

      .disconnected {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #f44336;
      }

      .connecting {
        background-color: #fff3e0;
        color: #ef6c00;
        border: 1px solid #ff9800;
      }

      .error {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #f44336;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
})
export class ConnectionStatusComponent {
  isConnected = computed(() => this.appStateService.isConnected());

  constructor(
    private appStateService: AppStateService,
    private wsService: WsService
  ) {}

  statusClass = computed(() => {
    return this.isConnected() ? 'connected' : 'disconnected';
  });

  statusIcon = computed(() => {
    return this.isConnected() ? 'wifi' : 'wifi_off';
  });

  statusText = computed(() => {
    return this.isConnected() ? 'Connected' : 'Disconnected';
  });

  reconnect(): void {
    this.wsService.connect();
  }
}
