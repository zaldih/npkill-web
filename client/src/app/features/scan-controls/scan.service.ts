import { Injectable } from '@angular/core';
import { WsService } from '../../services/ws.service';
import { AppStateService } from '../../services/app-state.service';
import { ResultsService } from '../results/results.service';

interface ScanOptions {
  rootPath: string;
  excludePattern: string;
  targetDirs: string;
  excludeHidden: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScanService {
  private readonly ROOT_KEY = 'npkill_root_history';
  private readonly EXCLUDE_KEY = 'npkill_exclude_history';
  private readonly MAX_HISTORY_ITEMS = 10;

  private rootHistory: string[] = [];
  private excludeHistory: string[] = [];

  constructor(
    private readonly wsService: WsService,
    private readonly appStateService: AppStateService,
    private readonly resultsService: ResultsService
  ) {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      this.rootHistory = JSON.parse(
        localStorage.getItem(this.ROOT_KEY) || '[]'
      );
      this.excludeHistory = JSON.parse(
        localStorage.getItem(this.EXCLUDE_KEY) || '[]'
      );
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      this.rootHistory = [];
      this.excludeHistory = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.ROOT_KEY, JSON.stringify(this.rootHistory));
      localStorage.setItem(
        this.EXCLUDE_KEY,
        JSON.stringify(this.excludeHistory)
      );
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }

  getRootHistory(): string[] {
    return [...this.rootHistory];
  }

  getExcludeHistory(): string[] {
    return [...this.excludeHistory];
  }

  removeRootFromHistory(path: string): void {
    this.rootHistory = this.rootHistory.filter((p) => p !== path);
    this.saveHistory();
  }

  removeExcludeFromHistory(pattern: string): void {
    this.excludeHistory = this.excludeHistory.filter((p) => p !== pattern);
    this.saveHistory();
  }

  startScan(options: ScanOptions): void {
    if (!options.rootPath.trim()) {
      console.error('Root path is required to start scan');
      return;
    }

    this.resultsService.clearResults();
    this.updateHistory(options);
    this.appStateService.updateScanningStatus(true);

    const message = {
      type: 'START_SCAN' as const,
      payload: {
        rootPath: options.rootPath.trim(),
        targetDirs: this.parseCommaSeparatedString(options.targetDirs),
        excludePattern: this.parseCommaSeparatedString(options.excludePattern),
        excludeHidden: options.excludeHidden,
      },
    };

    this.wsService.sendMessage(message);
  }

  stopScan(): void {
    this.appStateService.updateScanningStatus(false);

    const message = {
      type: 'STOP_SCAN' as const,
      payload: null,
    };

    this.wsService.sendMessage(message);
  }

  private updateHistory(options: ScanOptions): void {
    if (options.rootPath && !this.rootHistory.includes(options.rootPath)) {
      this.rootHistory.unshift(options.rootPath);
      this.rootHistory = this.rootHistory.slice(0, this.MAX_HISTORY_ITEMS);
    }

    if (
      options.excludePattern &&
      !this.excludeHistory.includes(options.excludePattern)
    ) {
      this.excludeHistory.unshift(options.excludePattern);
      this.excludeHistory = this.excludeHistory.slice(
        0,
        this.MAX_HISTORY_ITEMS
      );
    }

    this.saveHistory();
  }

  private parseCommaSeparatedString(value: string): string[] {
    if (!value) return [];

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
