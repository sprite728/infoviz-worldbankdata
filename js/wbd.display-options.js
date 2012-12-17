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
  continents:[],
	countriesCache: [],
  
  el: $("#options"),
  
  initialize: function(opts){
		this.model = opts.model;
		
		this.doInitialDrawing();
		this.doHandle();
		
		this.countries = this.model.get("filter").get("countries");
		this.continents = this.model.get("filter").get("continents");
		this.countriesCache = [];
		this.model.get("filter").bind("change", this.update, this);
		this.model.bind("change:xDatasetName", this.updateXYAxisSliders, this);
		this.model.bind("change:yDatasetName", this.updateXYAxisSliders, this);
		//var countries = $.ajax({url: "./countries.json", async: false});
		//var names =_.map(JSON.parse(countries.responseText), function(country){return country.country});
		//console.log(names);
		
		//for (name in names){
		//	$("#countries").append("<button class='country'>" + name + "</button>");
		//}
  },
	
	doInitialDrawing: function(){
		var that = this; 
		var index = 0;
		
		var allCountries = WBD.allCountries.sort();
		var allContinents = WBD.allContinents.sort();
		var allIndicators = WBD.allIndicators.sort();
		var allCategories = WBD.allCategories.sort();
		var allData = this.model.get("allData");
		
		//console.log("=================All Indicators==============");
		//console.log(allIndicators);
		
		var xDataRange = this.model.get("filter").get("xDataRange");
		var yDataRange = this.model.get("filter").get("yDataRange");
		var populationRange = this.model.get("filter").get("populationRange");
		
		//Indicator Pickers Initialized here
		var defaultX = that.model.get("xDatasetName");
		var defaultY = that.model.get("yDatasetName");
		
		$("#xAxisPicker").append("<option class='xIndicator'>" + defaultX.replace("_", " ").toUpperCase() + "</option>");
		$("#yAxisPicker").append("<option class='yIndicator'>" + defaultY.replace("_", " ").toUpperCase() + "</option>");
		
		for (index = 0; index < allIndicators.length; index ++){
			allIndicators[index] = allIndicators[index].replace("_", " ").toUpperCase();
			if(allIndicators[index] != "POPULATION" ){
					if(allIndicators[index] != defaultX.replace("_", " ").toUpperCase()){
						$("#xAxisPicker").append("<option class='xIndicator'>" + allIndicators[index] + "</option>");
					}
					if(allIndicators[index] != defaultY.replace("_", " ").toUpperCase()){
						$("#yAxisPicker").append("<option class='yIndicator'>" + allIndicators[index] + "</option>");
					}
			}
		}	
		/*
		console.log("X Data Ranges: " +  xDataRange);
		console.log("Y Data Ranges: " +  yDataRange);
		console.log("Z Data Ranges: " +  populationRange);
		*/
		
		//console.log("xDataRange: ", xDataRange[0]);
		//console.log("yDataRange: ", yDataRange[1]);	
		
		$("#tabs").tabs();
		
		for (index = 0; index < allCountries.length; index++){
				var aCountryName = allCountries[index];
				//console.log("Country Name: "+ aCountryName);	
				//console.log("Continent: " + WBD.getContinentByCountry(aCountryName));
				if(WBD.getContinentByCountry(aCountryName)){
					$("#countries_filter").append("<li><button class='country grey'>" + allCountries[index] + "</button></li>");
				}
				else{
					$("#countries_filter").append("<li><button class='country undefined'>" + allCountries[index] + "</button></li>");
				}
		}
		
		$("#countries_tags").tagit({
			availableTags: allCountries,
			autocomplete: {delay: 0, minLength: 2},
			caseSensitive: true,
			allowDuplicates: false,
			allowSpaces: true,
			removeConfirmation: true,
			placeholderText: "Search for countries",
			
			beforeTagAdded: function(event, ui) {
        //console.log("=================Tag Validation=====================");
        //console.log(ui.tag);
				//console.log($(this).tagit("tagLabel", ui.tag));
				var tempTagLabel = $(this).tagit("tagLabel", ui.tag);
				if(allCountries.indexOf(tempTagLabel)<0){return false;}
    	},
			afterTagAdded: function(evt, ui) {
				var tempTagLabel = $(this).tagit("tagLabel", ui.tag);
				if(that.model.get("filter").isNewCountry(tempTagLabel)){
					that.model.get("filter").addCountry($(this).tagit("tagLabel", ui.tag));
				}
			},
			afterTagRemoved: function(evt, ui) {
				var tempTagLabel = $(this).tagit("tagLabel", ui.tag);
				if(!that.model.get("filter").isNewCountry(tempTagLabel)){
					that.model.get("filter").removeCountry($(this).tagit("tagLabel", ui.tag));
					that.colorCountriyOptions(tempTagLabel);
				}
			},
		});


		for (index=0; index<allContinents.length;index++){
			//if(allContinents.hasOwnProperty(index)){
				$("#continents_filter").append("<li><button class='continent "+ allContinents[index].replace(" ","_").toLowerCase() + "'>" + allContinents[index] + "</button></li>");
			//}
		}
		
		$("#continents_tags").tagit({
			availableTags: allContinents,
			autocomplete: {delay: 0, minLength: 2},
			caseSensitive: true,
			allowDuplicates: false,
			allowSpaces: true,
			removeConfirmation: true,
			placeholderText: "Search for continents",
			
			beforeTagAdded: function(event, ui) {
				var tempTagLabel = $(this).tagit("tagLabel", ui.tag);
				if(allContinents.indexOf(tempTagLabel)<0){return false;}
				if(this.countries.indexOf(tempTagLabel)<0){return false;}
    	},
			afterTagAdded: function(evt, ui) {
				that.model.get("filter").addContinent($(this).tagit("tagLabel", ui.tag));
			},
			afterTagRemoved: function(evt, ui) {
				that.model.get("filter").removeContinent($(this).tagit("tagLabel", ui.tag));
			},
		});


		$("#countries_filter").show();
		$("#continents_filter").hide();
		
		//Data Range Sliders here
		$( "#slider-xAxis" ).slider({
			range: true,
			min: xDataRange[0],
			max: xDataRange[1],
			values: xDataRange,
			slide: function( event, ui ) {
	        $( "#xRangeText" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
					that.model.get("filter").set({xDataRange: ui.values});
					// that.model.get("filter").trigger("change");

					console.log("====Slider===xDataRange======");
					console.log(ui.values);
	      	}
    	});
		
		$( "#xRangeText" ).val( $( "#slider-xAxis" ).slider( "values", 0 ) +
            " - " + $( "#slider-xAxis" ).slider( "values", 1 ) );
		
		$( "#slider-yAxis" ).slider({
			range: true,
			min: yDataRange[0],
			max: yDataRange[1],
			values: yDataRange,
			slide: function( event, ui ) {
				$( "#yRangeText" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				that.model.get("filter").set({ yDataRange: ui.values});
			}
    	});

		$( "#yRangeText" ).val( $( "#slider-yAxis" ).slider( "values", 0 ) +
            " - " + $( "#slider-yAxis" ).slider( "values", 1 ) );
		
		$( "#slider-population" ).slider({
			range: true,
			min: populationRange[0],
			max: populationRange[1],
			values: populationRange,
			slide: function( event, ui ) {
				$( "#populationRangeText" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				that.model.get("filter").set({ populationRange: ui.values});
			}
		});
		$( "#populationRangeText" ).val( $( "#slider-population" ).slider( "values", 0 ) +
            " - " + $( "#slider-population" ).slider( "values", 1 ) );
		
	},

	updateXYAxisSliders: function(){
		var that = this;
		console.log("update x y axis sliders")

		$( "#slider-xAxis" ).slider({
			range: true,
			min: this.model.get("filter").get("xDataRange")[0],
			max: this.model.get("filter").get("xDataRange")[1],
			values: this.model.get("filter").get("xDataRange"),
			slide: function( event, ui ) {
	        $( "#xRangeText" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
					that.model.get("filter").set({xDataRange: ui.values});
					// that.model.get("filter").trigger("change");

					console.log("====Slider===xDataRange======");
					console.log(ui.values);
	      	}
    	});

		$( "#xRangeText" ).val( $( "#slider-xAxis" ).slider( "values", 0 ) +
            " - " + $( "#slider-xAxis" ).slider( "values", 1 ) );


		$( "#slider-yAxis" ).slider({
			range: true,
			min: this.model.get("filter").get("yDataRange")[0],
			max: this.model.get("filter").get("yDataRange")[1],
			values: this.model.get("filter").get("yDataRange"),
			slide: function( event, ui ) {
				$( "#yRangeText" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				that.model.get("filter").set({ yDataRange: ui.values});
			}
    	});

    	$( "#yRangeText" ).val( $( "#slider-yAxis" ).slider( "values", 0 ) +
            " - " + $( "#slider-yAxis" ).slider( "values", 1 ) );
	},
  
	doHandle: function(){
		var that = this;
		$("#countries_filter .country").click(function(){
			//console.log($(this).text());
			var tempCountryName = $(this).text();
			var isNewCountry = that.model.get("filter").isNewCountry(tempCountryName);
			
			if(WBD.getContinentByCountry(tempCountryName)){
				$(this).addClass(WBD.getContinentByCountry(tempCountryName).replace(" ", "_").toLowerCase());
				$(this).removeClass("grey");
			}
			//console.log("TorF: " + isNewCountry);
			if(isNewCountry){
				that.model.get("filter").addCountry(tempCountryName);
				//$("#countries_tags").tagit("createTag", tempCountryName);
				$(this).addClass(WBD.getContinentByCountry(tempCountryName).replace(" ", "_").toLowerCase());
			  $(this).removeClass("grey");
			}
			else{
				that.model.get("filter").removeCountry(tempCountryName);
				//$("#countries_tags").tagit("removeTagByLabel",tempCountryName);
				$(this).removeClass(WBD.getContinentByCountry(tempCountryName).replace(" ", "_").toLowerCase());
				$(this).addClass("grey");
			}
			//console.log("filter.get contries");
			//console.log(that.model.get("filter").get("countries"));
		});
		
			$("#continents_filter .continent").click(function(){
			//console.log($(this).text());
			var isNewItem = that.model.get("filter").isNewContinent($(this).text());
			//console.log("TorF: " + isNewCountry);
			if(isNewItem){
				$("#continents_tags").tagit("createTag", $(this).text());
			}
			else{
				$("#continents_tags").tagit("removeTagByLabel", $(this).text());
				console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Remove from Cutton Click!");
			}
			//console.log("filter.get contries");
			//console.log(that.model.get("filter").get("countries"));
		});
		
		//Indicator Selection Controllers here
		$(".xyAxes select").change(function(e) {
			var xName = $("#xAxisPicker").val().replace(" ", "_").toLowerCase();
			var yName = $("#yAxisPicker").val().replace(" ", "_").toLowerCase();

			that.model.setXYDatasets({xDatasetName: xName, yDatasetName: yName});
			
			//that.model.set("selDataXYPlot", that.model.get("allData")); 
			
			// console.log("============== CHANGING XY AXIS ===============");
			// console.log("X Axis: ", $("#xAxisPicker").val());
			// console.log("Y Axis: ", $("#yAxisPicker").val());
			// console.log("============== END of CHANGING XY AXIS ===============");
		});
		
		$("#tabs ul li").click(function(){
			console.log($(this).text()+" View Selected!");
			var temp = $(this).text();
			if(temp == "Country"){
				that.model.set("isViewedByCountry: true");
				$("#continents_filter").hide();
				$("#countries_filter").show();
			}
			if(temp == "Continent"){
				that.model.set("isViewedByCountry: false");
				$("#countries_filter").hide();
				$("#continents_filter").show();
			}
		});
		
		$("#resetBtn").click(function(){
			that.model.get("filter").set({countries : []});
		});
		
		
		
/*	
	$("#tabs > button").click(function(){
		var temp = $(this).text();
		if(temp == "Country"){
			that.model.set("isViewedByCountry: true");
			$("#continents_tags").hide();
			$("#countries_tags").show();
			$("#continents_filter").hide();
			$("#countries_filter").slideDown();
		}
		if(temp == "Continent"){
			that.model.set("isViewedByCountry: false");
			$("#continents_tags").show();
			$("#countries_tags").hide();
			$("#countries_filter").hide();
			$("#continents_filter").slideDown();
		}
	});
	/*
	$("body").click(function(){
			$("#continents_tags").hide();
			$("#countries_tags").hide();
			$("#countries_filter").hide();
			$("#continents_filter").hide();
	});*/
	
	$(document).mouseup(function (e)
	{
    var container = $("countries_filter");

    if (container.has(e.target).length === 0)
    {
        container.hide();
    }
	});
	
		//Data Range Slider Controllers here
	},
	
  update: function() {
    var that = this, index = 0;
		console.log("=============updating countries===============");
		
		var diffCountriesRemove = that.countriesCache.diff(that.model.get("filter").get("countries"));
		var diffCountriesNew = that.model.get("filter").get("countries").diff(that.countriesCache);
		console.log("diffCountriesRemove");
		console.log(diffCountriesRemove);
		console.log("diffCountriesNew");
		console.log(diffCountriesNew);
		
		for(index=0; index < diffCountriesNew.length; index++){
			//	$("#countries_tags").tagit("removeTagByLabel",that.countries[index]);
				$("#countries_tags").tagit("createTag",diffCountriesNew[index]);
				that.colorCountriyOptions(diffCountriesNew[index]);
				console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Add from Cache!");
		}	
		
		for(index=0; index < diffCountriesRemove.length; index++){
			try{
				$("#countries_tags").tagit("removeTagByLabel",diffCountriesRemove[index]);
				that.colorCountriyOptions(diffCountriesRemove[index]);
				console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Remove from Cache!");
			}
			catch(err){
				continue;
			}
		}
			
		this.countriesCache = that.model.get("filter").get("countries").slice(); // clone the countries
		/*
		var year = this.model.get("filter").get("year");
		var countries = this.model.get("filter").get("countries");
		var regions = this.model.get("filter").get("regions");
		*/
		//console.log(regions + " >> " + countries + " >> " + year);
	
  },
	
	colorCountriyOptions: function(countryIn){
		var that = this;
		$("#countries_filter .country").each(function(index){
			if($(this).text()==countryIn){
				var continentName = WBD.getContinentByCountry(countryIn);
				if(continentName){
					continentName = continentName.replace(" ", "_").toLowerCase();
					// var continentName = WBD.getContinentByCountry(countryIn).replace(" ", "_").toLowerCase();
					console.log("================"+continentName);
					if($(this).hasClass(continentName)){$(this).removeClass(continentName).addClass("grey");}
					else{$(this).addClass(continentName).removeClass("grey");}
				} else {
					// cannot find the continent
				}

				
			}
			
		});		
	}
  
});
