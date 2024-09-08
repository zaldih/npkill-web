import { Component } from '@angular/core';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    RouterModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatListModule,
    MatIcon,
    StatsComponent,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {}
