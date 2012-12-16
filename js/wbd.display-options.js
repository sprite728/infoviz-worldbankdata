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
		this.model = opts.model;
		
		this.doInitialDrawing();
		this.doHandle();
		
		this.model.bind("change:filter", this.render, this );
		//var countries = $.ajax({url: "./countries.json", async: false});
		//var names =_.map(JSON.parse(countries.responseText), function(country){return country.country});
		//console.log(names);
		
		//for (name in names){
		//	$("#countries").append("<button class='country'>" + name + "</button>");
		//}
  },
	
	doInitialDrawing: function(){
		var that = this;
		
		var allCountries = WBD.allCountries;
		var allContinents = WBD.allContinents;
		var allIndicators = WBD.allIndicators;
		var allCategories = WBD.allCategories;
		
		//console.log("=================All Indicators==============");
		//console.log(allIndicators);
		
		
		var xDataRange = this.model.get("filter").get("xDataRange");
		var yDataRange = this.model.get("filter").get("yDataRange");
		var circleSizeRange = this.model.get("filter").get("circleSizeRange");
		
		//Indicator Pickers Initialized here
		var defaultX = that.model.get("xDatasetName");
		var defaultY = that.model.get("yDatasetName");
		
		$("#xAxisPicker").append("<option class='xIndicator'>" + defaultX + "</option>");
		$("#yAxisPicker").append("<option class='yIndicator'>" + defaultY + "</option>");
		
		for (var indicator in allIndicators){
			if(allIndicators.hasOwnProperty(indicator) && allIndicators[indicator] != "population" ){
					if(allIndicators[indicator] != defaultX ){
						$("#xAxisPicker").append("<option class='xIndicator'>" + allIndicators[indicator] + "</option>");
					}
					if(allIndicators[indicator] != defaultY){
						$("#yAxisPicker").append("<option class='yIndicator'>" + allIndicators[indicator] + "</option>");
					}
			}
		}
		
		
		/*
		console.log("X Data Ranges: " +  xDataRange);
		console.log("Y Data Ranges: " +  yDataRange);
		console.log("Z Data Ranges: " +  circleSizeRange);
		*/
		
		//console.log("xDataRange: ", xDataRange[0]);
		//console.log("yDataRange: ", yDataRange[1]);
		
		var country, continent;
		var allData =  this.model.get("allData");
		for (country in allCountries){
			if(allCountries.hasOwnProperty(country)){
				$("#countries_filter").append("<button class='country'>" + allCountries[country] + "</button><br />");
				console.log("Test: " + allData[country]["country"] + " C1:"+ allData[country]["continent"]);
			}
		}
		
		for (continent in allContinents){
			if(allContinents.hasOwnProperty(continent)){
				$("#continents_filter").append("<button class='continent'>" + allContinents[continent] + "</button><br />");
			}
		}
		
		$("#countries_tags").tagit({
			availableTags: allCountries,
			autocomplete: {delay: 0, minLength: 2},
			caseSensitive: true,
			allowDuplicates: false,
			//removeConfirmation: true,
			
			afterTagAdded: function(evt, ui) {
				that.model.get("filter").addCountry($(this).tagit("tagLabel", ui.tag));
			},
			afterTagRemoved: function(evt, ui) {
				that.model.get("filter").removeCountry($(this).tagit("tagLabel", ui.tag));
			},
		});
		
		$("#continents_tags").tagit({
			availableTags: allContinent,
			autocomplete: {delay: 0, minLength: 1},
			caseSensitive: true,
			allowDuplicates: false,
			//removeConfirmation: true,
			
			afterTagAdded: function(evt, ui) {
				that.model.get("filter").addContinent($(this).tagit("tagLabel", ui.tag));
			},
			afterTagRemoved: function(evt, ui) {
				that.model.get("filter").removeContinent($(this).tagit("tagLabel", ui.tag));
			},
		});
		
		//Data Range Sliders here
		$( "#slider-xAxis" ).slider({
			range: true,
			min: xDataRange[0],
			max: xDataRange[1],
			values: xDataRange,
			slide: function( event, ui ) {
        $( "#xRangeText" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
				that.model.get("filter").set({xDataRange: ui.values});
      }
    });
		$( "#xRangeText" ).val( "$" + $( "#slider-xAxis" ).slider( "values", 0 ) +
            " - $" + $( "#slider-xAxis" ).slider( "values", 1 ) );
		
		$( "#slider-yAxis" ).slider({
			range: true,
			min: yDataRange[0],
			max: yDataRange[1],
			values: yDataRange,
			slide: function( event, ui ) {
				$( "#yRangeText" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
				that.model.get("filter").set({ yDataRange: ui.values});
			}
    });
		$( "#yRangeText" ).val( "$" + $( "#slider-yAxis" ).slider( "values", 0 ) +
            " - $" + $( "#slider-yAxis" ).slider( "values", 1 ) );
		
		$( "#slider-circleSize" ).slider({
			range: true,
			min: circleSizeRange[0],
			max: circleSizeRange[1],
			values: circleSizeRange,
			slide: function( event, ui ) {
				$( "#circleSizeText" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
				that.model.get("filter").set({ circleSizeRange: ui.values});
			}
		});
		$( "#circleSizeText" ).val( "$" + $( "#slider-circleSize" ).slider( "values", 0 ) +
            " - $" + $( "#slider-circleSize" ).slider( "values", 1 ) );
		
	},
  
	doHandle: function(){
		var that = this;
		$("#countries_filter .country").click(function(){
			//console.log($(this).text());
			var isNewCountry = that.model.get("filter").isNewCountry($(this).text());
			//console.log("TorF: " + isNewCountry);
			if(isNewCountry){
				$("#countries_tags").tagit("createTag", $(this).text());
			}
			else{
				$("#countries_tags").tagit("removeTagByLabel", $(this).text());
			}
			//console.log("filter.get contries");
			//console.log(that.model.get("filter").get("countries"));
		});
		
		//Indicator Selection Controllers here
		$("#xyAxis > select").change(function(e) {
			var xName = $("#xAxisPicker").val();
			var yName = $("#yAxisPicker").val();
			that.model.set("xDatasetName: xName");
			that.model.set("yDatasetName: xName");
			//that.model.set("selDataXYPlot", that.model.get("allData")); 
			
			console.log("============== CHANGING XY AXIS ===============");
			console.log("X Axis: ", $("#xAxisPicker").val());
			console.log("Y Axis: ", $("#yAxisPicker").val());
		});
	
		//Data Range Slider Controllers here
	},
	
  render: function() {
    var that = this;
		
		this.doDrawing;
		this.doHandle;
		/*
		var year = this.model.get("filter").get("year");
		var countries = this.model.get("filter").get("countries");
		var regions = this.model.get("filter").get("regions");
		*/
		//console.log(regions + " >> " + countries + " >> " + year);
	
  },
  
  renderXYPlot: function(){
	
  },  
  
  renderMap: function(){
	    
  },
  
});
