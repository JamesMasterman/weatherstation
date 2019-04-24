import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeeklyTemperatureComponent } from './weeklytemperature/weeklytemperature.component';
import {TemperatureChartComponent } from './temperature-chart/temperature-chart.component';

const routes: Routes = [
  {
    path: 'temperature/lastweek/:id',
    component: WeeklyTemperatureComponent,
    data: { title: 'Weekly Temperature' }
  },
  {
    path: 'temperature/lastweek/:id',
    component: TemperatureChartComponent,
    data: { title: 'Weekly Temperature' }
  },
  { path: '',
    redirectTo: '/temperature/lastweek/1', 
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
