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
    countries: [], // countries filter 
    regions: [] // regions filter
  },
  
  toggleCountry: function(country) {
	  console.log("this.countries");
	  console.log(this.countries);
	  console.log("this");
	  console.log(this);
	  var tempCountries = this.countries || [];

	  if( typeof tempCountries == 'undefined' || tempCountries.length == 0 ){
		  console.log("Happy");
		  tempCountries.push(country);
	  }
	  else if(tempCountries.indexOf(country)>-1){
		  console.log("Two Happy!");
		  tempCountries.remove(country);
	  }
	  else{
		  tempCountries.push(country);
	  }
	  
	  console.log(tempCountries);
	  
	  this.set({countries : tempCountries});
  },
  
  
});

// Entries Prototype
WBD.Entries = Backbone.Model.extend({
  defaults: {
    allData: [], // [{'country': 'taiwan', 'year': '1234' ... }, ...]
    selDataXYPlot: [],
    filter: {}

    // Constants
    // DatasetLabels 
      // xDatasetLabel
      // yDatasetLabel
    // yearRage: [min, max]
    // currentViewTab: 'map' or 'xy-plot'
  },

  initialize: function(opts){
    this.allData = opts.allData;
    this.set("filter", new WBD.Filter());
    this.set("selDataXYPlot", []);
    this.applyFilter();

    // listen to any changes happen with filter
    // if filter is changed, call applyFilter
    // applyFilter would change other attributes which is subscribe by 
    // other views. 
    // Therefore, when applyFilter is called, other views would change subsequently 
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