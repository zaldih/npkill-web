import { Injectable } from '@angular/core';
import { NpkillResult } from '../../../../../shared/npkill-result.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
  private _results: NpkillResult[] = [];
  private resultsSubject = new BehaviorSubject<NpkillResult[]>([]);

  public results$ = this.resultsSubject.asObservable();

  constructor() {}

  add(results: NpkillResult[]) {
    this._results = [...this._results, ...results];
    this.resultsSubject.next(this._results);
  }

  update(result: NpkillResult) {
    const results = [...this._results];
    const index = results.findIndex((r) => r.path === result.path);
    if (index !== -1) {
      results[index] = result;
      this._results = results;
      this.resultsSubject.next(this._results);
    }
  }

  delete(path: string): NpkillResult | null {
    const result = this._results.find((r) => r.path === path);
    if (result) {
      result.status = 'deleted';
      this.resultsSubject.next(this._results);
      return result;
    }
    return null;
  }

  clearResults(): void {
    this._results = [];
    this.resultsSubject.next(this._results);
  }

  get results(): NpkillResult[] {
    return this._results;
  }

  get liveResults(): NpkillResult[] {
    return this._results.filter((r) => r.status === 'live');
  }

  get deletedResults(): NpkillResult[] {
    return this._results.filter((r) => r.status === 'deleted');
  }
}
