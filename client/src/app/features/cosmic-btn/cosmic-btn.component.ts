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
  template: `<canvas #canvas>Canvas not supported</canvas>`,
})
export class CosmicBtnComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() text!: string;
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private icons: {
    x: number;
    y: number;
    size: number;
    dx: number;
    dy: number;
  }[] = [];
  private particles: {
    x: number;
    y: number;
    size: number;
    dx: number;
    dy: number;
  }[] = [];
  private isInView = false;
  private animationFrameId: number = 0;
  private isClicked = false; // To track if the button was clicked
  private observer!: IntersectionObserver;
  private binX = 0; // Initial position of the bin
  private binY = 25; // Y position of the bin

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Cannot get canvas.nativeElement context');
      return;
    }
    this.ctx = context;
    this.initIcons();

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
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  ngAfterViewInit(): void {
    this.setCanvasSize();
    window.addEventListener('resize', this.setCanvasSize.bind(this)); // Update size on window resize
    this.canvas.nativeElement.addEventListener(
      'click',
      this.handleClick.bind(this),
    ); // Add click listener
  }

  private initIcons(): void {
    for (let i = 0; i < 5; i++) {
      this.icons.push({
        x: Math.random() * this.canvas.nativeElement.width,
        y: Math.random() * this.canvas.nativeElement.height,
        size: 15 + Math.random() * 10,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
      });
    }
  }

  private setCanvasSize(): void {
    const parentWidth = this.el.nativeElement.offsetWidth;
    const parentStyles = window.getComputedStyle(this.el.nativeElement);
    const marginLeft = parseInt(parentStyles.paddingLeft, 10);
    const marginRight = parseInt(parentStyles.paddingRight, 10);
    const availableWidth = parentWidth - marginLeft - marginRight;
    this.canvas.nativeElement.width = availableWidth;
    this.canvas.nativeElement.height = availableWidth / 5;
  }

  private startAnimation(): void {
    const animate = () => {
      if (this.isClicked) {
        this.animateParticles(); // Animate particles
      }

      // Set background
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height,
      );

      // Draw floating folder icons
      this.icons.forEach((icon) => {
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.rect(icon.x, icon.y, icon.size, icon.size);
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
        this.ctx.closePath();

        icon.x += icon.dx;
        icon.y += icon.dy;

        // Bounce off the edges
        if (icon.x < 0 || icon.x > this.canvas.nativeElement.width - icon.size)
          icon.dx = -icon.dx;
        if (icon.y < 0 || icon.y > this.canvas.nativeElement.height - icon.size)
          icon.dy = -icon.dy;
      });

      if (!this.isClicked) {
        // Draw text in the middle if not clicked
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        const textWidth = this.ctx.measureText(this.text).width;
        this.ctx.fillText(
          this.text,
          (this.canvas.nativeElement.width - textWidth) / 2,
          this.canvas.nativeElement.height / 2,
        );
      }

      // Draw the bin (left side)
      this.ctx.fillStyle = 'gray';
      this.ctx.beginPath();
      this.ctx.rect(this.binX, this.binY, 30, 30);
      this.ctx.fill();
      this.ctx.closePath();

      this.animationFrameId = requestAnimationFrame(animate); // Continue animation
    };

    animate();
  }

  private animateParticles(): void {
    // Generate fast-moving small particles when clicked
    if (Math.random() < 0.1) {
      this.particles.push({
        x: this.canvas.nativeElement.width / 2,
        y: this.canvas.nativeElement.height / 2,
        size: 2 + Math.random() * 2,
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5,
      });
    }

    // Update particle positions
    this.particles.forEach((particle, index) => {
      // Attract particles to the center
      const dx = (this.canvas.nativeElement.width / 2 - particle.x) * 0.05;
      const dy = (this.canvas.nativeElement.height / 2 - particle.y) * 0.05;

      particle.x += dx;
      particle.y += dy;
      particle.size += 0.1; // Increase size to simulate folder

      // Draw particles (folders)
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.closePath();

      // Remove particles when they reach the center
      if (
        Math.abs(particle.x - this.canvas.nativeElement.width / 2) < 2 &&
        Math.abs(particle.y - this.canvas.nativeElement.height / 2) < 2
      ) {
        this.particles.splice(index, 1);
      }
    });

    // Move bin to center
    if (this.binX < this.canvas.nativeElement.width / 2 - 15) {
      this.binX += 2; // Speed of bin movement
    }
    if (this.binY < this.canvas.nativeElement.height / 2 - 15) {
      this.binY += 2; // Speed of bin movement
    }
  }

  private handleClick(): void {
    this.isClicked = true;
    this.text = ''; // Clear the text when clicked
  }
}
