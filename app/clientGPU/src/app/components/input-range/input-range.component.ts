import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: 'app-input-range',
  templateUrl: './input-range.component.html',
  styleUrls: ['./input-range.component.scss']
})
export class InputRangeComponent implements OnInit {

  @Input() min!: number;
  @Input() max!: number;
  @Input() step!: number;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() label!: string;
  @Output() onChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  onChange(event: Event) {
    const newValue = Number((event.target as HTMLInputElement).value);
    this.value = newValue;
    this.onChanged.emit(newValue);
  }
}
