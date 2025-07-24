import { Component } from '@angular/core';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { StatsComponent } from '../stats/stats.component';
import { ScanControlsComponent } from '../scan-controls/scan-controls.component';
import { ConnectionStatusComponent } from '../connection-status/connection-status.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    RouterModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatListModule,
    StatsComponent,
    ScanControlsComponent,
    ConnectionStatusComponent,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {}
