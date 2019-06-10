import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MONTHS, DAYS_OF_WEEK, getOrdinalNum, MONTHS_SHORT, TEMP_COLOUR_RANGE, MS_TO_KMPH } from '../../models/constants';
import { ChartMultiDataModel } from 'src/app/models/chart-multi-data-model';
import { ChartDataModel } from 'src/app/models/chart-data-model';
import { WindModel } from 'src/app/models/wind.model';

@Component({
  selector: 'app-wind-heat-map',
  templateUrl: './wind-heat-map.component.html',
  styleUrls: ['./wind-heat-map.component.scss']
})

export class WindHeatMapComponent implements OnInit {

  @Input()
  chartData: ChartMultiDataModel[];
  minSpeed: number;
  maxSpeed: number;
  windiestDay: string;
  calmestDay: string;
  firstDate: string;
  lastDate: string;

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getPeriodTemperatures();
  }

  ngOnChanges(): void { }

  getPeriodTemperatures(): void {
    this.rest.getQuarterWind(1).subscribe((data: WindModel[]) => {
      this.chartData = []
      var series = this.transformToHeatMapSeries(data);
      this.chartData = series;
    });
  }

  transformToHeatMapSeries(data: WindModel[]): ChartMultiDataModel[] {
    var dataSet: any[] = [];
    var dailyData: any[] = [];
    var dataIndex = 0;
    var minSpeed = 1000;
    var maxSpeed = -100;
    var windiestDay = new Date();
    var calmestDay = new Date();
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
          oneDay = new ChartDataModel(d, DAYS_OF_WEEK[i], record.max_speed * MS_TO_KMPH);

          if (record.max_speed < minSpeed) {
            minSpeed = record.max_speed;
            calmestDay = d;
          }

          if (record.max_speed > maxSpeed) {
            maxSpeed = record.max_speed;
            windiestDay = d;
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
  
    this.minSpeed = minSpeed* MS_TO_KMPH;
    this.maxSpeed = maxSpeed* MS_TO_KMPH;
    this.windiestDay = DAYS_OF_WEEK[windiestDay.getDay()] + " " + getOrdinalNum(windiestDay.getDate()) + " of " + MONTHS[windiestDay.getMonth()];
    this.calmestDay = DAYS_OF_WEEK[calmestDay.getDay()] + " " + getOrdinalNum(calmestDay.getDate()) + " of " + MONTHS[calmestDay.getMonth()];
    return dataSet;
  }

  // chart options
  min = 0;
  max = 60;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  roundDomains = true;
  yscaleMin = 0;
  yscaleMax = 60;
  xAxisTitle= "Week starting"

  colorScheme = {
    domain: TEMP_COLOUR_RANGE
  };

  onSelect(event) {
    console.log(event);
  }
}

