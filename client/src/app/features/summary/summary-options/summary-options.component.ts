import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-summary-options',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  styles: `
    ul {
      list-style-type: none;
      padding: 0;
      margin:0;
    }`,
  template: `
    <div>
      <ul>
        <li *ngFor="let field of fields">
          <mat-checkbox
            type="checkbox"
            [checked]="visibility[field]"
            (change)="toggleField(field, $event.checked)"
          >
            {{ field }}
          </mat-checkbox>
        </li>
      </ul>
      <mat-form-field appearance="outline" style="width:100%;margin-top:1em;">
        <mat-label>Footer note</mat-label>
        <input matInput [formControl]="footerNoteControl" />
      </mat-form-field>
    </div>
  `,
})
export class SummaryOptionsComponent {
  @Output() optionsChange = new EventEmitter<
    Partial<import('../summary-card/summary-card.interface').SummaryCardOptions>
  >();
  fields = [
    'date',
    'releasableSpace',
    'releasedSpace',
    'totalResults',
    'itemsDeleted',
    'percentageHardDriveFreed',
  ];
  visibility: Record<string, boolean> = {
    date: true,
    releasableSpace: true,
    releasedSpace: true,
    totalResults: true,
    itemsDeleted: true,
    percentageHardDriveFreed: true,
  };
  footerNoteControl = new FormControl('');

  toggleField(field: string, checked: boolean) {
    this.visibility[field] = checked;
    this.emitOptions();
  }

  constructor() {
    this.footerNoteControl.valueChanges.subscribe((note) => {
      this.emitOptions();
    });
  }

  emitOptions() {
    this.optionsChange.emit({
      visibility: {
        date: !!this.visibility['date'],
        releasableSpace: !!this.visibility['releasableSpace'],
        releasedSpace: !!this.visibility['releasedSpace'],
        totalResults: !!this.visibility['totalResults'],
        itemsDeleted: !!this.visibility['itemsDeleted'],
        percentageHardDriveFreed: !!this.visibility['percentageHardDriveFreed'],
      },
      footerNote: this.footerNoteControl.value ?? '',
    });
  }
}
