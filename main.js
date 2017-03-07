
//svg dimensions - same for both graphics for the time being 
var width = 600;
var height = 450;
var margin = {top: 10, right: 15, bottom: 30, left: 90};
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;
    var barh = h/2;
    var bar_margin = {left:110};
    var w = width - margin.right - bar_margin.left;


var dataset; //the full dataset
var curdata;
var bar_width = 80;

xMin=0;
xMax=0;
yMin=0;
yMax=0;

var a_sector = "all";
var a_open = "all";
var a_area = "all";

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
    .attr("transform", "translate(" + bar_margin.left + "," + margin.top + ")");


//y axis label -- scatter plot
plot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left )
        .attr("x",0 - (h / 2))
        .attr("dy", "1em")
        .style("font-size",20)
        .style("text-anchor", "middle")
        .text("Project Budget ($)");

//x axis label -- scatter plot
plot.append("text")
        .attr("y", h + margin.bottom - 12)
        .attr("x",w/2)
        .attr("dy", "1em")
        .style("font-size",20)
        .style("text-anchor", "middle")
        .text("Year");

barchart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",-barh/4)
        .attr("y",20-bar_margin.left)
        .style("text-anchor", "end")
        .style("font-size",18)
        .text("Total Budget ($)");

barchart.append("g")
  .attr("class","y axis")
  .attr("id","barchartyaxis");
  //.attr("transform", "translate("+ margin.left-(bar_width/2)+"," + 0 + ")");


  //add axis to barchart
barchart.append("g")
  .attr("class","x axis")
  .attr("id","barchartxaxis")
  .attr("transform","translate("+bar_width/2+","+barh+")");

//plot y axis
plot.append("g")
  .attr("class","y axis")
  .attr("id","plotyaxis");

plot.append("g")
  .attr("class","x axis")
  .attr("transform", "translate(0," + h + ")")
  .attr("id","plotxaxis");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var clearBrush = d3.select('#clearBrush')
    .style("margin","auto")
    .style("class","btn-warning")
    .on('click', function(){
      clearBrush.style("opacity",0);
      //reset bounds, not pull whole starting dataset.
      curdata = dataset;
      filterSet(curdata);
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
    a_sector = this.value;
    console.log("sector filter");
    filterSet(this.value);
  }
  document.getElementById("open").onchange = function(){
    a_open = this.value;
    filterSet(this.value);
  }
  document.getElementById("area").onchange = function(){
    a_area = this.value;
    filterSet(this.value);
  }

});

function filterSet(ntype) {
  console.log(a_sector);
  console.log(a_open);
  console.log(a_area);
  var filteredAllSect = new RegExp("all").test(a_sector);
  var filteredAllOpen = new RegExp("all").test(a_open);
  var filteredAllArea = new RegExp("all").test(a_area);
  console.log(filteredAllSect);
  console.log(filteredAllOpen);
  console.log(filteredAllArea);
  var filtered = curdata.filter(function(d){
    if(filteredAllSect){
      return true;
    } else {
      return d.sector == a_sector;
    }
  });
  filtered = filtered.filter(function(d){
    if(filteredAllOpen){
      return true;
    } else{
      return d.stat == a_open;
    }
  });
  filtered = filtered.filter(function(d){
    if(filteredAllArea){
      return true;
    } else {
      return d.research_area == a_area;
    }
  });
 draw(filtered);
}


