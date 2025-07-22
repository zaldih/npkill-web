import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-result-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbar,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <mat-toolbar class="toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search</mat-label>
        <input matInput type="text" [(ngModel)]="search" (input)="onSearch()" />
      </mat-form-field>
    </mat-toolbar>
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .search-field {
        min-width: 300px;
        flex: 1;
      }
    `,
  ],
})
export class ResultToolbarComponent {
  search = '';
  @Output() searchChanged = new EventEmitter<string>();

  onSearch() {
    this.searchChanged.emit(this.search);
  }
}
