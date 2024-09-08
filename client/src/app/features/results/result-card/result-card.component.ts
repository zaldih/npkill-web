import {
  Component,
  input,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NpkillResult } from '../../../../../../shared/npkill-result.interface';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { HumanSizePipe } from '../../../shared/directives/human-size.pipe';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatButton,
    MatFabButton,
    MatProgressBar,
    HumanSizePipe,
  ],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.scss',
})
export class ResultCardComponent implements OnChanges, OnInit {
  result = input.required<NpkillResult>();

  projectParentPath: string = '';
  projectName: string = '';
  target: string = '';

  ngOnInit() {
    //    this.splitPath(this.result.path);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['result'] && this.result().path) {
      this.splitPath(this.result().path);
    }
  }

  private splitPath(path: string) {
    const parts = path.split('/').filter(Boolean);

    this.target = parts.length > 0 ? parts[parts.length - 1] : '';
    this.projectName = parts.length > 1 ? parts[parts.length - 2] : '';
    this.projectParentPath = parts.slice(0, parts.length - 2).join('/');
  }
}
