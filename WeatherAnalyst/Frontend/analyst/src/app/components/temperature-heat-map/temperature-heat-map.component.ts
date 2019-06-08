import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { TemperatureModel } from '../../models/temperature.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MONTHS, DAYS_OF_WEEK, getOrdinalNum, MONTHS_SHORT } from '../../models/constants';
import { ChartMultiDataModel } from 'src/app/models/chart-multi-data-model';
import { ChartDataModel } from 'src/app/models/chart-data-model';
@Component({
  selector: 'app-temperature-heat-map',
  templateUrl: './temperature-heat-map.component.html',
  styleUrls: ['./temperature-heat-map.component.scss']
})

export class TemperatureHeatMapComponent implements OnInit {

  @Input()
  chartData: ChartMultiDataModel[];
  minTemp: number;
  maxTemp: number;
  hottestDay: string;
  coldestDay: string;
  firstDate: string;
  lastDate: string;

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getPeriodTemperatures();
  }

  ngOnChanges(): void { }

  getPeriodTemperatures(): void {
    this.rest.getQuarterAirTemperatures(1).subscribe((data: TemperatureModel[]) => {
      this.chartData = []
      var series = this.transformToHeatMapSeries(data);
      this.chartData = series;
    });
  }

  transformToHeatMapSeries(data: TemperatureModel[]): ChartMultiDataModel[] {
    var dataSet: any[] = [];
    var dailyData: any[] = [];
    var dataIndex = 0;
    var minTemp = 100;
    var maxTemp = -100;
    var hotDay = new Date();
    var coldDay = new Date();
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
          oneDay = new ChartDataModel(d, DAYS_OF_WEEK[i], record.temperature);

          if (record.temperature < minTemp) {
            minTemp = record.temperature;
            coldDay = d;
          }

          if (record.temperature > maxTemp) {
            maxTemp = record.temperature;
            hotDay = d;
          }

          dataIndex++;
        }else{
          oneDay = new ChartDataModel(d, DAYS_OF_WEEK[i], 0);
        }

        dailyData.push(oneDay);

        if (dataIndex >= data.length) {
          break;
        }
      }

      var oneWeek = new ChartMultiDataModel(startOfWeekDate.getDate()  + "/" + MONTHS_SHORT[startOfWeekDate.getMonth()], dailyData.reverse());
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
    this.max = 40;
    this.yscaleMin = 0;
    this.yscaleMax = 40;
    this.minTemp = minTemp;
    this.maxTemp = maxTemp;
    this.hottestDay = DAYS_OF_WEEK[hotDay.getDay()] + " " + getOrdinalNum(hotDay.getDate()) + " of " + MONTHS[hotDay.getMonth()];
    this.coldestDay = DAYS_OF_WEEK[coldDay.getDay()] + " " + getOrdinalNum(coldDay.getDate()) + " of " + MONTHS[coldDay.getMonth()];
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
