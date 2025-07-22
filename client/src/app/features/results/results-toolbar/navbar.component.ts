import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-result-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbar],
  template: `
    <mat-toolbar class="toolbar">
      // TODO Search, filters, etc
      <!-- <img src="/npkill-scope.svg" alt="npkill mini logo" /> -->
      <!-- <img src="/npkill-text-outlined.svg" alt="npkill text" />
  <span class="small-botton">web</span> -->
    </mat-toolbar>
  `,
})
export class ResultToolbarComponent {}
