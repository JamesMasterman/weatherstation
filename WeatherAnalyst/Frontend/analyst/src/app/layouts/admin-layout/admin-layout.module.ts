import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { ThisWeekComponent } from '../thisweek/thisweek.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule
} from '@angular/material';
import { TemperatureChartComponent } from 'src/app/components/temperature-chart/temperature-chart.component';
import { CurrentWeatherComponent } from '../current-weather/current-weather.component';

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
    ThisWeekComponent,
    TemperatureChartComponent,
    CurrentWeatherComponent
  ]
})

export class AdminLayoutModule {}
