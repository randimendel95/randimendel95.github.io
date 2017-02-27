
//svg dimensions - same for both graphics for the time being 
var width = 750;
var height = 450;
var margin = {top: 20, right: 15, bottom: 30, left: 100};
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;
    var barh = h/2;

var dataset; //the full dataset
var curdata;

var yearplot = d3.select("#yearplot")
  .text("Research Project Budget by Application Year");
//sectors of research - for encoding by hue
var col = d3.scaleOrdinal()
  .domain(["Government","Hospital","Research","University","Other"])
  .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00']);

//scatter plot
var plot = d3.select(".plot")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var barchart = d3.select(".barchart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", (barh + margin.top + margin.bottom+15))
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var clearBrush = d3.select('#clearBrush')
    .attr('class','btn')
    .style('opacity',0)
    .style('font-size',28)
    .style('margin-left',100)
    .on('click', function(){
      clearBrush.style("opacity",0);
      d3.selectAll('.axis').remove();
      curdata = dataset;
      draw(dataset);
    })
    .text('Clear Brushing');

d3.csv("data/grants.csv", function(error, data) {
  if (error) return console.warn(error);
  data.forEach(function(d){
    d.budget = +(d['BUDGET TOTAL']).replace(/[^0-9\.]+/g,"");
    d.app_year = d["APPLICATION YEAR"];
    d.sector = d["SECTOR"];
    d.start_year = d["START YR"];
    d.end_year = d["END YR"];
    d.research_area = d["BROAD RESEARCH AREA"];
    d.field = d["FIELD OF RESEARCH"];
    d.stat = d["STATUS"];
    d.gtitle = d["GRANT TITLE"];
    d.subtype = d["GRANT SUB TYPE"];
  });
  dataset = data;
  curdata = data;
  draw(dataset);
});



$(document).ready(function(){
  document.getElementById("sector").onchange = function(){
    filterSector(this.value);
  }
  document.getElementById("open").onchange = function(){
    filterOpen(this.value);
  }
  document.getElementById("area").onchange = function(){
    filterArea(this.value);
  }

});

function filterSector(ntype) {
  var filteredAll = new RegExp("all").test(ntype);
  if(filteredAll){
    draw(curdata);
  }else{
    var filtered = curdata.filter(function(d){
      return d.sector == ntype;
    });
    d3.selectAll('.axis').remove();
    draw(filtered);
  }
}

function filterArea(ntype) {
  var filteredAll = new RegExp("all").test(ntype);
  if(filteredAll){
    draw(curdata);
  }else{
    var filtered = curdata.filter(function(d){
      return d.research_area == ntype;
    });
    d3.selectAll('.axis').remove();
    draw(filtered);
  }
}

function filterOpen(ntype){
  var filteredAll = new RegExp("all").test(ntype);
  if(filteredAll){
    draw(curdata);
  }else{
    var filtered = curdata.filter(function(d){
      return d.stat == ntype;
    });
    d3.selectAll('.axis').remove();
    draw(filtered);
  }
}


