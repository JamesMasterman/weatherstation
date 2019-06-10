import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { RainModel } from '../../models/rain.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModelDate } from '../../models/chart-date-multi-data-model';
import { ChartDataModelDate } from 'src/app/models/chart-date-data-model';
import { DAYS_OF_WEEK } from 'src/app/models/constants';

@Component({
  selector: 'app-rain-chart',
  templateUrl: './rain-chart.component.html',
  styleUrls: ['./rain-chart.component.scss']
})

export class RainChartComponent implements OnInit {

  @Input()
  chartData: any[];
  totalRain: number;
  wettestDay: string;
  dailyRainTotal: number[];
  periodDays: string[];

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getWeeklyRain();
  }

  getWeeklyRain(): void {
    this.rest.getLastWeekRain(1).subscribe((data: RainModel[]) => {
      this.chartData = []
      var series = ChartMultiDataModelDate.FromRain("rain", data);
      this.calculateMinMaxValues(data);
      this.chartData.push(series);
    });
  }

  calculateMinMaxValues(data: RainModel[]) {
    var lastRain = 0
    var lastDay = -1
    var wettestDay = -1
    var maxRain = 0
    var periodDays: string[] = []
    var dailyRainTotal: number[] = [];
    var totalRain = 0;    

    if (data == undefined || data.length == 0)
      return;

    lastDay = new Date(data[0].when_recorded).getDay();

    //Loop over days in rain data to build summary table data
    data.forEach(function (value: RainModel) {
      var d = new Date(value.when_recorded);
      
      if (d.getDay() != lastDay) {
        periodDays.push(DAYS_OF_WEEK[lastDay]);
        dailyRainTotal.push(lastRain);
        totalRain += lastRain;      

        if (lastRain > maxRain) {
          maxRain = lastRain;
          wettestDay = lastDay; 
        }

        lastRain = 0;
      }

      lastRain += value.one_hr_rain;
      lastDay = d.getDay();      
    });

    //Final day
    periodDays.push(DAYS_OF_WEEK[lastDay]);
    dailyRainTotal.push(lastRain);
    totalRain += lastRain;

    if (lastRain > maxRain) {
      maxRain = lastRain;
      wettestDay = lastDay;
    }

    this.totalRain = totalRain;
    this.periodDays = periodDays;
    this.dailyRainTotal = dailyRainTotal;
    this.wettestDay = DAYS_OF_WEEK[wettestDay];
    this.yscaleMin = 0;
    this.yscaleMax = Math.max(10, this.totalRain + 0.1);
  }

  // chart options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  timeline = true;
  autoscale = true;
  roundDomains = true;
  yscaleMin = 0;
  yscaleMax = 10;

  colorScheme = {
    domain: ['#00acc1']
  };

  onSelect(event) {
    console.log(event);
  }
}
