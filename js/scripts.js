// Author: Chuan-Che Huang, chuanche@umich.edu

var WBD = WBD || {};

// main function 
$(document).ready(function(){

  // Prepare all the indicators, countries and continents

  d3.json("worldbankdata2.json", function(data){
      // Main Variables 
    var myEntries;
    var mySelectedData;
    var myXYPlotView;
    var myMapView;

    // read all countries
    // console.log("Read countries")
    $.ajax({
      url: 'parser/countries.json',
      data: data,
      success: function(data){
        //console.log(data);
        if($.parseJSON(data) == null){
          WBD.allCountries = data;
        } else {
          WBD.allCountries = $.parseJSON(data);
        }
        //console.log(WBD.allCountries);
      },
      async: false
    });
    //console.log(WBD.allCountries);


    // read all indicators
    // console.log("Read indicators")
    $.ajax({
      url: 'parser/indicators.json',
      data: data,
      success: function(data){
        //console.log(data);
        if($.parseJSON(data) == null){
          WBD.allIndicators = data;
        } else {
          WBD.allIndicators = $.parseJSON(data);
        }
        //console.log(WBD.allCountries);
      },
      async: false
    });
		console.log("===========WBD Indicators==========");
		console.log(WBD.allIndicators);
    // read all continents
    //console.log("Read continents")
    $.ajax({
      url: 'parser/continents.json',
      data: data,
      success: function(data){
        //console.log(data);
        if($.parseJSON(data) == null){
          WBD.allContinents = data;
        } else {
          WBD.allContinents = $.parseJSON(data);
        }
        //console.log(WBD.allContinents);
      },
      async: false
    });



    // --- Start program ---
    // Create Collection: myEntries
    //console.log("Read and store data ... ");

    // read data into WBD.Record
    myEntries = new WBD.Entries({
      allData: WBD.prepareData(data)
    });

	  myAllCountries = WBD.allCountries;
	  myAllContinents = WBD.allContinents; 
      // console.log("Check myEntries");
      // console.log(myEntries.get('allData'));
      

      // Create a XY Plot
    myXYPlotView = new WBD.XYPlot(
    {
      model: myEntries
    });
	  
	  myOptionsView = new WBD.DisplayOptionView({
      model: myEntries,
		  allCountries : myAllCountries
    });

    myMapView = new WBD.Map({
      model: myEntries
    });
  });
});