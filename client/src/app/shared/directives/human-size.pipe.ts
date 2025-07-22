import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanSize',
  standalone: true,
})
export class HumanSizePipe implements PipeTransform {
  transform(value: number): string {
    if (value < 1024) {
      return `${value} B`;
    } else if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    } else if (value < 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }
}
