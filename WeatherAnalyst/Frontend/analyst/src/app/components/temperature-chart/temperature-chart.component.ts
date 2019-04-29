import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { TemperatureModel } from '../../models/temperature.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartMultiDataModel } from '../../models/chart-multi-data-model';

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.css']
})

export class TemperatureChartComponent implements OnInit, OnChanges{

    @Input()
    chartData: any[];

    constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
      this.getWeeklyTemperatures();
    }

    ngOnChanges(): void {}

    getWeeklyTemperatures(): void {
      this.rest.getLastWeekTemperature(1).subscribe((data: TemperatureModel[]) => {
        this.chartData = []
        var series  = new ChartMultiDataModel("temp",data);
        this.chartData.push(series);
      });
    }

    // chart options
    ChartWidth = 700;
    ChartHeight = 300;
    view: any[] = [this.ChartWidth, this.ChartHeight];
    showXAxis = true;
    showYAxis = true;
    gradient = true;
    showLegend = false;
    showXAxisLabel = true;
    xAxisLabel = 'Date';
    showYAxisLabel = true;
    yAxisLabel = 'Temperature (C)';
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
