

export class ChartDataModel
{
    date:Date;
    name:string;
    value:number;

    constructor(date:Date, name: string, value: number){
        this.date = date;
        this.name = name;
        this.value = value;
    }
}