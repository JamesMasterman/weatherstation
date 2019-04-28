import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { TemperatureModel } from '../models/temperature.model';


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

  getLastWeekTemperature(id): Observable<TemperatureModel[]> {
    return this.http.get(endpoint + 'temperature/lastweek/' + id).pipe(
      map(res => 
        {
         return <TemperatureModel[]>res;
        }));
  }
  
  getLastWeekRain(id): Observable<any> {
    return this.http.get(endpoint + 'rain/lastweek/' + id).pipe(
      map(this.extractData));
  }

  private extractData(res: Response) {
    let body = res;
    return body || { };
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
