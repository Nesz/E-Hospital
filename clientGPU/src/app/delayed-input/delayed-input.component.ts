import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { fromEvent, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

@Component({
  selector: 'app-delayed-input',
  templateUrl: './delayed-input.component.html',
  styleUrls: ['./delayed-input.component.scss']
})
export class DelayedInputComponent implements AfterViewInit {
  @ViewChild('input') input!: ElementRef;

  @Input() placeholder!: string;

  @Output() onChange = new EventEmitter<string>();

  constructor() { }

  ngAfterViewInit() {
    fromEvent<InputEvent>(this.input?.nativeElement, 'input')
      .pipe(map((event: Event) => (event.target as HTMLInputElement).value))
      .pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .subscribe((data) => this.onChange.emit(data));
  }
}
