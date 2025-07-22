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
    style="height:48px; border-radius: 12px; overflow: hidden; position: relative;"
  >
    <div
      style="width: 96px; height: 96px; display:inline-block; background-image: url('/black hole tile.png');image-rendering: pixelated; position: absolute; top: -22px; left: -48px;
    background-size: cover;
      "
      [ngStyle]="{
        backgroundPositionX: blackHoleOffset + 'px'
      }"
    ></div>
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

  blackHoleOffset = 0;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    setInterval(() => {
      const tileWidth = 96;
      const numberOfTiles = 18;
      const totalTilesetWidth = numberOfTiles * tileWidth; // Esto es 900 en tu caso

      // Mueve 24px a la derecha
      this.blackHoleOffset = this.blackHoleOffset + tileWidth;

      // Si el offset es >= 0, significa que ha llegado al final del ciclo (o lo ha pasado),
      // entonces lo reseteamos al inicio del rango negativo.
      if (this.blackHoleOffset > 0) {
        this.blackHoleOffset =
          -totalTilesetWidth + (this.blackHoleOffset % totalTilesetWidth);
        // O una versión más simple si sabemos que solo se va a pasar por poco:
        // this.blackHoleOffset = -totalTilesetWidth + this.blackHoleOffset;
      }
    }, 100);
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
      let x = 0;
      let y = 0;

      x = this.canvas.nativeElement.width;
      y = Math.random() * this.canvas.nativeElement.height; // Right edge

      // Calculate the direction vector towards the center
      const directionX = 0 - x;
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

      // const distanceX = particle.x - this.centerOfCanvas.x;
      // const distanceY = particle.y - this.centerOfCanvas.y;
      // const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Draw particles
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.closePath();

      // Remove particles when they reach the center
      if (particle.x < 5) {
        this.particles.splice(index, 1);
      }
    });
  }

  private handleClick(): void {
    this.isClicked = true;
    this.text = ''; // Clear the text when clicked
  }
}
