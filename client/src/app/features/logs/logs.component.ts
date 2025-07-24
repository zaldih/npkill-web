import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogsService } from './logs.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'logs.component.html',
})
export class LogsComponent {
  constructor(private readonly logsService: LogsService) {}

  get logs() {
    return this.logsService.logs;
  }
}
