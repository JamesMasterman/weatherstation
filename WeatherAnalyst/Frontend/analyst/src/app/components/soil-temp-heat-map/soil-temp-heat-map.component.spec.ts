import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoilTempHeatMapComponent } from './soil-temp-heat-map.component';

describe('SoilTempHeatMapComponent', () => {
  let component: SoilTempHeatMapComponent;
  let fixture: ComponentFixture<SoilTempHeatMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoilTempHeatMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoilTempHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
