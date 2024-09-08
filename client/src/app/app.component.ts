import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResultCardComponent } from './features/results/result-card/result-card.component';
import { NavbarComponent } from './features/navbar/navbar.component';
import { SidenavComponent } from './features/sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ResultCardComponent,
    NavbarComponent,
    SidenavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'client';
}
