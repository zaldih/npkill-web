import { Component } from '@angular/core';
import { ResultCardShelfComponent } from './result-card-shelf/result-card-shelf.component';
import { ResultToolbarComponent } from './results-toolbar/navbar.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [ResultCardShelfComponent, ResultToolbarComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {}
