import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { TemperatureModel } from '../models/temperature.model';
import {SoilModel} from '../models/soil.model';
import { DailySummaryModel } from '../models/dailysummary.model';
import {RainModel} from '../models/rain.model';
import { WindModel } from '../models/wind.model';

const endpoint = 'http://localhost:3000/api/v1/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class WeatherserviceService {

  constructor(private http: HttpClient) { }

  getLastWeekAirTemperature(id): Observable<TemperatureModel[]> {
    return this.http.get(endpoint + 'temperature/lastweek/' + id).pipe(
      map(res => 
        {
         return <TemperatureModel[]>res;
        })
    );
  }

  getLastWeekSoil(id): Observable<SoilModel[]> {
    return this.http.get(endpoint + 'soil/lastweek/' + id).pipe(
      map(res => 
        {
         return <SoilModel[]>res;
        })
    );
  }

  getTodaysSummary(id): Observable<DailySummaryModel>{
    return this.http.get(endpoint + 'today/' + id).pipe(
      map(res=>
        {
          return <DailySummaryModel>res
        })
    );
  }
  
  getLastWeekRain(id): Observable<RainModel[]> {
    return this.http.get(endpoint + 'rain/lastweek/' + id).pipe(
      map(res => 
        {
         return <RainModel[]>res;
        })
    );
  }

  getLastWeekWind(id): Observable<WindModel[]> {
    return this.http.get(endpoint + 'wind/lastweek/' + id).pipe(
      map(res => 
        {
         return <WindModel[]>res;
        })
    );
  }

  getQuarterAirTemperatures(id): Observable<TemperatureModel[]> {
    return this.http.get(endpoint + 'temperature/lastquarter/' + id).pipe(
      map(res => 
        {
         return <TemperatureModel[]>res;
        })
    );
  }

  getQuarterRain(id): Observable<RainModel[]> {
    return this.http.get(endpoint + 'rain/lastquarter/' + id).pipe(
      map(res => 
        {
         return <RainModel[]>res;
        })
    );
  }

  getQuarterSoil(id): Observable<SoilModel[]> {
    return this.http.get(endpoint + 'soil/lastquarter/' + id).pipe(
      map(res => 
        {
         return <SoilModel[]>res;
        })
    );
  }

  getQuarterWind(id): Observable<WindModel[]> {
    return this.http.get(endpoint + 'wind/lastquarter/' + id).pipe(
      map(res => 
        {
         return <WindModel[]>res;
        })
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
