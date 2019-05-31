import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { TemperatureModel } from '../../models/temperature.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModelDate } from '../../models/chart-date-multi-data-model';
import { ChartDataModelDate } from 'src/app/models/chart-date-data-model';
import { DAYS_OF_WEEK } from 'src/app/models/constants';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.css']
})

export class TemperatureChartComponent implements OnInit, OnChanges{

    @Input()
    chartData: any[];
    minTemp: number;
    maxTemp: number;
    hottestDay: string;
    coldestDay:string;

    constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
      this.getWeeklyTemperatures();
    }

    ngOnChanges(): void {}

    getWeeklyTemperatures(): void {
      this.rest.getLastWeekAirTemperature(1).subscribe((data: TemperatureModel[]) => {
        this.chartData = []
        var series = ChartMultiDataModelDate.FromTemperatureModel("temp", data);
        this.calculateMinMaxValues(series.series);
        this.chartData.push(series);
      });
    }

    calculateMinMaxValues(data: ChartDataModelDate[]){
      var min = 100;
      var max = -100;
      var hotDay = "";
      var coldDay = "";

      data.forEach(function(value:ChartDataModelDate){
        if(value.value > max){
          max  = value.value;
          var d = value.name;
          hotDay = DAYS_OF_WEEK[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes();
        }

        if(value.value < min){
          min = value.value;
          var d = value.name;
          coldDay = DAYS_OF_WEEK[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes();
        }
      });

      this.minTemp = min;
      this.maxTemp = max;
      this.hottestDay = hotDay;
      this.coldestDay = coldDay;
      this.yscaleMin = min - 1;
      this.yscaleMax = max + 1;
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
    yscaleMax = 30;

    colorScheme = {
      domain: ['#5AA454']
    };

    onSelect(event) {
      console.log(event);
    }

 

}
