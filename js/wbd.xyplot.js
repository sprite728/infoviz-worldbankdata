// Author: Chuan-Che Huang, chuanche@umich.edu
var WBD = WBD || {};

// XY Plot Prototype
WBD.XYPlot = Backbone.View.extend({
  
  className: 'xy-plot',
  id: 'xy-plot',
  tagName: 'div',

  //Note: there is no defaults in View
  xAxisDatasetName: '',
  yAxisDatasetName: '',
  year: 2000, //temporal use
  yearSelector: 2000, //default
  yearLabel: "", // default
  
  // Style Members
  width: 530,
  height: 550,
  margins: {
    top: 25,
    bottom: 25,
    right: 30,
    left: 50
  },
  dotSizeRange: [3, 50],  // default dot size
  stroke: 'red',
  strokeWidth: 5,

  initialize: function(opts){
    $('#main').append(this.el);
    this.model = opts.model;
		
		//Get x and y datasets
		this.xAxisDatasetName = this.model.get("xDatasetName");		
		this.yAxisDatasetName = this.model.get("yDatasetName");	
		
    // Listen to changes on model
    this.model.bind("change:selDataXYPlot", this.render, this );
		
    this.model.get("filter").bind("change:xDataRange", this.render, this );
    this.model.get("filter").bind("change:yDataRange", this.render, this );
    
		this.model.bind("change:xDatasetName", this.updateDataset, this );
		this.model.bind("change:yDatasetName", this.updateDataset, this );
    this.model.get("filter").bind("change:hoveredCountry", this.render, this);

    // Members
    this.svg = d3.select(this.el).append("svg")
        .attr("width", this.width + this.margins.left + this.margins.right ) // hard-coded right now
        .attr("height", this.height + this.margins.top + this.margins.bottom ) // hard-coded right now
      .append("g")
        .attr("transform","translate("+this.margins.left+","+this.margins.top+")")
        .attr("class", "xy-plot");

    this.initScalesAndAxes();
    this.renderAxes();

    this.initYearSelector();
   
    
    this.initChart();
    this.render();
    // this.initScalesAndAxes();
    // this.updateAxes();
  },

  // re-render the axes onto the chart
  renderAxes : function() {
    console.log("init axes");
    var that = this;
    

    // Need to change this part in the future
    // When the dataset is changed, the x-axis need to be removed/updated
    // Render Axes 
    this.xAxisEl
      .attr("class", "x axis")
      .attr("transform", "translate(0,"+that.height+")") 
      .call(that.xAxis);

    this.yAxisEl 
      .attr("class", "y axis")
      .call(that.yAxis);

    // Add an x-axis label.
    this.xAxisLabelEl 
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", that.width)
        .attr("y", that.height - 6)
        .text(that.model.get("xDatasetName"));

    // Add a y-axis label.
    this.yAxisLabelEl 
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(that.model.get("yDatasetName"));
  },

  // render the updated axes 
  updateAxes: function(){
    console.log("update axes");
    var that = this;

    // Re-render x, y axes 
    // this.xAxisEl.parentNode.removeChild(this.xAxisEl);


    this.xAxisEl
      .call(that.xAxis);

    this.yAxisEl
      .call(that.yAxis);

    // Update the x, y axis label.
    this.xAxisLabelEl
      .text(that.model.get("xDatasetName"));

    this.yAxisLabelEl
      .text(that.model.get("yDatasetName"));

  },

  updateDataset: function(){
    var that = this;
    console.log("update dataset");


    // that.initScalesAndAxes();
    that.resetScalesAndAxes();
    that.renderAxes();
    // that.updateAxes();
    that.render();
  },

  // initialize the elements and members used for scales and axes
  initScalesAndAxes: function(){
    console.log("init scales");
    var that = this;
		 
		var xDataRange = this.model.get("filter").get("xDatasetScale");
    var yDataRange = this.model.get("filter").get("yDatasetScale");
		
    // Create Scales 
    this.xScale = d3.scale.linear()
      .domain(this.model.get("filter").get("xDataRange"))
			.range([0, this.width]);

    this.yScale = d3.scale.linear()
      .domain(this.model.get("filter").get("yDataRange"))
      .range([that.height, 0]);

    this.popuScale = d3.scale.linear()
      .domain(this.model.findExtendOfAnIndicator('population'))
      .range(this.dotSizeRange);

    // this.colorScale = d3.scale.ordinal()
    //   .domain(WBD.)

    // Create Axes
    this.xAxis = d3.svg.axis()
      .scale(that.xScale)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(that.yScale)
      .orient("left");

    // Init Axes elements
    this.xAxisEl = this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,"+that.height+")") 
      .call(that.xAxis);

    this.yAxisEl = this.svg.append("g")
      .attr("class", "y axis")
      .call(that.yAxis);

    // Add an x-axis label.
    this.xAxisLabelEl = this.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", that.width)
        .attr("y", that.height - 6)
        .text(that.model.get("xDatasetName"));

    // Add a y-axis label.
    this.yAxisLabelEl = this.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(that.model.get("yDatasetName"));


  },

  updateScales: function(){

  },

  resetScalesAndAxes: function(){
    var that = this;

    this.xAxisEl.remove();
    this.yAxisEl.remove();
    this.xAxisLabelEl.remove();
    this.yAxisLabelEl.remove();

    console.log("Y data range");
    console.log(this.model.getYDataRange()); 
    console.log(this.model.get("yDatasetName"));

    // Create Scales 
    this.xScale = d3.scale.linear()
      .domain(this.model.get("filter").get("xDataRange"))
      .range([0, this.width]);

    this.yScale = d3.scale.linear()
      .domain(this.model.get("filter").get("yDataRange"))
      .range([that.height, 0]);

    this.popuScale = d3.scale.linear()
      .domain(this.model.findExtendOfAnIndicator("population"))
      .range(this.dotSizeRange);


    // Create Axes
    this.xAxis = d3.svg.axis()
      .scale(that.xScale)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(that.yScale)
      .orient("left");

    // Init Axes elements
    this.xAxisEl = this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,"+that.height+")") 
      .call(that.xAxis);

    this.yAxisEl = this.svg.append("g")
      .attr("class", "y axis")
      .call(that.yAxis);

    // Add an x-axis label.
    this.xAxisLabelEl = this.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", that.width)
        .attr("y", that.height - 6)
        .text(that.model.get("xDatasetName"));

    // Add a y-axis label.
    this.yAxisLabelEl = this.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(that.model.get("yDatasetName"));
  },

  updateScalesAndAxes: function(){
    console.log("update scales and axes");
    // Create Scales 
    var that = this;
    this.xScale = d3.scale.linear()
      .domain(this.model.get("filter").get("xDataRange"))
      .range([0, this.width]);

    this.yScale = d3.scale.linear()
      .domain(this.model.get("filter").get("yDataRange"))
      .range([that.height, 0]);

    this.popuScale = d3.scale.linear()
      .domain(this.model.findExtendOfAnIndicator('population'))
      .range(this.dotSizeRange);


    // Create Axes
    this.xAxis = d3.svg.axis()
      .scale(that.xScale)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(that.yScale)
      .orient("left");

    // Init Axes elements
    this.xAxisEl
      .call(that.xAxis);

    this.yAxisEl 
      .call(that.yAxis);

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


      this.yearSelector = this.svg.append("rect")
        .attr("class", "overlay")
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
    console.log("======xDataRange============");
    console.log(this.model.get("filter").get("xDataRange"));
    console.log("======yDataRange============");
    console.log(this.model.get("filter").get("yDataRange"));

    // Add a dot per nation
    // this.baseGraph is a selection ?
    var dots = this.baseGraph
      // d.country is the key to identify different array element
        .data(this.model.getSelDataXYPlot(), function(d){ 
          return d.country;})
      .attr("visibility", "visible")
      .attr("cx", function(d){ 
        // It is possible that some countries won't have this indicator record
        // therefore, return 0 
        return that.xScale(d[that.model.get("xDatasetName")] || 0 ); 
      })
      .attr("cy", function(d){ 
        // It is possible that some countries won't have this indicator record
        // therefore, return 0 
        return that.yScale(d[that.model.get("yDatasetName")] || 0 ); 
      })
      .attr("r", function(d){
        return that.popuScale(d["population"] || 0 );
      })
      .style("fill", function(d){
        return WBD.mapContinentToColor[d["continent"]];
      })
      .style("stroke-width", function(d){

        if( d.country == that.model.get("filter").get("hoveredCountry") ){
          return that.strokeWidth;
        } else {
          return 1;
        }
      })
      .style("stroke", function(d){
        if( d.country == that.model.get("filter").get("hoveredCountry") ){
          return that.stroke;
        } else {
          return "black";
        }
      });
    
    

    dots.exit()
      .attr("visibility", "hidden");

    this.updateYearSelector();
    this.updateScalesAndAxes();
    // this.resetScalesAndAxes();
    // that.renderAxes();

		console.log("done");
  },

  highlightHoveredCountry: function(){
    console.log("highlightHoveredCountry");
    var that = this;
    var dots = this.baseGraph
      // d.country is the key to identify different array element
        .data(this.model.getSelDataXYPlot(), function(d){ 
          return d.country;})
      .attr("visibility", "visible")
      .attr("cx", function(d){ 
        // It is possible that some countries won't have this indicator record
        // therefore, return 0 
        return that.xScale(d[that.model.get("xDatasetName")] || 0 ); 
      })
      .attr("cy", function(d){ 
        // It is possible that some countries won't have this indicator record
        // therefore, return 0 
        return that.yScale(d[that.model.get("yDatasetName")] || 0 ); 
      })
      .attr("r", function(d){
        return that.popuScale(d["population"] || 0 );
      })
      .style("fill", function(d){
        return WBD.mapContinentToColor[d["continent"]];
      })
      .style("stroke-width", function(d){

          if( d.country == that.model.get("filter").get("hoveredCountry") ){
            return that.strokeWidth;
          } else {
            return 0;
          }
      })
      .style("stroke", function(d){
        if( d.country == that.model.get("filter").get("hoveredCountry") ){
          return that.stroke;
        } else {
          return "black";
        }
      });
  },


  order: function(a, b) {
    return b.population - a.population;
  },

  initChart: function(){
    var that = this;
    // Add a dot per nation
    this.baseGraph = this.svg.append("g")
        .attr("class", "dots")
      .selectAll("dot")
        .data(this.model.getSelDataXYPlot(), function(d){ return d.country})
      .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d){ return d.country; })
        .attr("cx", function(d){ 

          return that.xScale(d[that.model.get("xDatasetName")] || 0 ); 
        })
        .attr("cy", function(d){ 
          // It is possible that some countries won't have this indicator record
          // therefore, return 0 
          return that.yScale(d[that.model.get("yDatasetName")] || 0 ); 
        })
        .style("fill", function(d){
          return WBD.mapContinentToColor[d["continent"]];
        })
        .style("stroke-width", function(d){

          if( d.country == that.model.get("filter").get("hoveredCountry") ){
            return that.strokeWidth;
          } else {
            return 0;
          }
        })
        .attr("r", function(d){
          return that.popuScale(d["population"] || 0 );
        })
        .style("stroke", function(d){
          if( d.country == that.model.get("filter").get("hoveredCountry") ){
            return that.stroke;
          } else {
            return "black";
          }
        })
        .sort(that.order);

    
    // Add tipsy, not a good way
    $("#xy-plot circle").each(function(){
      var d = this.__data__;
      var country = d.country;
      //console.log(country);

      $(this).qtip({
        content: country,
        show: 'mouseover',
        hide: 'mouseout',
        position: {
          corner: {
             target: 'topRight',
             tooltip: 'bottomLeft'
          }
        }
      });
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

  // Activated when mouseover a dot 
  addDotLabel: function(d, i){
    
  },

  //
  removeDotLabel: function(d, i){
    var circle = d3.select(this);
    circle.attr("fill", "steelblue" );

    // display none removes element totally, whereas visibilty in last example just hid it
    d3.select(".infobox").style("display", "none"); 
  },

  addToolTip: function(d, i){
    

  },

  setFilterByYear: function(year){
    var that = this;
    that.model.get("filter").set({ year: Math.round(year)}); 
    // that.yearLabel = Math.round(year);
  }

});