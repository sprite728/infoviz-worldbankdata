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
	
	for (var country in allCountries){
		if(allCountries.hasOwnProperty(country)){
			//console.log(allCountries[country]);
			$("#countries_filter").append("<button class='country'>" + allCountries[country] + "</button><br />");
		}
	}
	
	$("#countries_filter .country").click(function(){
//console.log($(this).text());
		that.model.get("filter").toggleCountry($(this).text());
//console.log("filter.get contries");
		console.log(that.model.get("filter").get("countries"));
	});
	
	$("#xyAxis > select").change(function(e) {
        console.log("X Axis: ", $("#xAxisPicker").val());
		console.log("Y Axis: ", $("#yAxisPicker").val());
    });
	
	$( "#slider-xAxis" ).slider({
        range: true,
        min: 0,
        max: 150,
        values: [ 0, 150 ],
        slide: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
        }
    });
    $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
        " - $" + $( "#slider-range" ).slider( "values", 1 ) );
	
	this.model.bind("change:filter", this.render, this );
	//var countries = $.ajax({url: "./countries.json", async: false});
	//var names =_.map(JSON.parse(countries.responseText), function(country){return country.country});
	//console.log(names);
	
	//for (name in names){
	//	$("#countries").append("<button class='country'>" + name + "</button>");
	//}
  },
  
  render: function() {
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
