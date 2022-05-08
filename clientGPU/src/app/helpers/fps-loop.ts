export class FpsLoop {

  private fps: number;
  private callback: any;
  private delay: number;
  private time: number | null = null;
  private frame = -1;
  private taskReference: any;
  public isPlaying = false;

  constructor(fps: number, callback: any) {
    this.fps = fps;
    this.callback = callback;
    this.delay = 1000 / this.fps;
  }

  private loop = (timestamp: number) => {
    if (this.time === null) {
      this.time = timestamp;
    }
    const seg = Math.floor((timestamp - this.time) / this.delay);
    if (seg > this.frame) {
      this.frame = seg;
      this.callback({
        time: timestamp,
        frame: this.frame
      })
    }
    this.taskReference = requestAnimationFrame(this.loop)
  }

  changeFPS = (fps: number) => {
    this.fps = fps;
    this.frame = -1;
    this.time = null;
    this.delay = 1000 / this.fps;
  };

  start = () => {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.taskReference = requestAnimationFrame(this.loop);
    }
  };

  stop = () => {
    if (this.isPlaying) {
      cancelAnimationFrame(this.taskReference);
      this.isPlaying = false;
      this.time = null;
      this.frame = -1;
    }
  };

}
