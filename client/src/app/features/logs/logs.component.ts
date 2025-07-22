import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { WsService } from '../../services/ws.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'logs.component.html',
})
export class LogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private readonly ws: WsService) {}

  ngOnInit() {
    this.ws.connect().subscribe((msg: any) => {
      if (Array.isArray(msg.payload) && msg.type === 'LOG') {
        this.logs = msg.payload;
      } else if (msg.type === 'LOG') {
        this.logs = [...this.logs, msg.payload];
      }
    });
  }
}
