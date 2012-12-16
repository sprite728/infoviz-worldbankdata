// Author: Chuan-Che Huang, chuanche@umich.edu
//				 An Yang, anyang@umich.edu

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
    continents: [], // regions filter
    categories: [],
    xDataRange: [], // [ min, max] if empty or only 1 element -> wrong
    yDataRange: [], // [ min, max] if empty or only 1 element -> wrong
    populationRange: []
  },


  toggleCountry: function(country) {
	  var tempCountries = this.get("countries");

	  if(tempCountries.indexOf(country)>-1){
		  tempCountries.remove(country);
	  }
	  else{
		  tempCountries.push(country);
	  }
	  
	  this.set({countries : tempCountries});
		console.log("Changed Courntries:" + this.get("countries"));
	  //this.trigger("change:countries");
  },

	
	isNewCountry: function(country) {
	  var tempCountries = this.get("countries");
		var isNewCountry = true;

	  if(tempCountries.indexOf(country)>-1){
			isNewCountry = false;
	  }
	  else{
			isNewCountry = true;
	  }
		return isNewCountry;
  },
	
  addCountry: function(country) {
		var tempCountries = this.get("countries");
		tempCountries.push(country);
	  this.set({countries : tempCountries});
		console.log("Changed Courntries:" + this.get("countries"));
  },
	
	removeCountry: function(country) {
		var tempCountries = this.get("countries");
		tempCountries.remove(country);	  
	  this.set({countries : tempCountries});
		console.log("Changed Courntries:" + this.get("countries"));
	},
  
  toggleContinent: function(continent) {

	  var tempContinents = this.get("continents");

	  if(tempContinents.indexOf(continent)>-1){
		  tempContinents.remove(continent);
	  }
	  else{
		  tempContinents.push(continent);
	  }
	  
	  this.set({regions : tempContinents});
	  //this.trigger("change:regions");
  },
  
  
});

// Entries Prototype
WBD.Entries = Backbone.Model.extend({
  defaults: {
    allData: [], // [{'country': 'taiwan', 'year': '1234' ... }, ...]
    selDataXYPlot: [],
    filter: {},

    // Constants
    // DatasetLabels 
      // xDatasetLabel
      // yDatasetLabel
    // yearRage: [min, max]
    // currentViewTab: 'map' or 'xy-plot'
    xDatasetName: "gni",
    yDatasetName: "life_expectency",
    isViewByCountry: false,
    xDatasetScale: "linear",
    yDatasetScale: "linear",
  },

  initialize: function(opts){
    this.allData = opts.allData;

    this.xDatasetName = opts.xDatasetName;
    this.yDatasetName = opts.yDatasetName;

    this.set("filter", new WBD.Filter());
    
    // init X data range and Y data range
    this.updateXYDataRanges();

    this.set("selDataXYPlot", []);
    this.applyFilter();

    // listen to any changes happen with filter
    // if filter is changed, call applyFilter
    // applyFilter would change other attributes which is subscribe by other views. 
    // Therefore, when applyFilter is called, other views would change subsequently 
    this.get("filter").bind("change", this.applyFilter, this);
		//this.get("filter").bind("change:countries", this.applyFilter, this);
  },

  updateXYDataRanges: function(){
    var that = this;
    var filter = this.get("filter");
    console.log("filter");
    console.log(filter);

    filter.set(
      { 
        xDataRange: this.findExtendOfAnIndicator(this.xDatasetName),
        yDataRange: this.findExtendOfAnIndicator(this.yDatasetName),
        populationRange: this.findExtendOfAnIndicator("population")
      }
    );
    
    console.log("Hello");
    console.log(filter.get("xDataRange"));
    console.log(filter.get("yDataRange"));
    console.log(filter.get("populationRange"));

  },

  // @ind = indiciator, a string 
  findExtendOfAnIndicator: function(ind)
  {
    var that = this;
    var maxInd, minInd;
    var tempIndicatorSet;
    
    console.log("indicator");
    console.log(ind);
    // find max value of X and Y
    
    // find max X
    var dd = that.allData.map(function(d){
     
      tempIndicatorSet = d[ind] || []; 
      // console.log(tempIndicatorSet);

      return tempIndicatorSet
        .reduce(
          function(previousValue, currentValue, index, array){
           
            return Math.max(+previousValue, +currentValue[1]);
          }, 
          -Infinity
        ) || 0;
    });

    console.log("dd");
    console.log(dd);

    maxInd = dd.reduce(
      function(previousValue, currentValue, index, array){
        return Math.max(previousValue, currentValue);
      },
      -Infinity
    );

    // find min
    dd = that.allData.map(function(d){
      
      tempIndicatorSet = d[ind] || []; 
      // console.log(tempIndicatorSet);

      return tempIndicatorSet
        .reduce(
          function(previousValue, currentValue, index, array){
            return Math.min(previousValue, currentValue[1]);
          }, 
          Infinity
        ) || 0;
    });

    console.log("dd");
    console.log(dd);

    minInd = dd.reduce(
      function(previousValue, currentValue, index, array){
        console.log(ind);
        // console.log(array);
        console.log(previousValue);
        console.log(currentValue);
        console.log(array[0]);
        console.log(Math.min( previousValue, currentValue));
        return Math.min(previousValue, currentValue);
      },
      Infinity
    );


    console.log("extend");
    console.log([minInd, maxInd]);

    return [minInd, maxInd];
  },


  // filter allData to selectedData
  applyFilter: function(){
    var that = this;
    console.log("applyFilter");
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

			if( !that.isSelectedCountry(d.country) ){
				return;
			}

      for( key in d){
        if(d.hasOwnProperty(key)){
          // Only check the parts that's not inherited from other places
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
        returnObj.continent = d.continent;
        return returnObj;
      }
    });
    
		filteredData = filteredData.filter(function(element, index, array){
			return ( element !== undefined );
		});
				
    this.set("selDataXYPlot", filteredData);
  },

  isSelectedCountry: function(country){
		var countries = this.get("filter").get("countries");
		if(countries.length == 0){return true;}
		if(countries.indexOf(country)>-1){
			return true;
		}
		else{
			return false;
		}
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