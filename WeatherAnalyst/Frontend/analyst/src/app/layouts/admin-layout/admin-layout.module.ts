import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { ThisWeekComponent } from '../thisweek/thisweek.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HeatmapComponent } from '../heatmap/heatmap.component';

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule
} from '@angular/material';

import { TemperatureChartComponent } from '../../components/temperature-chart/temperature-chart.component';
import { CurrentWeatherComponent } from '../current-weather/current-weather.component';
import { SoilChartComponent } from '../../components/soil-chart/soil-chart.component';
import { RainChartComponent } from 'src/app/components/rain-chart/rain-chart.component';
import { SoilMoistureComponent } from '../../components/soil-moisture/soil-moisture.component';
import { BarometerChartComponent } from '../../components/barometer/barometer.component';
import { WindSpeedChartComponent } from '../../components/wind-speed-chart/wind-speed-chart.component';
import { TemperatureHeatMapComponent } from 'src/app/components/temperature-heat-map/temperature-heat-map.component';
import { RainHeatMapComponent } from 'src/app/components/rain-heat-map/rain-heat-map.component';
import { SoilTempHeatMapComponent } from 'src/app/components/soil-temp-heat-map/soil-temp-heat-map.component';
import { SoilMoistureHeatMapComponent } from 'src/app/components/soil-moisture-heat-map/soil-moisture-heat-map.component';
import { WindHeatMapComponent } from 'src/app/components/wind-heat-map/wind-heat-map.component';
import { WindRoseComponent } from 'src/app/components/wind-rose/wind-rose.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    NgxChartsModule
  ],
  declarations: [
    HeatmapComponent,
    ThisWeekComponent,
    TemperatureChartComponent,
    CurrentWeatherComponent,
    SoilChartComponent,
    RainChartComponent,
    SoilMoistureComponent,
    BarometerChartComponent,
    WindSpeedChartComponent,
    TemperatureHeatMapComponent,
    RainHeatMapComponent,
    SoilTempHeatMapComponent,
    SoilMoistureHeatMapComponent,
    WindHeatMapComponent,
    WindRoseComponent
  ]
})

export class AdminLayoutModule {}
