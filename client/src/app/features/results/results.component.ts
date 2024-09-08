import { Component } from '@angular/core';
import { ResultCardShelfComponent } from './result-card-shelf/result-card-shelf.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [ResultCardShelfComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {}
