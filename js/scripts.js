// Author: Chuan-Che Huang, chuanche@umich.edu

var WBD = WBD || {};

// Filter Object Prototype
// an Entries Object contains one filter object
// NOTE: in order for other views to get or set the attributes in filter object
//       the best practice is to create another model to stores the filter 
//       attributes
WBD.Filter = Backbone.Model.extend({
  defaults: {
    year: 2000, // year filter 
    country: [], // country filter 
    region: [] // region filter
  }
});

// Entries Prototype
WBD.Entries = Backbone.Model.extend({

  defaults: {
    
    allData: [], // [{'country': 'taiwan', 'year': '1234' ... }, ...]
    selDataXYPlot: [],
    filter: {}
  },

  initialize: function(opts){
    this.allData = opts.allData;
    this.set("filter", new WBD.Filter());
    this.set("selDataXYPlot", []);
    this.applyFilter();
    this.get("filter").bind("change", this.applyFilter, this);
  },

  // filter allData to selectedData
  applyFilter: function(){
    var that = this;
    // console.log("applyFilter");
    // console.log(this.get("selDataXYPlot"));
    /* filter by year 
    * this.selDataXYPlot = [
    *   { country: 'taiwan', 'key1' : '...', 'gni' : '...' },
    *   { ... }  
    * ]
    */

    var filteredData = that.allData.map(function(d){
      // d is an attribute in the array
      var key;
      var returnObj = {};

      for( key in d){
        // console.log("KEY");
        // console.log(key);
        if(d.hasOwnProperty(key)){
          // Only check the parts that's not inherited from other places
          // console.log("HI");
          if(d[key] instanceof Array){
            // it is an indicator, such as "gni" ... 
            returnObj[key] = that.interpolateValues(d[key], that.get("filter").get("year"));
            
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
    
    this.set("selDataXYPlot", filteredData);

  },

  getSelDataXYPlot: function(){
    return this.get("selDataXYPlot");
  },

  getAllData: function(){
    return this.get("allData");
  },

  interpolateValues: function(values, year){
    var d3_bisector = d3.bisector(function(d){ return d[0];}).left;

    var i = d3_bisector(values, year, 0, values.length - 1),
        a = values[i];

    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  },

  // Override the set method to include applyFilter
  // set: function(attributes, options) {    
  //   Backbone.Model.prototype.set.call(this, attributes, options);
  //   this.applyFilter();
  //   return this;
  // }
});


// XY Plot Prototype
WBD.XYPlot = Backbone.View.extend({
  
  className: 'xy-plot',
  id: 'xy-plot',
  tagName: 'div',

  //Note: there is no defaults in View
  xAxisDatasetName: 'gni',
  yAxisDataName: 'life_expectency',
  year: 2000, //temporal use
  yearSelector: 2000, //default
  yearLabel: "", // default
  
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
    this.model = opts.model;

    // Listen to changes on model
    this.model.bind("change:selDataXYPlot", this.render, this );

    // Members
    this.svg = d3.select(this.el).append("svg")
        .attr("width", this.width + this.margins.left + this.margins.right ) // hard-coded right now
        .attr("height", this.height + this.margins.top + this.margins.bottom ) // hard-coded right now
      .append("g")
        .attr("transform","translate("+this.margins.left+","+this.margins.top+")");


    this.initAxes();
    this.initYearSelector();
    
    this.initChart();
    
  },

  initAxes : function() {
    var that = this;
    
    // Create x, y scales and x, y axies 
    this.initScales();

    // Need to change this part in the future
    // When the dataset is changed, the x-axis need to be removed/updated
    // Render Axes 
    this.xAxisEl = this.svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0,"+that.height+")") 
      .call(that.xAxis);

    this.yAxisEl = this.svg.append("g")
      .attr("class", "y-axis")
      .call(that.yAxis);

    // Add an x-axis label.
    this.xAxisLabelEl = this.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", that.width)
        .attr("y", that.height - 6)
        .text(that.xAxisDatasetName);

    // Add a y-axis label.
    this.yAxisLabelEl = this.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(that.yAxisDataName);
  },

  updateAxes: function(){
    var that = this;

    // Re-render x, y axes 
    this.xAxisEl
      .call(that.xAxis);

    this.yAxisEl
      .call(that.yAxis);

    // Update the x, y axis label.
    this.xAxisLabelEl
      .text(that.xAxisDatasetName);

    this.yAxisLabelEl
      .text(that.yAxisDataName);

  },

  initScales: function(){
    var that = this;
    // Create Scales 
    this.xScale = d3.scale.linear()
      .domain( [ 0, d3.max(that.model.getSelDataXYPlot(), function(d){
        return d[that.xAxisDatasetName]; 
      })] 
      )
      .range([0, this.width]);

    this.yScale = d3.scale.linear()
      .domain( [ 0, d3.max(that.model.getSelDataXYPlot(), function(d){
        return d[that.yAxisDataName]; 
      }) ] 
      )
      .range([that.height, 0]);


    // Create Axes
    this.xAxis = d3.svg.axis()
      .scale(that.xScale)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(that.yScale)
      .orient("left");
  },

  initYearSelector: function(){
      // Add the year label; the value is set on transition.
      var that = this;
      this.yearLabel = this.svg.append("text")
        .attr("class", "year label")
        .attr("text-anchor", "end")
        .attr("y", that.height - 24)
        .attr("x", that.width)
        .text(that.model.get("filter").get("year"));

      // Add on overlay for the year label
      this.yearSelectorBox = this.yearLabel.node().getBBox();
      // console.log("this.yearSelectorBox");
      // console.log(this.yearSelectorBox);

      this.yearSelector = this.svg.append("rect")
        .attr("class", "year-selector overlay")
        .attr("x", that.yearSelectorBox.x)
        .attr("y", that.yearSelectorBox.y)
        .attr("width", that.yearSelectorBox.width)
        .attr("height", that.yearSelectorBox.height)
        .data([that]) // this is the only way to pass the model into function
                      // so inside a callback, the context could remain unchanged
        .on("mouseover", that.enableYearSelector);

  },

  updateYearSelector: function(){
      var that = this;
      this.yearLabel
        .text(that.model.get("filter").get("year"));
  },

  render: function() {
    var that = this;
    console.log("Render XYPlot ... ");
    // console.log(this.model.getSelDataXYPlot());
    
    // var allData = d3.nest()
    //   .key(function(d){ return d.country})
    //   .key(function(d){ return d.year})
    //   .entries(this.model.get("selDataXYPlot"));
    



    // Add a dot per nation
    // this.baseGraph is a selection ?
    this.baseGraph
        // d.country is the key to identify different array element
        .data(this.model.getSelDataXYPlot(), function(d){ return d.country})
      .attr("cx", function(d){ 
        // It is possible that some countries won't have this indicator record
        // therefore, return 0 

        if(d.country == "Canada"){
          console.log(d.country);
          console.log(d.gni);
          console.log(that.xScale(d[that.xAxisDatasetName] || 0 ));
        }
        return that.xScale(d[that.xAxisDatasetName] || 0 ); 
      })
      .attr("cy", function(d){ 
        // It is possible that some countries won't have this indicator record
        // therefore, return 0 
        return that.yScale(d[that.yAxisDataName] || 0 ); 
      })
      .attr("r", function(d){
        return that.dotSize;
      });
    

    // console.log("exit()");
    // console.log(circles.exit());
    // this.baseGraph.exit().remove();
    this.updateYearSelector();
    console.log("done");
  },

  initChart: function(){
    var that = this;
    // Add a dot per nation
    this.baseGraph = this.svg.append("g")
        .attr("class", "dots")
      .selectAll("dot")
        .data(this.model.getSelDataXYPlot())
      .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d){ return d.country; })
        .attr("cx", function(d){ 
          // It is possible that some countries won't have this indicator record
          // therefore, return 0 

          if(d.country == "Canada"){
            console.log(d.country);
            console.log(d.gni);
            console.log(that.xScale(d[that.xAxisDatasetName] || 0 ));
          }
          return that.xScale(d[that.xAxisDatasetName] || 0 ); 
        })
        .attr("cy", function(d){ 
          // It is possible that some countries won't have this indicator record
          // therefore, return 0 
          return that.yScale(d[that.yAxisDataName] || 0 ); 
        })
        .attr("r", function(d){
          return that.dotSize;
        });

    

    // console.log("exit()");
    // console.log(circles.exit());
    // this.baseGraph.exit().remove();
    this.updateYearSelector();
  },

  enableYearSelector: function(d){
    // this = the current DOM element, not the Model 

    var self = d;
    var that = self;

    self.yearScale = d3.scale.linear()
            .domain([1990, 2010]) // hard-coded
            .range([that.yearSelectorBox.x + 10, that.yearSelectorBox.x + that.yearSelectorBox.width - 10])
            .clamp(true);

    // Cancel the current transition, if any.
    self.svg.transition().duration(0);

    self.yearSelector
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
      that.yearLabel.classed("active", true);
    }

    function mouseout() {
      that.yearLabel.classed("active", false);
    }

    function mousemove() {
      that.setFilterByYear(that.yearScale.invert(d3.mouse(this)[0])); // get mouseX
    }
  },

  setFilterByYear: function(year){
    var that = this;
    that.model.get("filter").set({ year: Math.round(year)}); 
    // that.yearLabel = Math.round(year);
  }

});


WBD.Map = Backbone.View.extend({
  className: 'map',
  id: 'map',
  tagName: 'div',

  initialize: function(opts){
    $('#main').append(this.el);
    this.model = opts.model;

    // Listen to changes on model
    this.model.bind("change:selDataXYPlot", this.render, this );

  },

  render: function(){

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

  // console.log("nest");
  // console.log(d);

  return data
}

// Add a remove method to Array
// reference: http://javascriptweblog.wordpress.com/
Array.prototype.remove = function(member) {

  var index = this.indexOf(member);

  if (index > -1) {
    this.splice(index, 1);
  }

  return this;
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
        allData: WBD.prepareData(data)
      });

      // console.log("Check myEntries");
      // console.log(myEntries.get('allData'));
      

      // Create a XY Plot
      myXYPlotView = new WBD.XYPlot(
      {
        model: myEntries
      });

      myMapView = new WBD.Map({
        model: myEntries
      });

  });
});