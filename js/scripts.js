// Author: Chuan-Che Huang, chuanche@umich.edu

var WBD = WBD || {};

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