import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindSpeedChartComponent } from './wind-speed-chart.component';

describe('WindSpeedChartComponent', () => {
  let component: WindSpeedChartComponent;
  let fixture: ComponentFixture<WindSpeedChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindSpeedChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindSpeedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
