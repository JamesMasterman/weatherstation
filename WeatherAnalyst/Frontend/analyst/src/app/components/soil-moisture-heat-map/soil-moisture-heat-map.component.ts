import { WeatherserviceService } from '../../services/weatherservice.service';
import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MONTHS, DAYS_OF_WEEK, getOrdinalNum, MONTHS_SHORT, TEMP_COLOUR_RANGE, MOISTURE_COLOUR_RANGE } from '../../models/constants';
import { ChartMultiDataModel } from 'src/app/models/chart-multi-data-model';
import { ChartDataModel } from 'src/app/models/chart-data-model';
import { SoilModel } from 'src/app/models/soil.model';

@Component({
  selector: 'app-soil-moisture-heat-map',
  templateUrl: './soil-moisture-heat-map.component.html',
  styleUrls: ['./soil-moisture-heat-map.component.scss']
})

export class SoilMoistureHeatMapComponent implements OnInit {

  @Input()
  chartData: ChartMultiDataModel[];
  lowMoisture: number;
  highMoisture: number;
  wettestDay: string;
  dryestDay: string;
  firstDate: string;
  lastDate: string;

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getPeriodSoil();
  }

  ngOnChanges(): void { }

  getPeriodSoil(): void {
    this.rest.getQuarterSoil(1).subscribe((data: SoilModel[]) => {
      this.chartData = []
      var series = this.transformToHeatMapSeries(data);
      this.chartData = series;
    });
  }

  transformToHeatMapSeries(data: SoilModel[]): ChartMultiDataModel[] {
    var dataSet: any[] = [];
    var dailyData: any[] = [];
    var dataIndex = 0;
    var minMoisture = 100;
    var maxMoisture = -100;
    var wetDay = new Date();
    var dryDay = new Date();
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
          oneDay = new ChartDataModel(d, DAYS_OF_WEEK[i], record.soil_moisture);

          if (record.soil_moisture < minMoisture) {
            minMoisture = record.soil_moisture;
            dryDay = d;
          }

          if (record.soil_moisture > maxMoisture) {
            maxMoisture = record.soil_moisture;
            wetDay = d;
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
 
    this.lowMoisture = minMoisture;
    this.highMoisture = maxMoisture;
    this.wettestDay = DAYS_OF_WEEK[wetDay.getDay()] + " " + getOrdinalNum(wetDay.getDate()) + " of " + MONTHS[wetDay.getMonth()];
    this.dryestDay = DAYS_OF_WEEK[dryDay.getDay()] + " " + getOrdinalNum(dryDay.getDate()) + " of " + MONTHS[dryDay.getMonth()];
    return dataSet;
  }

  // chart options
  min = 30;
  max = 100;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  roundDomains = true;
  yscaleMin = 30;
  yscaleMax = 100;
  xAxisTitle= "Week starting"

  colorScheme = {
    domain: MOISTURE_COLOUR_RANGE
  };

  onSelect(event) {
    console.log(event);
  }
}

