import {
  Component,
  input,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NpkillResult } from '../../../../../../shared/npkill-result.interface';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { HumanSizePipe } from '../../../shared/directives/human-size.pipe';
import { CosmicBtnComponent } from '../../cosmic-btn/cosmic-btn.component';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatProgressBar,
    HumanSizePipe,
    CosmicBtnComponent,
    MatCardFooter,
  ],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.scss',
})
export class ResultCardComponent implements OnChanges, OnInit {
  result = input.required<NpkillResult>();

  projectParentPath: string = '';
  projectName: string = '';
  target: string = '';

  isDeleting = false;

  ngOnInit() {
    //    this.splitPath(this.result.path);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['result'] && this.result().path) {
      this.splitPath(this.result().path);
    }
  }

  remove() {
    this.isDeleting = true;
  }

  private splitPath(path: string) {
    const parts = path.split('/').filter(Boolean);

    this.target = parts.length > 0 ? parts[parts.length - 1] : '';
    this.projectName = parts.length > 1 ? parts[parts.length - 2] : '';
    this.projectParentPath = parts.slice(0, parts.length - 2).join('/');
  }
}
