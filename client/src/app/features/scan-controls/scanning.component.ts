import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { SpriteAnimatorComponent } from '../sprite-animator/sprite-animator.component';

@Component({
  selector: 'app-scanning',
  standalone: true,
  imports: [CommonModule, SpriteAnimatorComponent],
  styles: `
        .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        background-color: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #4caf50;
      }
      
      .big-indicator{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        gap: 12px;
        color: #08080850;
        width: 100%;
        height: 100%;
      }
      `,
  template: `
    @if(isBanner()) {
    <div class="banner">
      <app-sprite-animator
        [tileImage]="'/rocket/rocket-firing.png'"
        [tileWidth]="32"
        [size]="24"
        [numberOfTiles]="15"
        [fps]="10"
      />
      Searching...
    </div>
    } @else {
    <div class="big-indicator">
      <app-sprite-animator
        [tileImage]="'/rocket/rocket-firing.png'"
        [tileWidth]="32"
        [size]="120"
        [numberOfTiles]="15"
        [fps]="10"
      />

      Searching...
    </div>
    }
  `,
})
export class ScanningComponent {
  isBanner = input(false);
}
