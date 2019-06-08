import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { SoilModel } from '../../models/soil.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModelDate } from '../../models/chart-date-multi-data-model';
import { ChartDataModelDate } from 'src/app/models/chart-date-data-model';

@Component({
  selector: 'app-soil-moisture-chart',
  templateUrl: './soil-moisture.component.html',
  styleUrls: ['./soil-moisture.component.scss']
})
export class SoilMoistureComponent implements OnInit {

  @Input()
  chartData: any[];
  minMoisture: number;
  maxMoisture: number;
  dryestDay: Date;
  wettestDay:Date;

  constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getWeeklySoilMoisture();
  }

  getWeeklySoilMoisture(): void {
    this.rest.getLastWeekSoil(1).subscribe((data: SoilModel[]) => {
      this.chartData = []
      var series = ChartMultiDataModelDate.FromSoilMoistureModel("moisture", data);
      this.calculateMinMaxValues(series.series);
      this.chartData.push(series);
    });
  }

  calculateMinMaxValues(data: ChartDataModelDate[]){
    var min = 100;
    var max = -100;
    var dryDay:Date;
    var wetDay:Date;

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    data.forEach(function(value:ChartDataModelDate){
      if(value.value > max){
        max  = value.value;
        var d = value.name;
        wetDay = d;
      }

      if(value.value < min){
        min = value.value;
        var d = value.name;
        dryDay = d;
      }
    });

    this.minMoisture = min;
    this.maxMoisture = max;
    this.dryestDay = dryDay;
    this.wettestDay = wetDay;
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
  yscaleMin = 50;
  yscaleMax = 100;

  colorScheme = {
    domain: ['#5AA454']
  };

  onSelect(event) {
    console.log(event);
  }
}
