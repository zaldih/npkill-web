import { Injectable, signal, computed } from '@angular/core';
import { ServerState } from '../../../../shared/app-state.interface';

export interface AppState extends ServerState {
  isConnected: boolean;
}

const DEFAULT_STATE: AppState = {
  isScanning: false,
  isConnected: false,
  settings: {
    rootPath: '',
    targetDirs: ['node_modules'],
    excludePattern: [],
    excludeHidden: true,
  },
  information: {
    userHomePath: '',
    npkillWebVersion: '',
  },
  storage: {
    initialDiskSize: 0,
  },
};

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private _state = signal<AppState>(DEFAULT_STATE);

  readonly state = this._state.asReadonly();
  readonly isConnected = computed(() => this._state().isConnected);
  readonly isScanning = computed(() => this._state().isScanning);
  readonly userHomePath = computed(
    () => this._state().information.userHomePath
  );
  readonly version = computed(() => this._state().information.npkillWebVersion);
  readonly settings = computed(() => this._state().settings);

  updateServerState(serverState: ServerState): void {
    this._state.update((current) => ({
      ...current,
      ...serverState,
    }));
  }

  updateConnectionStatus(isConnected: boolean): void {
    this._state.update((current) => ({
      ...current,
      isConnected,
    }));
  }

  updateScanningStatus(isScanning: boolean): void {
    this._state.update((current) => ({
      ...current,
      isScanning,
    }));
  }

  reset(): void {
    this._state.set({
      ...DEFAULT_STATE,
      isConnected: this._state().isConnected,
    });
  }
}
