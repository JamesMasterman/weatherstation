import { TemperatureModel } from "./temperature.model";
import {SoilModel} from "./soil.model";
import { RainModel } from "./rain.model";
import { ChartDataModelDate } from './chart-date-data-model';
import { WindModel } from './wind.model';

export class ChartMultiDataModelDate
{
    name:string;
    series:ChartDataModelDate[];

    constructor(name:string, series:ChartDataModelDate[]){
        this.name = name;
        this.series = series;
    }

    static FromTemperatureModel = function(name: string, temps:TemperatureModel[]){
        var series = temps.map(function (temperature) {
            return ChartDataModelDate.FromTemperatureModel(temperature);
        });
        
        return new ChartMultiDataModelDate(name, series);
    }

    static FromPressureModel = function(name: string, temps:TemperatureModel[]){
        var series = temps.map(function (temperature) {
            return ChartDataModelDate.FromPressureModel(temperature);
        });
        
        return new ChartMultiDataModelDate(name, series);
    }

    static FromSoilTemperatureModel = function(name: string, temps:SoilModel[]){
        var series = temps.map(function (temperature) {
            return ChartDataModelDate.FromSoilTemperatureModel(temperature);
        });
        
        return new ChartMultiDataModelDate(name, series);
    }

    static FromSoilMoistureModel = function(name: string, temps:SoilModel[]){
        var series = temps.map(function (moisture) {
            return ChartDataModelDate.FromSoilMoistureModel(moisture);
        });
        
        return new ChartMultiDataModelDate(name, series);
    }

    static FromRainModel = function(name: string, rain:RainModel[]){
        var series = rain.map(function (rain) {
            return ChartDataModelDate.FromRainModel(rain);
        });
        
        return new ChartMultiDataModelDate(name, series);
    }

    static FromWindModel = function(name: string, wind:WindModel[]){
        var series = wind.map(function (wind) {
            return ChartDataModelDate.FromWindModel(wind);
        });
        
        return new ChartMultiDataModelDate(name, series);
    }
}

