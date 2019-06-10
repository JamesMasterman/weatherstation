import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindHeatMapComponent } from './wind-heat-map.component';

describe('WindHeatMapComponent', () => {
  let component: WindHeatMapComponent;
  let fixture: ComponentFixture<WindHeatMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindHeatMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
