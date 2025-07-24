import { Component, OnInit, signal } from '@angular/core';
import { SummaryService } from './summary.service';
import { CommonModule } from '@angular/common';
import { SummaryCardComponent } from './summary-card/summary-card.component';
import html2canvas from 'html2canvas';
import { SummaryOptionsComponent } from './summary-options/summary-options.component';
import { SummaryCardOptions } from './summary-card/summary-card.interface';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-summary',
  standalone: true,
  templateUrl: 'summary.component.html',
  styleUrls: ['summary.component.scss'],
  imports: [
    CommonModule,
    SummaryCardComponent,
    SummaryOptionsComponent,
    MatExpansionModule,
  ],
})
export class SummaryComponent implements OnInit {
  options = signal<SummaryCardOptions>({
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

  shouldAnimate = true;

  constructor(private readonly summaryService: SummaryService) {}

  ngOnInit() {}

  onOptionsChange(opt: Partial<SummaryCardOptions>) {
    this.options.set({ ...this.options(), ...opt });
  }

  export() {
    const card = document.querySelector('#summaryCard');
    if (!card) {
      return;
    }
    html2canvas(card as HTMLElement, { useCORS: true }).then((canvas) => {
      const link = document.createElement('a');
      const title = `npkill_${
        new Date().toISOString().split('T')[0]
      }_summary.png`;
      link.download = title;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
}