function draw(mydata) { //draw the circiles initially and on each interaction with a control

//for scatter plot
  xMin = d3.min(mydata, function(d){return d.app_year;});
  xMax = d3.max(mydata, function(d){return d.end_year;});
  yMin = d3.min(mydata, function(d){return d.budget;});
  yMax = d3.max(mydata, function(d){return d.budget;});

  x.domain([xMin,xMax]);
  y.domain([yMin,yMax]);

  var brush = d3.brush()
  .extent([[0, 0], [w, h]])
  .on('end',function(){
    //console.log("brushed area");
    var x0 = d3.event.selection[0][0];
    var x1 = d3.event.selection[1][0];
    var y0 = d3.event.selection[0][1];
    var y1 = d3.event.selection[1][1];
    //console.log('x0:'+x0+',x1:'+x1+',y0:'+y0+',y1:'+y1); 
    clearBrush.style('opacity',.9);
    curdata = mydata.filter(function(d){ 
      return (x(d.app_year)>=x0 && x(d.app_year)<=x1 && y(d.budget)>=y0 && y(d.budget)<=y1)
    });

    circles
    .data(curdata, function(d){return d;}).order()  
    .exit().remove();

    //draw(curdata);
    //draw(curdata);
    gBrush.remove();


  });
     // attach the brush to the chart
  var gBrush = plot.append('g')
    .attr('class', 'brush')
    .call(brush);

  plot.select("#plotxaxis").call(xAxis)
    .append("g")
    .attr("class","x label")
    .attr("x",w)
    .attr("y",0)
    .style("text-anchor", "end")
    .text("Year");


  plot.select("#plotyaxis").call(yAxis)
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
    .attr("cx", function(d) { return x(d.app_year);  })
    .attr("cy", function(d) { return y(d.budget);  })
    .attr("r", w/(4*(xMax-xMin)))
    .style("fill", function(d) { return col(d.sector); });
	//circle
  //circle


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
    .range([0,(w-(bar_width))/4,(w-(bar_width))/2,(3*(w-(bar_width)))/4,(w-bar_width)]);

    //y axis for bar chart
  var ybar = d3.scaleLinear()
    .domain([0,sumMax])
    .range([barh,0]);

//bars for barchart
  var bars = barchart.selectAll("rect")
    .data(nested_sums); //use budget sums for the sector

    bars.attr("x", function(d) { return xbar(d.key);  })
    .attr("y", function(d){ return ybar(d.value); })
    .attr("width",bar_width)
    .attr("height",function(d){ return barh-ybar(d.value); })
    .style("fill", function(d) { return col(d.key); })
    .on("mouseover",function(d){
      console.log("mouseover bar");
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
  //circle
  bars.exit().remove();

  //circle
  bars.enter().append("rect")
    .attr("x", function(d){ return xbar(d.key); })
    .attr("y", function(d){ return ybar(d.value); })
    .attr("width",bar_width) 
    .attr("height",function(d){ return barh-ybar(d.value); })
    .style("fill",function(d) { return col(d.key); });
  


  //create x axis for bar chart 
  var barxAxis = d3.axisBottom()
    .scale(xbar);
  //y axis
  var baryAxis = d3.axisLeft()
    .scale(ybar);



  d3.select("#barchartxaxis")
    .call(barxAxis);


  d3.select("#barchartyaxis")
    .call(baryAxis);


//move data points to start year of project
  d3.select("#start").on("click",(function(){
      yearplot.transition().duration(2500)
          .style("opacity", 0);

      yearplot.transition().delay(1500).duration(1500)
          .style("opacity", 1)
          .text("Budget by Start Year");
    //yearplot.transition().duration(1000).text("Research Project Budget by Start Year");
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
      yearplot.transition().duration(2500)
        .style("opacity", 0);

      yearplot.transition().delay(1500).duration(1500)
        .style("opacity", 1)
        .text("Budget by End Year");
    //yearplot.transition().duration(1000).text("Research Project Budget by End Year");
    var circles = plot.selectAll("circle");
    circles.transition()
      .duration(3000)
      .attr("cx",function(d){ return x(d.end_year); });
  });

//change to application year of project
  d3.select("#app").on("click",function(){
      yearplot.transition().duration(2500)
        .style("opacity", 0);

      yearplot.transition().delay(1500).duration(1500)
          .style("opacity", 1)
          .text("Budget by Application Year");
    //yearplot.text("Research Project Budget by Application Year");
    var circles = plot.selectAll("circle");
    circles.transition()
      .duration(3000)
      .attr("cx",function(d){ return x(d.app_year); });
  });

}


