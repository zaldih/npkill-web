import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { effect } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ScanService } from './scan.service';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-scan-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: 'scan-controls.component.html',
})
export class ScanControlsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  private destroy$ = new Subject<void>();

  rootHistory = signal<string[]>([]);
  excludeHistory = signal<string[]>([]);

  isScanning = computed(() => this.appStateService.isScanning());
  isConnected = computed(() => this.appStateService.isConnected());
  userHomePath = computed(() => this.appStateService.userHomePath());

  constructor(
    private fb: FormBuilder,
    private scanService: ScanService,
    private appStateService: AppStateService
  ) {
    this.form = this.fb.group({
      rootPath: ['', Validators.required],
      excludePattern: ['.git'],
      targetDirs: ['node_modules', Validators.required],
      excludeHidden: [true],
    });

    effect(() => {
      if (this.isScanning()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });

    effect(() => {
      const homePath = this.userHomePath();
      if (homePath && !this.form.get('rootPath')?.value) {
        this.form.patchValue({ rootPath: homePath });
      }
    });
  }

  ngOnInit(): void {
    this.loadHistory();
    this.subscribeToAppState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startScan(): void {
    if (this.form.invalid || !this.isConnected()) {
      return;
    }

    const { rootPath, excludePattern, targetDirs, excludeHidden } =
      this.form.value;

    this.scanService.startScan({
      rootPath,
      excludePattern,
      targetDirs,
      excludeHidden,
    });
  }

  stopScan(): void {
    this.scanService.stopScan();
  }

  removeFromRootHistory(path: string): void {
    this.scanService.removeRootFromHistory(path);
    this.loadHistory();
  }

  removeFromExcludeHistory(pattern: string): void {
    this.scanService.removeExcludeFromHistory(pattern);
    this.loadHistory();
  }

  get canStartScan(): boolean {
    return this.form.valid && this.isConnected() && !this.isScanning();
  }

  get canStopScan(): boolean {
    return this.isConnected() && this.isScanning();
  }

  private loadHistory(): void {
    this.rootHistory.set(this.scanService.getRootHistory());
    this.excludeHistory.set(this.scanService.getExcludeHistory());
  }

  private subscribeToAppState(): void {
    effect(
      () => {
        const isScanning = this.appStateService.isScanning();
        if (isScanning && this.form.enabled) {
          this.form.disable();
        } else if (!isScanning && this.form.disabled) {
          this.form.enable();
        }
      },
      { allowSignalWrites: true }
    );
  }
}
