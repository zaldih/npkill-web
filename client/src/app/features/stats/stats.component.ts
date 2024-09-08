import { Component } from '@angular/core';
import { StatsService } from './stats.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  constructor(private readonly statsService: StatsService) {}

  get releasableSpace(): number {
    return 0;
  }

  get releasedSpace(): number {
    return 0;
  }
}
