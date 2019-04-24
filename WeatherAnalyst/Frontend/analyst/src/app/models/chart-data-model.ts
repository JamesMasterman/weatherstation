import { TemperatureModel } from "./temperature.model";

export class ChartDataModel
{
    name:Date;
    value:number;

    constructor(temp:TemperatureModel){
        this.name = new Date(temp.when_recorded);
        this.value = temp.temperature;
    }
}