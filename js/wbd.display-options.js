// Author: An Yang anyang@umich.edu
var WBD = WBD || {};

// 
WBD.DisplayOptionView = Backbone.View.extend({

/*  className: 'options',
  id: 'options',
  tagName: 'div',
*/
  year: 2000,
  countries: [],
  regions:[],
  
  el: $("#options"),
  
  initialize: function(opts){
	//$('#main').append(this.el);
	var allCountries = WBD.allCountries;
	var allContinenst = WBD.allContinents;
	
	this.model = opts.model;
	var that = this;

	console.log(allCountries);
	
	for (var country in allCountries){
		if(allCountries.hasOwnProperty(country)){
			console.log(allCountries[country]);
			$("#countries_filter").append("<button class='country'>" + allCountries[country] + "</button><br />");
		}
	}
	
	$("#countries_filter .country").click(that, function(){
//console.log($(this).text());
		var self = that;
		self.model.get("filter");//.toggleCountry($(this).text());
		self.model.get("filter").toggleCountry($(this).text());
		console.log("get filter");
		console.log(self.model.get("filter"));
		console.log("filter.get contries");
		console.log(self.model.get("filter").get("countries"));
		that.update();
	});
	
	//var countries = $.ajax({url: "./countries.json", async: false});
	//var names =_.map(JSON.parse(countries.responseText), function(country){return country.country});
	//console.log(names);
	
	//for (name in names){
	//	$("#countries").append("<button class='country'>" + name + "</button>");
	//}
  },
  
  update: function() {
    var that = this;
	
	var year = this.model.get("filter").get("year");
	var countries = this.model.get("filter").get("countries");
	var regions = this.model.get("filter").get("regions");
	
	//console.log(regions + " >> " + countries + " >> " + year);
	
  },
  
  renderXYPlot: function(){
	
  },  
  
  renderMap: function(){
	    
  },
  
});
