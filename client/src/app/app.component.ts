import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from './features/sidenav/sidenav.component';
import { WsService } from './services/ws.service';
import { tap } from 'rxjs';
import { ResultsService } from './features/results/results.service';
import {
  NewResultMessage,
  UpdateResultMessage,
} from '../../../shared/websocket/websocket-messages.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Npkill';

  constructor(
    private readonly resultsService: ResultsService,
    private readonly ws: WsService
  ) {}

  ngOnInit() {
    this.ws
      .connect()
      .pipe(
        tap((message) => {
          console.log({ message });
          if (message.type === 'NEW_RESULT') {
            this.resultsService.add((message as NewResultMessage).payload);
          }

          if (message.type === 'UPDATE_RESULT') {
            this.resultsService.update(
              (message as UpdateResultMessage).payload
            );
          }
        })
      )
      .subscribe();
  }
}
