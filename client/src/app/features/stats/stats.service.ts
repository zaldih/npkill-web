import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private releasableSpace = 0;
  private releasedSpace = 0;
  private status = 'scanning';

  constructor() {}
}
