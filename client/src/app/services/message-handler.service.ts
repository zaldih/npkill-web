import { Injectable } from '@angular/core';
import {
  OutgoingWsMessage,
  ServerStateMessage,
  NewResultMessage,
  UpdateResultMessage,
  LogMessage,
} from '../../../../shared/websocket';
import { AppStateService } from './app-state.service';
import { ResultsService } from '../features/results/results.service';
import { LogsService } from '../features/logs/logs.service';

@Injectable({
  providedIn: 'root',
})
export class MessageHandlerService {
  constructor(
    private readonly appStateService: AppStateService,
    private readonly resultsService: ResultsService,
    private readonly logsService: LogsService
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

      default:
        console.warn('Unknown message type:', message);
    }
  }

  private handleServerState(message: ServerStateMessage): void {
    this.appStateService.updateServerState(message.payload);
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
}
