import { CommonModule } from '@angular/common';
import { Component, input, Input, OnInit } from '@angular/core';
import { SummaryCardOptions, SummaryData } from './summary-card.interface';
import { HumanSizePipe } from '../../../shared/directives/human-size.pipe';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss'],
  imports: [CommonModule, HumanSizePipe],
})
export class SummaryCardComponent implements OnInit {
  summary = input.required<SummaryData>();
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

  constructor() {}

  ngOnInit() {}
}
