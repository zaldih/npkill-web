import { Injectable } from '@angular/core';
import { LogEntry } from 'npkill';

@Injectable({ providedIn: 'root' })
export class LogsService {
  logs: LogEntry[] = [];

  constructor() {}

  add(entry: LogEntry[]): void {
    this.logs = [...this.logs, ...entry];
  }
}
