import { Component, OnInit, Input } from '@angular/core';
import { ChartMultiDataModel } from 'src/app/models/chart-multi-data-model';
import { WeatherserviceService } from 'src/app/services/weatherservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TemperatureModel } from 'src/app/models/temperature.model';
import { ChartDataModel } from 'src/app/models/chart-data-model';
import { DAYS_OF_WEEK, getOrdinalNum, MONTHS } from 'src/app/models/constants';
import { RainModel } from 'src/app/models/rain.model';

@Component({
  selector: 'app-rain-heat-map',
  templateUrl: './rain-heat-map.component.html',
  styleUrls: ['./rain-heat-map.component.scss']
})
export class RainHeatMapComponent implements OnInit {

  @Input()
  chartData: ChartMultiDataModel[];
  minRain: number;
  maxRain: number;
  wettestDay: string;
  firstDate: string;
  lastDate: string;

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getPeriodRain();
  }

  ngOnChanges(): void { }

  getPeriodRain(): void {
    this.rest.getQuarterRain(1).subscribe((data: RainModel[]) => {
      this.chartData = []
      var series = this.transformToHeatMapSeries(data);
      this.chartData = series;
    });
  }

  transformToHeatMapSeries(data: RainModel[]): ChartMultiDataModel[] {
    var dataSet: any[] = [];
    var dailyData: any[] = [];
    var dataIndex = 0;
    var maxRain = -100;
    var wettestDay = new Date();
    var startOfWeekDate = undefined;
    for (var dataIndex = 0; dataIndex < data.length;) {
      startOfWeekDate = undefined;
      for (var i = 0; i < 7; i++) {
        var record = data[dataIndex];
        var d = new Date(record.when_recorded);
        var oneDay: ChartDataModel;

        if (d.getDay() == i) {
          if (startOfWeekDate == undefined) {
            startOfWeekDate = d;
          }
          oneDay = new ChartDataModel(d, DAYS_OF_WEEK[i], record.todays_rain);
          if (record.todays_rain > maxRain) {
            maxRain = record.todays_rain;
            wettestDay = d;
          }

          dataIndex++;
          dailyData.push(oneDay);
        }

        if (dataIndex >= data.length) {
          break;
        }
      }

      var oneWeek = new ChartMultiDataModel(startOfWeekDate.getDate()  + "/" + (startOfWeekDate.getMonth()+1), dailyData.reverse());
      dataSet.push(oneWeek);
      dailyData = [];
    }

    if (data.length > 0) {
      var d = new Date(data[0].when_recorded);
      this.firstDate = getOrdinalNum(d.getDate()) + " of " + MONTHS[d.getMonth()];
      d = new Date(data[data.length - 1].when_recorded);
      this.lastDate = getOrdinalNum(d.getDate())  + " of " + MONTHS[d.getMonth()];
    }

    this.min = 0;
    this.max = maxRain;
    this.yscaleMin = 0;
    this.yscaleMax = maxRain;
    this.minRain = 0;
    this.maxRain = maxRain;
    this.wettestDay = DAYS_OF_WEEK[wettestDay.getDay()] + " " + getOrdinalNum(wettestDay.getDate()) + " of " + MONTHS[wettestDay.getMonth()];
    return dataSet;
  }

  // chart options
  min = 0;
  max = 40;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  roundDomains = true;
  yscaleMin = 0;
  yscaleMax = 30;
  xAxisTitle= "Week starting"

  colorScheme = {
    domain: ['#ffffff','#44CEF8', '#9EFDED','#21D010','#6BFE71','#CCFFD0','#FFFDD0','#FFFD3F','#FFCB63','#FBCDCE','#FD9BA2','#D23B48','#C70910']
  };

  onSelect(event) {
    console.log(event);
  }

}
