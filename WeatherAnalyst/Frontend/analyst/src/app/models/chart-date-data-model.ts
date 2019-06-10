import { TemperatureModel } from "./temperature.model";
import { SoilModel } from "./soil.model";
import { RainModel } from "./rain.model";
import { WindModel } from './wind.model';
import { MS_TO_KMPH } from './constants';

export class ChartDataModelDate
{
    name:Date;
    value:number;

    constructor(name: Date, value: number){
        this.name = name;
        this.value = value;
    }

    static FromPressure = function(temp:TemperatureModel)
    {
        var name = new Date(temp.when_recorded);
        var value = temp.pressure;

        return new ChartDataModelDate(name, value);
    }

    static FromHumidity = function(humid:TemperatureModel)
    {
        var name = new Date(humid.when_recorded);
        var value = humid.humidity;

        return new ChartDataModelDate(name, value);
    }

    static FromTemperature = function(temp:TemperatureModel)
    {
        var name = new Date(temp.when_recorded);
        var value = temp.temperature;

        return new ChartDataModelDate(name, value);
    }

    static FromSoilTemperatureModel = function(temp:SoilModel)
    {
        var name = new Date(temp.when_recorded);
        var value = temp.soil_temperature;

        return new ChartDataModelDate(name, value);
    }

    static FromSoilMoistureModel = function(temp:SoilModel)
    {
        var name = new Date(temp.when_recorded);
        var value = temp.soil_moisture;

        return new ChartDataModelDate(name, value);
    }

    static FromRainModel = function(rain:RainModel)
    {
        var name = new Date(rain.when_recorded);
        var value = rain.one_hr_rain;

        return new ChartDataModelDate(name, value);
    }

    static FromWindModel = function(wind:WindModel)
    {
        var name = new Date(wind.when_recorded);
        var value = wind.speed * MS_TO_KMPH;
        return new ChartDataModelDate(name, value);
    }
}