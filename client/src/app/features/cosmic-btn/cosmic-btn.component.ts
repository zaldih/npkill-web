import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { SpriteAnimatorComponent } from '../sprite-animator/sprite-animator.component';

@Component({
  standalone: true,
  selector: 'app-cosmic-btn',
  imports: [CommonModule, SpriteAnimatorComponent],
  styleUrls: ['./cosmic-btn.component.scss'],
  template: ` <div class="root">
    @if(dissapearBanner) {
    <div class="deleted-text">Deleted</div>
    }

    <div
      #canvasContainer
      class="canvas-container"
      [ngClass]="{ dissapear: dissapearBanner }"
    >
      @if(particleGeneration) {
      <div class="deleting-text">
        <div>Deleting...</div>
      </div>
      }

      <div>
        <div class="black-hole" [ngClass]="{ sseccretsecccret }">
          <app-sprite-animator
            [tileImage]="'/black hole tile.png'"
            [tileWidth]="96"
            [numberOfTiles]="19"
            [size]="100"
            [fps]="12"
            [reverse]="true"
            *ngIf="!sseccretsecccret"
          />
        </div>
        <canvas #canvas>Canvas not supported</canvas>
      </div>
    </div>
  </div>`,
})
export class CosmicBtnComponent implements OnInit, OnDestroy {
  @Input() text!: string;
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true })
  private canvasContainer!: ElementRef<HTMLDivElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: {
    x: number;
    y: number;
    size: number;
    dx: number;
    dy: number;
  }[] = [];
  private isInView = false;
  private animationFrameId = 0;
  private isClicked = false;
  private observer!: IntersectionObserver;
  private centerOfCanvas = {
    x: 0,
    y: 0,
  };
  particleGeneration = false;

  blackHoleOffset = 0;
  dissapearBanner = false;

  sseccretsecccret =
    Math.random() < (new Date().getDay() === 1 ? 0.025 : 0.005);

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.dissapear();
    }, Math.random() * 1000 + 8000);
    setInterval(() => {
      const tileWidth = 96;
      const numberOfTiles = 18;
      const totalTilesetWidth = numberOfTiles * tileWidth;
      this.blackHoleOffset = this.blackHoleOffset + tileWidth;

      if (this.blackHoleOffset > 0) {
        this.blackHoleOffset =
          -totalTilesetWidth + (this.blackHoleOffset % totalTilesetWidth);
      }
    }, 100);
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Cannot get canvas.nativeElement context');
      return;
    }
    this.ctx = context;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isInView = entry.isIntersecting;
        if (this.isInView) {
          setTimeout(() => {
            this.particleGeneration = true;
          }, 300);
          this.startAnimation();
        } else {
          cancelAnimationFrame(this.animationFrameId);
        }
      });
    });

    this.observer.observe(this.canvas.nativeElement);

    this.setCanvasSize();
    window.addEventListener('resize', this.setCanvasSize.bind(this)); // Update size on window resize
    this.canvas.nativeElement.addEventListener(
      'click',
      this.handleClick.bind(this)
    );
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    cancelAnimationFrame(this.animationFrameId);
  }

  dissapear(): void {
    this.particleGeneration = false;
    setTimeout(() => {
      this.dissapearBanner = true;
    }, 1000);
  }

  private setCanvasSize(): void {
    const parentWidth = this.canvasContainer.nativeElement.offsetWidth;
    const parentHeight = this.canvasContainer.nativeElement.offsetHeight;
    this.canvas.nativeElement.width = parentWidth;
    this.canvas.nativeElement.height = parentHeight;
    this.centerOfCanvas = {
      x: this.canvas.nativeElement.width / 2,
      y: this.canvas.nativeElement.height / 2,
    };
  }

  private startAnimation(): void {
    const animate = () => {
      this.ctx.clearRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );

      // Set background
      this.ctx.fillStyle = '#ff6961';
      this.ctx.fillRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );

      this.animateParticles();

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private animateParticles(): void {
    while (this.particleGeneration && this.particles.length < 10) {
      let x = 0;
      let y = 0;

      x = this.canvas.nativeElement.width;
      y = Math.random() * this.canvas.nativeElement.height; // Right edge

      const directionX = 0 - x;
      const directionY = this.centerOfCanvas.y - y;

      const magnitude = Math.sqrt(
        directionX * directionX + directionY * directionY
      );

      if (magnitude === 0) {
        continue;
      }

      const normalizedDirectionX = directionX / magnitude;
      const normalizedDirectionY = directionY / magnitude;

      const speed = 2 + Math.random() * 3;
      const dx = normalizedDirectionX * speed;
      const dy = normalizedDirectionY * speed;

      this.particles.push({
        x: x,
        y: y,
        size: 1 + Math.random() * 2,
        dx: dx,
        dy: dy,
      });
    }

    this.particles.forEach((particle, index) => {
      particle.x += particle.dx;
      particle.y += particle.dy;

      // const distanceX = particle.x - this.centerOfCanvas.x;
      // const distanceY = particle.y - this.centerOfCanvas.y;
      // const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Draw particles
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.closePath();

      if (particle.x < 5) {
        this.particles.splice(index, 1);
      }
    });
  }

  private handleClick(): void {
    this.isClicked = true;
    this.text = '';
  }
}
