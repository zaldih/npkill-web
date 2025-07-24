import {
  Component,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NpkillResult } from '../../../../../../shared/npkill-result.interface';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { HumanSizePipe } from '../../../shared/directives/human-size.pipe';
import { CosmicBtnComponent } from '../../cosmic-btn/cosmic-btn.component';
import { SpriteAnimatorComponent } from '../../sprite-animator/sprite-animator.component';
import { WsService } from '../../../services/ws.service';
import { ResultsService } from '../results.service';

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
    SpriteAnimatorComponent,
  ],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.scss',
})
export class ResultCardComponent implements OnChanges, OnInit {
  result = input.required<NpkillResult>();

  @ViewChild(CosmicBtnComponent) cosmicBtn?: CosmicBtnComponent;

  projectParentPath: string = '';
  projectName: string = '';
  target: string = '';

  isDeleting = false;

  constructor(
    private readonly wsService: WsService,
    private readonly resultsService: ResultsService
  ) {}

  ngOnInit() {
    //    this.splitPath(this.result.path);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['result'] && this.result().path) {
      this.splitPath(this.result().path);

      if (
        changes['result'].currentValue?.status === 'deleted' &&
        changes['result'].previousValue?.status !== 'deleted'
      ) {
        if (this.cosmicBtn) {
          this.cosmicBtn.triggerDelete();
        }
      }
    }
  }

  remove() {
    if (this.isDeleting || this.result().status === 'deleted') return;

    this.isDeleting = true;
    const result = this.result();

    this.wsService.sendDeleteResult(result.path, result.size);
  }

  onDeleteComplete() {
    this.isDeleting = false;
  }
  get bigSizeImg(): string {
    return `/${'stu'}${'ff'}/${'oh'}-${'go'}${'d'}-${'why'}.p${'ng'}`;
  }

  private splitPath(path: string) {
    const parts = path.split('/').filter(Boolean);

    this.target = parts.length > 0 ? parts[parts.length - 1] : '';
    this.projectName = parts.length > 1 ? parts[parts.length - 2] : '';
    this.projectParentPath = parts.slice(0, parts.length - 2).join('/');
  }
}
