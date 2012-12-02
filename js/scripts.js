// Author: Chuan-Che Huang, chuanche@umich.edu

var WBD = WBD || {};

// Entries Prototype
WBD.Entries = Backbone.Model.extend({

  defaults: {
    
    allData: [], // [{'country': 'taiwan', 'year': '1234' ... }, ...]
    selDataXYPlot: [],
    
    filter: {
      year: 2000, // year filter 
      country: [], // country filter
    } 
  },

  initialize: function(opts){
    this.allData = opts.allData;
    this.filter = opts.filter;

    this.applyFilter();
  },

  // filter allData to selectedData
  applyFilter: function(){
    var that = this;

    /* filter by year 
    * this.selDataXYPlot = [
    *   { country: 'taiwan', 'key1' : '...', 'gni' : '...' },
    *   { ... }  
    * ]
    */
    this.selDataXYPlot = this.allData.map(function(d){
      var key;
      var returnObj = {};

      for( key in d){
        console.log("KEY");
        console.log(key);
        if(d.hasOwnProperty(key)){
          // Only check the parts that's not inherited from other places
          console.log("HI");
          if(d[key] instanceof Array){
            // it is an indicator, such as "gni" ... 
            returnObj[key] = that.interpolateValues(d[key], that.filter.year);
          }
        }
      }

      if(returnObj === {}){
        // empty, no indicator passed the year filter
        return;
      } else {
        returnObj.country = d.country;
        return returnObj;
      }
    });

    console.log("this getSelDataXYPlot");
    console.log(this.selDataXYPlot);
  },

  getSelDataXYPlot: function(){
    return this.selDataXYPlot;
  },

  getAllData: function(){
    return this.allData;
  },

  interpolateValues: function(values, year){
    // Copy from https://github.com/mbostock/bost.ocks.org/blob/gh-pages/mike/nations/index.html
    var i = d3.bisectLeft(values, year, 0, values.length - 1),
        a = values[i];
    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }
});


// XY Plot Prototype
WBD.XYPlot = Backbone.View.extend({
  
  className: 'xy-plot',
  id: 'xy-plot',
  tagName: 'div',

  //Note: there is no defaults in View
  xAxisData: 'gni',
  yAxisData: 'life_expectency',
  year: 2000, //temporal use
  
  // Style Members
  width: 500,
  height: 500,
  margins: {
    top: 25,
    bottom: 25,
    right: 25,
    left: 25
  },
  dotSize: 3,  // default dot size 

  initialize: function(opts){
    $('#main').append(this.el);
    
    // Members
    this.svg = d3.select(this.el).append("svg")
        .attr("width", this.width + this.margins.left + this.margins.right ) // hard-coded right now
        .attr("height", this.height + this.margins.top + this.margins.bottom ) // hard-coded right now
      .append("g")
        .attr("transform","translate("+this.margins.left+","+this.margins.top+")");


    this.renderAxes();
    this.render();
  },

  renderAxes : function() {
    var that = this;
    // Create Scales 
    this.xScale = d3.scale.linear()
      .domain( [ 0, d3.max(this.model.getSelDataXYPlot(), function(d){
        return d[that.xAxisData]; 
      })] 
      )
      .range([0, this.width]);

    this.yScale = d3.scale.linear()
      .domain( [ 0, d3.max(this.model.getSelDataXYPlot(), function(d){
        return d[that.yAxisData]; 
      }) ] 
      )
      .range([this.height, 0]);


    // Create Axes
    this.xAxis = d3.svg.axis()
      .scale(this.xScale)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.yScale)
      .orient("left");

    // Render Axes 
    this.svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0,"+this.height+")") 
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y-axis")
      .call(this.yAxis);
  },

  render: function() {
    
    console.log("Render XYPlot ... ");
    console.log(this.model.getSelDataXYPlot());
    
    // var allData = d3.nest()
    //   .key(function(d){ return d.country})
    //   .key(function(d){ return d.year})
    //   .entries(this.model.get("selDataXYPlot"));
    var that = this;

    this.baseGraph = this.svg.append("g")
      .attr("class", "base-graph")


    this.baseGraph.selectAll("g")
        .data(this.model.getSelDataXYPlot())
      .enter().append("circle")
        .attr("class", "country")
        .attr("id", function(d){ return d.country; })
        .attr("cx", function(d){ 
          // It is possible that some countries won't have this indicator record
          // therefore, return 0 
          return that.xScale(d[that.xAxisData] || 0 ); 
        })
        .attr("cy", function(d){ 
          // It is possible that some countries won't have this indicator record
          // therefore, return 0 
          return that.yScale(d[that.yAxisData] || 0 ); 
        })
        .attr("r", function(d){
          return that.dotSize;
        });
  }

});

WBD.prepareData = function(data){
  // Put pre-processing code here ...
  console.log("Prepare data ... ");
  // console.log(data);
  var entries = [];
  var i; // counter
  var entry = {};
  var d; // temp data

  d = d3.nest()
    .key(function(d){ return d.country; })
    .entries(data);

  console.log("nest");
  console.log(d);

  return data
}

WBD.interpolateValues = function(){

}

// main function 
$(document).ready(function(){
  d3.json("worldbankdata2.json", function(data){
      // Main Variables 
      var myEntries;
      var mySelectedData;
      var myXYPlotView;
      var myMapView;

      // Create Collection: myEntries
      console.log("Read and store data ... ");
      // read data into WBD.Record
      myEntries = new WBD.Entries({
        allData: WBD.prepareData(data),
        filter: {
          year: 2000,
          country: []
        }
      });

      console.log("Check myEntries");
      console.log(myEntries.get('allData'));
      

      // Create a XY Plot
      myXYPlotView = new WBD.XYPlot(
      {
        model: myEntries
      });

  });
});



