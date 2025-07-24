import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatsService, StatsData } from './stats.service';
import { CommonModule } from '@angular/common';
import { HumanSizePipe } from '../../shared/directives/human-size.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, HumanSizePipe],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentStats: StatsData = {
    releasableSpace: 0,
    releasedSpace: 0,
    totalResults: 0,
    deletedResults: 0,
  };

  animatedReleasableSpace = 0;
  animatedReleasedSpace = 0;
  animatingReleasable = false;
  animatingReleased = false;

  constructor(private readonly statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.animateValueChange(stats);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private animateValueChange(newStats: StatsData): void {
    this.animateValue(
      this.animatedReleasableSpace,
      newStats.releasableSpace,
      (value) => {
        this.animatedReleasableSpace = value;
        this.animatingReleasable = true;
      },
      () => {
        this.animatingReleasable = false;
      }
    );

    this.animateValue(
      this.animatedReleasedSpace,
      newStats.releasedSpace,
      (value) => {
        this.animatedReleasedSpace = value;
        this.animatingReleased = true;
      },
      () => {
        this.animatingReleased = false;
      }
    );

    this.currentStats = newStats;
  }

  private animateValue(
    from: number,
    to: number,
    updateCallback: (value: number) => void,
    completeCallback: () => void
  ): void {
    const duration = 800;
    const startTime = performance.now();
    const difference = to - from;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + difference * easeOutCubic;

      updateCallback(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        completeCallback();
      }
    };

    requestAnimationFrame(animate);
  }

  get totalSpace(): number {
    return this.currentStats.releasableSpace + this.currentStats.releasedSpace;
  }

  get progressPercentage(): number {
    if (this.totalSpace === 0) return 0;
    return Math.round(
      (this.currentStats.releasedSpace / this.totalSpace) * 100
    );
  }

  get releasableSpace(): number {
    return this.animatedReleasableSpace;
  }

  get releasedSpace(): number {
    return this.animatedReleasedSpace;
  }
}
