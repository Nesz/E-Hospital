export class Progress {
  full: number;
  now: number;
  percentage = 0;

  constructor(full: number, now: number) {
    this.full = full;
    this.now = now;
    this.percentage = Math.ceil((now / full) * 100);
  }

  increment() {
    this.now++;
    this.percentage = Math.ceil((this.now / this.full) * 100);
  }
}
