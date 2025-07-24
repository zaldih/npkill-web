import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface StatsData {
  releasableSpace: number;
  releasedSpace: number;
  totalResults: number;
  deletedResults: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private statsSubject = new BehaviorSubject<StatsData>({
    releasableSpace: 0,
    releasedSpace: 0,
    totalResults: 0,
    deletedResults: 0,
  });

  public stats$ = this.statsSubject.asObservable();

  constructor() {}

  updateStats(stats: StatsData): void {
    this.statsSubject.next(stats);
  }

  get currentStats(): StatsData {
    return this.statsSubject.value;
  }
}
