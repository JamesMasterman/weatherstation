import { Component, OnInit } from '@angular/core';
import { WeatherserviceService } from '../weatherservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TemperatureModel } from '../models/temperature.model';

@Component({
  selector: 'app-temperature',
  templateUrl: './weeklytemperature.component.html',
  styleUrls: ['./weeklytemperature.component.css']
})
export class WeeklyTemperatureComponent implements OnInit {

  temperatures:TemperatureModel[] = [];

  constructor(public rest:WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getWeeklyTemperatures();
  }

  getWeeklyTemperatures() {
    this.temperatures = [];
    this.rest.getLastWeekTemperature(1).subscribe((data: TemperatureModel[]) => {
      console.log(data);
      this.temperatures = data;
    });
  }

}