function draw(mydata) { //draw the circiles initially and on each interaction with a control

//for scatter plot
  var xMin = d3.min(mydata, function(d){return d.app_year;});
  var xMax = d3.max(mydata, function(d){return d.end_year;});
  var yMin = d3.min(mydata, function(d){return d.budget;});
  var yMax = d3.max(mydata, function(d){console.log(d.budget);return d.budget;});

//for scatter plot
  var x = d3.scaleLinear()
        .domain([xMin,xMax])
        .range([0, w]);

//used for both bar chart and scatter plot
  var y = d3.scaleLinear()
        .domain([yMin,yMax])
        .range([h,margin.bottom]);

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
    .scale(y);

  var brush = d3.brush()
  .extent([[0, 0], [w, h]])
  .on('end',function(){
    //console.log("brushed area");
    var x0 = d3.event.selection[0][0];
    var x1 = d3.event.selection[1][0];
    var y0 = d3.event.selection[0][1];
    var y1 = d3.event.selection[1][1];
    console.log('x0:'+x0+',x1:'+x1+',y0:'+y0+',y1:'+y1); 
    d3.selectAll('.axis').remove();
    console.log('removed axis');
    clearBrush.style('opacity',.9);
    curdata = mydata.filter(function(d){ 
      return (x(d.app_year)>=x0 && x(d.app_year)<=x1 && y(d.budget)>=y0 && y(d.budget)<=y1)
    });
    draw(curdata);
    gBrush.remove();


  });
     // attach the brush to the chart
var gBrush = plot.append('g')
  .attr('class', 'brush')
  .call(brush);

plot.append("g")
  .attr("class","x axis")
  .attr("transform", "translate(0," + h + ")")
  .call(xAxis)
    .append("g")
    .attr("class","x label")
    .attr("x",w)
    .attr("y",0)
    .style("text-anchor", "end")
    .text("Year");

plot.append("g")
  .attr("class","y axis")
  .call(yAxis)
    .append("g")
        .attr("class","y label")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("height",24)
        .attr("width",400)
        .style("text-anchor", "end")
        .text("Total Budget");


  var circles = plot.selectAll("circle")
    .data(mydata)

	//circle
  //circle
    .attr("cx", function(d) { return x(d.app_year);  })
    .attr("cy", function(d) { return y(d.budget);  })
    .attr("r", w/(4*(xMax-xMin)))
    .style("fill", function(d) { return col(d.sector); });
	//circle
  circles.exit().remove();

	//circle
  circles.enter().append("circle")
    .attr("cx", function(d) { return x(d.app_year);  })
    .attr("cy", function(d) { return y(d.budget);  })
    .attr("r", w/(4*(xMax-xMin)))
    .on("mouseover",function(d){
      tooltip.transition()
        .style("opacity",.9);
        tooltip.html("Project: "+d.subtype+"<br />Research Area: "+d.research_area+ "<br />Sector: "+d.sector+"<br />Budget: $"+d.budget)
          .style("left",(d3.event.pageX+5)+"px")
          .style("top",(d3.event.pageY-28)+"px");
      })
      .on("mouseout",function(d){
        tooltip.transition()
          .style("opacity",0);
      })
     .style("stroke", "black")
     //.style("fill", function(d) { return colLightness(d.vol); })
     .style("fill", function(d) { return col(d.sector); })
     .style("opacity", 0.5);

    //sum values to be used for bar chart
    //sum budget totals by sector of instituation
    var nested_sums = d3.nest()
      .key(function(d){ return d.sector; })
      .rollup(function(grant){ return d3.sum(grant, function(d){return d.budget})})
      .entries(mydata);

  //max for barchart    
  var sumMax = d3.max(nested_sums, function(d){ return d.value});


  //for barchart, x axis
  var xbar = d3.scaleOrdinal()
    .domain(["Government","Hospital","Research","University","Other"])
    .range([0,(w-30)/4,(w-30)/2,(3*w-30)/4,w-30]);

    //y axis for bar chart
  var ybar = d3.scaleLinear()
    .domain([0,sumMax])
    .range([barh,0]);

//bars for barchart
  var bars = barchart.selectAll("rect")
    .data(nested_sums); //use budget sums for the sector

    bars.attr("x", function(d) { return xbar(d.key);  })
    .attr("y", function(d){ return ybar(d.value); })
    .attr("width",50)
    .attr("height",function(d){ return barh-ybar(d.value); })
    .style("fill", function(d) { return col(d.key); });
  //circle
  bars.exit().remove();

  //circle
  bars.enter().append("rect")
    .attr("x", function(d){ return xbar(d.key); })
    .attr("y", function(d){ return ybar(d.value); })
    .attr("width",50) 
    .attr("height",function(d){ return barh-ybar(d.value); })
    .style("fill",function(d) { return col(d.key); });
  
  //add tooltip to barchart to give sector and value of sum.
  bars.on("mouseover",function(d){
      tooltip.transition()
        .style("opacity",.9);
        tooltip.html("Sector: "+d.key+"<br />Total Budget: $"+d.value)
          .style("left",(d3.event.pageX+5)+"px")
          .style("top",(d3.event.pageY-28)+"px");
      })
      .on("mouseout",function(d){
        tooltip.transition()
          .style("opacity",0);
      });

//create x axis for bar chart 
var barxAxis = d3.axisBottom()
    .scale(xbar);
//y axis
  var baryAxis = d3.axisLeft()
    .scale(ybar);

//add axis to barchart
barchart.append("g")
  .attr("class","x axis")
  .attr("transform", "translate(0," + barh + ")")
  .call(barxAxis)
    .append("g")
    .attr("class","x label")
    .attr("y",h)
    .style("text-anchor", "end")
    .text("Sector");


barchart.append("g")
  .attr("class","y axis")
  .call(baryAxis)
    .append("g")
        .attr("class","y label")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",w)
        .attr("y",h)
        .style("text-anchor", "end")
        .text("Total Budget");

//move data points to start year of project
  d3.select("#start").on("click",(function(){
    yearplot.text("Research Project Budget by Start Year");
    var circles = plot.selectAll("circle");
    circles.transition()
      .duration(3000)
      .attr("cx",function(d){ return x(d.start_year); })
    plot.selectAll("line")          // attach a line
    .enter().append("line")
    .style("stroke", "black")  // colour the line
    .attr("x1", function(d){ return d.app_year; })     // x position of the first end of the line
    .attr("y1", function(d){ return d.budget; })      // y position of the first end of the line
    .attr("x2", function(d) { return d.start_year; })     // x position of the second end of the line
    .attr("y2", function(d){ return d.budget; });    
    }));

  //move data points to end year of project
  d3.select("#end").on("click",function(){
    yearplot.text("Research Project Budget by End Year");
    var circles = plot.selectAll("circle");
    circles.transition()
      .duration(3000)
      .attr("cx",function(d){ return x(d.end_year); });
  });

//change to application year of project
  d3.select("#app").on("click",function(){
    yearplot.text("Research Project Budget by Application Year");
    var circles = plot.selectAll("circle");
    circles.transition()
      .duration(3000)
      .attr("cx",function(d){ return x(d.app_year); });
  });

}


