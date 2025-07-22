import { Component, Input } from '@angular/core';
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
  @Input() search = '';
  constructor(private readonly resultsService: ResultsService) {}

  get filteredResults(): NpkillResult[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.resultsService.results;
    }

    return this.resultsService.results.filter((r) =>
      r.path.toLowerCase().includes(term)
    );
  }
}
