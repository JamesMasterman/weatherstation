import { Component, OnInit, OnChanges } from '@angular/core';
import { WeatherserviceService } from 'src/app/services/weatherservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DailySummaryModel } from 'src/app/models/dailysummary.model';

@Component({
  selector: 'app-current-weather',
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.scss']
})

export class CurrentWeatherComponent implements OnInit, OnChanges{
  weatherSummary: DailySummaryModel = {
    temp_max: 0,
    temp_min: 0,
    avg_humidity: 0,
    total_rain: 0,
    soil_temp: 0,
    soil_moist: 0,
    wind_max: 0,
    wind_avg: 0,
    wind_direction: "N",
    last_reading: ""
  }

  constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getTodaysSummary();
  }

  ngOnChanges(): void {}

  getTodaysSummary(){
    //let WeatherStation = 1;
    this.rest.getTodaysSummary(1).subscribe((data: DailySummaryModel) => {
      this.weatherSummary = data;
    });
  }

}
