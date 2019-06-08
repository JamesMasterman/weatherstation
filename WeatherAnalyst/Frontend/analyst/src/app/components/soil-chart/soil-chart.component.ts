import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { SoilModel } from '../../models/soil.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModelDate } from '../../models/chart-date-multi-data-model';
import { ChartDataModelDate } from 'src/app/models/chart-date-data-model';

@Component({
  selector: 'app-soil-chart',
  templateUrl: './soil-chart.component.html',
  styleUrls: ['./soil-chart.component.scss']
})
export class SoilChartComponent implements OnInit {

  @Input()
  chartData: any[];
  minTemp: number;
  maxTemp: number;
  hottestDay:Date;
  coldestDay:Date;

  constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getWeeklyTemperatures();
  }

  getWeeklyTemperatures(): void {
    this.rest.getLastWeekSoil(1).subscribe((data: SoilModel[]) => {
      this.chartData = []
      var series = ChartMultiDataModelDate.FromSoilTemperatureModel("temp", data);
      this.calculateMinMaxValues(series.series);
      this.chartData.push(series);
    });
  }

  calculateMinMaxValues(data: ChartDataModelDate[]){
    var min = 100;
    var max = -100;
    var hotDay:Date;
    var coldDay:Date;

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    data.forEach(function(value:ChartDataModelDate){
      if(value.value > max){
        max  = value.value;
        var d = value.name;
        hotDay = d;
      }

      if(value.value < min){
        min = value.value;
        var d = value.name;
        coldDay = d;
      }
    });

    this.minTemp = min;
    this.maxTemp = max;
    this.hottestDay = hotDay;
    this.coldestDay = coldDay;
    this.yscaleMin = min - 0.1;
    this.yscaleMax = max + 0.1;
  }

  // chart options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  timeline = true;
  autoscale = true;
  roundDomains = true;
  yscaleMin = 20;
  yscaleMax = 25;

  colorScheme = {
    domain: ['#5AA454']
  };

  onSelect(event) {
    console.log(event);
  }
}
