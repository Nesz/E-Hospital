import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestableTableComponent } from './nestable-table.component';

describe('NestableTableComponent', () => {
  let component: NestableTableComponent;
  let fixture: ComponentFixture<NestableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NestableTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
