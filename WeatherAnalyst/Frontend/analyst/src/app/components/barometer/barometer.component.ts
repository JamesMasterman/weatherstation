import { Component, OnInit, Input } from '@angular/core';
import { WeatherserviceService } from 'src/app/services/weatherservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TemperatureModel } from 'src/app/models/temperature.model';
import { ChartMultiDataModelDate } from 'src/app/models/chart-date-multi-data-model';
import { ChartDataModelDate } from 'src/app/models/chart-date-data-model';

@Component({
  selector: 'app-barometer-chart',
  templateUrl: './barometer.component.html',
  styleUrls: ['./barometer.component.scss']
})
export class BarometerChartComponent implements OnInit {

    @Input()
    chartData: any[];
    constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
      this.getWeeklyPressures();
    }

    ngOnChanges(): void {}

    getWeeklyPressures(): void {
      this.rest.getLastWeekAirTemperature(1).subscribe((data: TemperatureModel[]) => {
        this.chartData = []
        var series = ChartMultiDataModelDate.FromPressure("pressure", data);
        this.calculateMinMaxValues(series.series);
        this.chartData.push(series);
      });
    }

    calculateMinMaxValues(data: ChartDataModelDate[]){
      var min = 10000;
      var max = -10000;

      data.forEach(function(value:ChartDataModelDate){
        if(value.value > max){
          max  = value.value;
        }

        if(value.value < min && value.value > 0){
          min = value.value;
        }
      });

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
