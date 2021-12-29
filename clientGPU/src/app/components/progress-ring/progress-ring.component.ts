import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { animationFrameScheduler, of, timer } from 'rxjs';
import { repeat, takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-progress-ring',
  templateUrl: './progress-ring.component.html',
  styleUrls: ['./progress-ring.component.scss'],
})
export class ProgressRingComponent implements OnInit, OnChanges {
  @ViewChild('animated') animated!: ElementRef<SVGCircleElement>;
  @Input() radius = 0;
  @Input() stroke = 0;
  @Input() progress = 0;
  @Input() label = 'loading...';
  ringClosed = false;

  normalizedRadius = this.radius - this.stroke * 2;
  circumference = this.normalizedRadius * 2 * Math.PI;
  strokeDashoffset = this.circumference - (this.progress / 100) * this.circumference;

  constructor() {}

  ngOnInit(): void {
    this.normalizedRadius = this.radius - this.stroke * 2;
    this.circumference = this.normalizedRadius * 2 * Math.PI;
    this.strokeDashoffset = this.circumference - (this.progress / 100) * this.circumference;
  }

  ngOnChanges() {
    this.normalizedRadius = this.radius - this.stroke * 2;
    this.circumference = this.normalizedRadius * 2 * Math.PI;
    this.strokeDashoffset = this.circumference - (this.progress / 100) * this.circumference;
  }
}
