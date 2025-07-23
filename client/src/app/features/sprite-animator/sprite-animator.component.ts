import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-sprite-animator',
  standalone: true,
  imports: [CommonModule],
  styles: `
    :host {
      display: inline-block;
    }
    .sprite {
      display: block;
      image-rendering: pixelated;
      background-repeat: no-repeat;
      background-position-x: 0;
      animation-name: sprite-animation;
      animation-iteration-count: infinite;
    }
    @keyframes sprite-animation {
      from {
        background-position-x: 0;
      }
      to {
        background-position-x: var(--end-position);
      }
    }
  `,
  template: ` <div class="sprite" [ngStyle]="spriteStyle()"></div> `,
})
export class SpriteAnimatorComponent {
  tileImage = input.required<string>();
  size = input.required<number>();
  tileWidth = input.required<number>();
  fps = input.required<number>();
  numberOfTiles = input.required<number>();
  reverse = input(false);

  spriteStyle = computed(() => {
    const scale = this.size() / this.tileWidth();
    const width = `${this.size()}px`;
    const height = `${this.size()}px`;

    const totalTilesetWidth = this.tileWidth() * this.numberOfTiles();
    const scaledTilesetWidth = totalTilesetWidth * scale;
    const duration = `${(this.numberOfTiles() / this.fps()).toFixed(2)}s`;

    return {
      width,
      height,
      backgroundImage: `url('${this.tileImage()}')`,
      backgroundSize: `${scaledTilesetWidth}px ${this.size()}px`,
      animationDuration: duration,
      animationTimingFunction: `steps(${this.numberOfTiles()})`,
      animationDirection: this.reverse() ? 'reverse' : 'normal',
      '--end-position': `-${scaledTilesetWidth}px`,
    };
  });
}
