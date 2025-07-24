import { Injectable } from '@angular/core';
import { NpkillResult } from '../../../../../shared/npkill-result.interface';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
  private _results: NpkillResult[] = [];

  constructor() {}

  add(results: NpkillResult[]) {
    this._results = [...this._results, ...results];
  }

  update(result: NpkillResult) {
    const results = [...this._results];
    const index = results.findIndex((r) => r.path === result.path);
    results[index] = result;
    this._results = results;
  }

  clearResults(): void {
    this._results = [];
  }

  get results(): NpkillResult[] {
    return this._results;
  }
}
