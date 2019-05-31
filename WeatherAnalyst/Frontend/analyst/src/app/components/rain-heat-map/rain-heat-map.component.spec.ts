import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RainHeatMapComponent } from './rain-heat-map.component';

describe('RainHeatMapComponent', () => {
  let component: RainHeatMapComponent;
  let fixture: ComponentFixture<RainHeatMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RainHeatMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RainHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
