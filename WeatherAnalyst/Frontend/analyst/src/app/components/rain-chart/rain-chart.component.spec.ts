import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RainChartComponent } from './rain-chart.component';

describe('RainChartComponent', () => {
  let component: RainChartComponent;
  let fixture: ComponentFixture<RainChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RainChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RainChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
