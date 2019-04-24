import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklytemperatureComponent } from './weeklytemperature.component';

describe('WeeklytemperatureComponent', () => {
  let component: WeeklytemperatureComponent;
  let fixture: ComponentFixture<WeeklytemperatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeeklytemperatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklytemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
