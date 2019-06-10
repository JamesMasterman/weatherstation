import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoilMoistureHeatMapComponent } from './soil-moisture-heat-map.component';

describe('SoilMoistureHeatMapComponent', () => {
  let component: SoilMoistureHeatMapComponent;
  let fixture: ComponentFixture<SoilMoistureHeatMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoilMoistureHeatMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoilMoistureHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
