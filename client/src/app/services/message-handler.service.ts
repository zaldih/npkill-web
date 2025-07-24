import { Injectable } from '@angular/core';
import {
  OutgoingWsMessage,
  ServerStateMessage,
  NewResultMessage,
  UpdateResultMessage,
  LogMessage,
  StatsUpdateMessage,
} from '../../../../shared/websocket';
import { AppStateService } from './app-state.service';
import { ResultsService } from '../features/results/results.service';
import { LogsService } from '../features/logs/logs.service';
import { StatsService } from '../features/stats/stats.service';

@Injectable({
  providedIn: 'root',
})
export class MessageHandlerService {
  constructor(
    private readonly appStateService: AppStateService,
    private readonly resultsService: ResultsService,
    private readonly logsService: LogsService,
    private readonly statsService: StatsService
  ) {}

  handleMessage(message: OutgoingWsMessage): void {
    switch (message.type) {
      case 'SERVER_STATE':
        this.handleServerState(message as ServerStateMessage);
        break;

      case 'NEW_RESULT':
        this.handleNewResult(message as NewResultMessage);
        break;

      case 'UPDATE_RESULT':
        this.handleUpdateResult(message as UpdateResultMessage);
        break;

      case 'LOG':
        this.handleLog(message as LogMessage);
        break;

      case 'STATS_UPDATE':
        this.handleStatsUpdate(message as StatsUpdateMessage);
        break;

      case 'SCAN_END':
        this.handleScanEnd();
        break;

      default:
        console.warn('Unknown message type:', message);
    }
  }

  private handleServerState(message: ServerStateMessage): void {
    this.appStateService.updateServerState(message.payload);

    this.statsService.updateStats(message.payload.stats);

    if (message.payload.isScanning) {
      this.resultsService.clearResults();
    }
  }

  private handleNewResult(message: NewResultMessage): void {
    this.resultsService.add(message.payload);
  }

  private handleUpdateResult(message: UpdateResultMessage): void {
    this.resultsService.update(message.payload);
  }

  private handleLog(message: LogMessage): void {
    this.logsService.add(message.payload.message);
  }

  private handleStatsUpdate(message: StatsUpdateMessage): void {
    this.statsService.updateStats(message.payload);
  }

  private handleScanEnd(): void {
    console.log('Scan completed');
  }
}
