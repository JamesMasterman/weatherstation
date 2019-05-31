import { ChartDataModel } from './chart-data-model';

export class ChartMultiDataModel
{
    name:string;
    series:ChartDataModel[];

    constructor(name:string, series:ChartDataModel[]){
        this.name = name;
        this.series = series;
    }
}

