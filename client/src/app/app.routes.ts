import { Routes } from '@angular/router';
import { ResultsComponent } from './features/results/results.component';
import { LogsComponent } from './features/logs/logs.component';
import { SummaryComponent } from './features/summary/summary.component';

export const routes: Routes = [
  {
    path: '',
    component: ResultsComponent,
  },
  {
    path: 'logs',
    component: LogsComponent,
  },
  {
    path: 'summary',
    component: SummaryComponent,
  },
];
