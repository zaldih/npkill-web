import { Routes } from '@angular/router';
import { ResultsComponent } from './features/results/results.component';
import { LogsComponent } from './features/logs/logs.component';

export const routes: Routes = [
  {
    path: '',
    component: ResultsComponent,
  },
  {
    path: 'logs',
    component: LogsComponent,
  },
];
