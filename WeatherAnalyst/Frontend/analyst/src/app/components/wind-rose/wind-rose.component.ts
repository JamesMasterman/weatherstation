import {OnInit, Component, ElementRef, Input,  ViewChild} from '@angular/core';
import { WeatherserviceService } from 'src/app/services/weatherservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WindDirectionModel } from 'src/app/models/winddirection.model';

import * as d3 from 'd3';

@Component({
  selector: 'app-wind-rose',
  templateUrl: './wind-rose.component.html',
  styleUrls: ['./wind-rose.component.scss']
})


export class WindRoseComponent implements OnInit {

  constructor(public rest: WeatherserviceService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getWeeklyWind();
  }

  chartData: any[];

  @ViewChild('chart')
  chartElement: ElementRef;
  parseDate = d3.timeParse('%d-%m-%Y');

  private svgElement: HTMLElement;
  private chartProps: any;
  private binName = ['0-10', '10-20', '20-30', '30-40', '40+'];

  getWeeklyWind(): void {
    this.rest.getLastWeekWindDirection(1).subscribe((data: WindDirectionModel[]) => {
      this.chartData = []      
      this.chartData.push(data);
      this.createWindRose(data);
    });
  }



  createWindRose(windy: WindDirectionModel[]): void{ 
    
    var data = []
    var lastDir = windy[0].direction;
    var maxPercentage = 0;
    var quadrantPercentageTotal = 0;
    var oneWind = {
      direction: lastDir,
      "0-10":0,
      "10-20":0,
      "20-30":0,
      "30-40":0,
      "40+":0
    }
    windy.forEach(wind => {    
      if(wind.direction != lastDir){
        data.push(oneWind);
        oneWind = {
          direction: wind.direction,
          "0-10":0,
          "10-20":0,
          "20-30":0,
          "30-40":0,
          "40+":0
        }
        lastDir = wind.direction;
        quadrantPercentageTotal = 0;
      }

      quadrantPercentageTotal += wind.percentage;
      oneWind[wind.bin] = wind.percentage;      
      if(quadrantPercentageTotal > maxPercentage){
        maxPercentage = quadrantPercentageTotal;
      }
    });

    data.push(oneWind);

    console.log(data);
    
    var width = 600;
    var height = 800;
    var margin = {top: 40, right: 80, bottom: 40, left: 40};
    var innerRadius = 20;
    var chartWidth = width - margin.left - margin.right;
    var chartHeight= height - margin.top - margin.bottom;
    var outerRadius = (Math.min(chartWidth, chartHeight) / 2);
    
    var svg = d3.select(this.chartElement.nativeElement)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
   
var angle = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var radius = d3.scaleLinear()
    .range([innerRadius, outerRadius]);

var x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0);

var y = d3.scaleLinear() //you can try scaleRadial but it scales differently
    .range([innerRadius, outerRadius]);

var z = d3.scaleOrdinal()
    .range(["#4242f4", "#42c5f4", "#42f4ce", "#42f456", "#adf442", "#f4e242", "#f4a142", "#f44242"]);


    x.domain(data.map(function(d) { return d.direction; }));
    y.domain([0, maxPercentage+5]);
    z.domain(this.binName);
    // Extend the domain slightly to match the range of [0, 2π].
    angle.domain([0, d3.max(data, function(d,i) { return i + 1; })]);
    radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    var angleOffset = -360.0/data.length/2.0;
    svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(this.binName)(data))
        .enter().append("g")
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("path")
        .data(function(d) { return d; })
        .enter().append("path")
        .attr("d", d3.arc()
            .innerRadius(function(d) { return y(d[0]); })
            .outerRadius(function(d) { return y(d[1]); })
            .startAngle(function(d) { return x(d.data.direction); })
            .endAngle(function(d) { return x(d.data.direction) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))
        .attr("transform", function() {return "rotate("+ angleOffset + ")"});

    var label = svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "rotate(" + ((x(d.direction) + x.bandwidth() / 2) * 180 / Math.PI - (90-angleOffset)) + ")translate(" + (outerRadius+30) + ",0)"; });

    label.append("text")
        .attr("transform", function(d) { return (x(d.direction) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
        .text(function(d) { return d.direction; })
        .style("font-size",14);

    svg.selectAll(".axis")
        .data(d3.range(angle.domain()[1]))
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
        .call(d3.axisLeft()
            .scale(radius.copy().range([-innerRadius, -(outerRadius+10)])));

    var yAxis = svg.append("g")
        .attr("text-anchor", "middle");

    var yTick = yAxis
        .selectAll("g")
        .data(y.ticks(5).slice(1))
        .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4,4")
        .attr("r", y);

    yTick.append("text")
        .attr("y", function(d) { return -y(d); })
        .attr("dy", "-0.35em")
        .attr("x", function() { return -10; })
        .text(y.tickFormat(5, "s"))
        .style("font-size",14);


    var legend = svg.append("g")
        .selectAll("g")
        .data(this.binName.reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (outerRadius+0) + "," + (-outerRadius + 40 +(i - (5) / 2) * 20) + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", z);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(function(d) { return d; })
        .style("font-size",12);

  }

}
