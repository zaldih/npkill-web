import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-cosmic-btn',
  imports: [CommonModule],
  template: ` <div
    #canvasContainer
    style="height:56px; border-radius: 12px; overflow: hidden;"
  >
    <canvas #canvas>Canvas not supported</canvas>
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

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Cannot get canvas.nativeElement context');
      return;
    }
    this.ctx = context;

    // Set up Intersection Observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isInView = entry.isIntersecting;
        if (this.isInView) {
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
    while (this.particles.length < 10) {
      const edge = Math.floor(Math.random() * 4);
      let x = 0,
        y = 0;

      if (edge === 0) {
        x = Math.random() * this.canvas.nativeElement.width;
        y = 0; // Top edge
      } else if (edge === 1) {
        x = this.canvas.nativeElement.width;
        y = Math.random() * this.canvas.nativeElement.height; // Right edge
      } else if (edge === 2) {
        x = Math.random() * this.canvas.nativeElement.width;
        y = this.canvas.nativeElement.height; // Bottom edge
      } else {
        x = 0;
        y = Math.random() * this.canvas.nativeElement.height; // Left edge
      }

      // Calculate the direction vector towards the center
      const directionX = this.centerOfCanvas.x - x;
      const directionY = this.centerOfCanvas.y - y;

      // Calculate the magnitude of the direction vector
      const magnitude = Math.sqrt(
        directionX * directionX + directionY * directionY
      );

      if (magnitude === 0) {
        continue;
      }

      // Normalize the direction vector
      const normalizedDirectionX = directionX / magnitude;
      const normalizedDirectionY = directionY / magnitude;

      // Scale the direction vector by a desired speed
      const speed = 2 + Math.random() * 3; // Adjust the speed as needed
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

      // Draw particles
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.closePath();

      // Remove particles when they reach the center
      if (
        Math.abs(particle.x - this.centerOfCanvas.x) < 5 &&
        Math.abs(particle.y - this.centerOfCanvas.y) < 5
      ) {
        this.particles.splice(index, 1);
      }
    });
  }

  private handleClick(): void {
    this.isClicked = true;
    this.text = ''; // Clear the text when clicked
  }
}
