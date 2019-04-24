import { TemperatureModel } from "./temperature.model";
import { ChartDataModel } from './chart-data-model';

export class ChartMultiDataModel
{
    name:string;
    series:ChartDataModel[];

    constructor(name:string, temps:TemperatureModel[]){

        var series = temps.map(function (temperature) {
            return new ChartDataModel(temperature);
        });
        
        this.name = name;
        this.series = series;
    }
}