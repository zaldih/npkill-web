import { Component, computed } from '@angular/core';
import { ResultCardShelfComponent } from './result-card-shelf/result-card-shelf.component';
import { ResultToolbarComponent } from './results-toolbar/navbar.component';
import { ScanningComponent } from '../scan-controls/scanning.component';
import { ScanControlsComponent } from '../scan-controls/scan-controls.component';
import { ResultsService } from './results.service';
import { AppStateService } from '../../services';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    ResultCardShelfComponent,
    ResultToolbarComponent,
    ScanningComponent,
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  search = '';

  isScanning = computed(() => this.appStateService.isScanning());

  constructor(
    private readonly appStateService: AppStateService,
    private readonly resultsService: ResultsService
  ) {}

  onSearchChanged(term: string) {
    this.search = term;
  }

  get haveResults(): boolean {
    return this.resultsService.results.length > 0;
  }
}
