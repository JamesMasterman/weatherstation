import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureHeatMapComponent } from './temperature-heat-map.component';

describe('TemperatureHeatMapComponent', () => {
  let component: TemperatureHeatMapComponent;
  let fixture: ComponentFixture<TemperatureHeatMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemperatureHeatMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemperatureHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
