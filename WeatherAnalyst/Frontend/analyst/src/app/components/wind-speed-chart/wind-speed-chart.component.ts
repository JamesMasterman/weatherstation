import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModelDate } from '../../models/chart-date-multi-data-model';
import { WindModel } from 'src/app/models/wind.model';
import { MS_TO_KMPH } from '../../models/constants';
import { DAYS_OF_WEEK } from '../../models/constants';

@Component({
  selector: 'app-wind-speed-chart',
  templateUrl: './wind-speed-chart.component.html',
  styleUrls: ['./wind-speed-chart.component.scss']
})

export class WindSpeedChartComponent implements OnInit {

  @Input()
  chartData: any[];
  strongestWind: number;
  windiestDay: string;
  dailyMaxWind: number[];
  periodDays: string[];

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getWeeklyWind();
  }

  getWeeklyWind(): void {
    this.rest.getLastWeekWind(1).subscribe((data: WindModel[]) => {
      this.chartData = []
      var series = ChartMultiDataModelDate.FromWindModel("wind", data);
      this.calculateMinMaxValues(data);
      this.chartData.push(series);
    });
  }

  calculateMinMaxValues(data: WindModel[]) {
    var windSpeed = 0
    var lastDay = -1
    var windiestDay = -1
    this.windiestDay = ""
    var periodDays: string[] = []
    var avgWindOnDay: number[] = [];

    var minWind = 1000;
    var maxWind = -1000;

    var avgWindAccum = 0;
    var avgWindCount = 0;

    if (data == undefined || data.length == 0)
      return;

    lastDay = new Date(data[0].when_recorded).getDay();
    data.forEach(function (wind: WindModel) {
      var d = new Date(wind.when_recorded);
      windSpeed = wind.speed * MS_TO_KMPH;
     
      avgWindAccum += windSpeed;
      avgWindCount ++;

      if(windSpeed < minWind){
        minWind = windSpeed;
      }

      if(windSpeed > maxWind){
        maxWind = windSpeed;
        windiestDay = d.getDay();
      }

      if (d.getDay() != lastDay) {
          periodDays.push(DAYS_OF_WEEK[lastDay]);
          avgWindOnDay.push(avgWindAccum/avgWindCount);
          avgWindAccum = 0;
          avgWindCount = 0;
      }

      lastDay = d.getDay();
    });

    //Final day
    periodDays.push(DAYS_OF_WEEK[lastDay]);
    avgWindOnDay.push(avgWindAccum/avgWindCount);

    if(windSpeed < minWind){
      minWind = windSpeed;
    }

    if(windSpeed > maxWind){
      maxWind = windSpeed;
      windiestDay = lastDay;
    }

    this.windiestDay = DAYS_OF_WEEK[windiestDay];
    this.periodDays = periodDays;
    this.strongestWind = maxWind;
    this.dailyMaxWind = avgWindOnDay;
    this.yscaleMin = Math.max(0, minWind - 1);
    this.yscaleMax = Math.max(10, maxWind + 1);
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
    domain: ['#5AA454']
  };

  onSelect(event) {
    console.log(event);
  }
}
