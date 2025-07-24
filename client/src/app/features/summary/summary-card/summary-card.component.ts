import { CommonModule } from '@angular/common';
import { Component, input, computed, OnInit, Signal } from '@angular/core';
import { SummaryCardOptions, SummaryData } from './summary-card.interface';
import { HumanSizePipe } from '../../../shared/directives/human-size.pipe';
import { AppStateService } from '../../../services/app-state.service';
import { StatsService } from '../../stats/stats.service';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss'],
  imports: [CommonModule, HumanSizePipe],
})
export class SummaryCardComponent implements OnInit {
  options = input<SummaryCardOptions>({
    visibility: {
      date: true,
      releasableSpace: true,
      releasedSpace: true,
      totalResults: true,
      itemsDeleted: true,
      percentageHardDriveFreed: true,
    },
    footerNote: '',
  });

  now = new Date();
  version = computed(() => this.appStateService.version());

  summary: Signal<SummaryData> = computed(() => {
    const stats = this.statsService.currentStats;
    const serverState = this.appStateService.state();

    let percentageHardDriveFreed = 0;
    if (serverState.storage.initialDiskSize > 0 && stats.releasedSpace > 0) {
      percentageHardDriveFreed =
        Math.round(
          (stats.releasedSpace / serverState.storage.initialDiskSize) *
            100 *
            100
        ) / 100;
    }

    return {
      releasableSpace: stats.releasableSpace,
      releasedSpace: stats.releasedSpace,
      totalResults: stats.totalResults,
      itemsDeleted: stats.deletedResults,
      percentageHardDriveFreed: percentageHardDriveFreed,
    };
  });

  constructor(
    private appStateService: AppStateService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {}
}
