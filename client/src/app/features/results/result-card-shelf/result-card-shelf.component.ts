import { Component } from '@angular/core';
import { Result } from '../result.interface';
import { ResultCardComponent } from '../result-card/result-card.component';

@Component({
  selector: 'app-result-card-shelf',
  standalone: true,
  imports: [ResultCardComponent],
  templateUrl: './result-card-shelf.component.html',
  styleUrl: './result-card-shelf.component.scss',
})
export class ResultCardShelfComponent {
  results: Result[] = [
    {
      path: '../projects/awesome-project/node_modules',
      size: -1,
      modificationTime: -1,
      isDangeroud: false,
      status: 'live',
    },
  ];
}
