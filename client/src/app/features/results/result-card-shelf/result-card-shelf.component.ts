import { Component } from '@angular/core';
import { NpkillResult } from '../../../../../../shared/npkill-result.interface';
import { ResultCardComponent } from '../result-card/result-card.component';
import { ResultsService } from '../results.service';

@Component({
  selector: 'app-result-card-shelf',
  standalone: true,
  imports: [ResultCardComponent],
  templateUrl: './result-card-shelf.component.html',
  styleUrl: './result-card-shelf.component.scss',
})
export class ResultCardShelfComponent {
  constructor(private readonly resultsService: ResultsService) {}

  get results(): NpkillResult[] {
    return this.resultsService.results;
  }
}
