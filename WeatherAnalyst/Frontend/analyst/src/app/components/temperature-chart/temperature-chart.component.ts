import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { TemperatureModel } from '../../models/temperature.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModel } from '../../models/chart-multi-data-model';
import { ChartDataModel } from 'src/app/models/chart-data-model';

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
      this.rest.getLastWeekTemperature(1).subscribe((data: TemperatureModel[]) => {
        this.chartData = []
        var series  = new ChartMultiDataModel("temp",data);
        this.calculateMinMaxValues(series.series);
        this.chartData.push(series);
      });
    }

    calculateMinMaxValues(data: ChartDataModel[]){
      var min = 100;
      var max = -100;
      var hotDay = "";
      var coldDay = "";

      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      data.forEach(function(value:ChartDataModel){
        if(value.value > max){
          max  = value.value;
          var d = value.name;
          hotDay = days[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes();
        }

        if(value.value < min){
          min = value.value;
          var d = value.name;
          coldDay = days[d.getDay()] + " at " + d.getHours() + ":" + d.getMinutes();
        }
      });

      this.minTemp = min;
      this.maxTemp = max;
      this.hottestDay = hotDay;
      this.coldestDay = coldDay;
    }

    // chart options
    showXAxis = true;
    showYAxis = true;
    gradient = true;
    showLegend = false;
    timeline = true;
    autoscale = true;
    roundDomains = true;


    colorScheme = {
      domain: ['#5AA454']
    };

    onSelect(event) {
      console.log(event);
    }

 

}
