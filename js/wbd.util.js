var WBD = WBD || {};

// Add a remove method to Array
// reference: http://javascriptweblog.wordpress.com/
Array.prototype.remove = function(member) {
  var index = this.indexOf(member);

  if (index > -1) {
    this.splice(index, 1);
  }

  return this;
}

Array.prototype.clone = function(array) {
	var newArray = array.slice();
	return newArray;
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
}
 

WBD.prepareData = function(data){
  // Put pre-processing code here ...
  //console.log("Prepare data ... ");
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


WBD.prepareConstants = function(){
  console.log("prepareConstants");
  // read all countries
  var data;

  //console.log("Read countries")
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
  // console.log(WBD.allCountries);


  // read all indicators
  console.log("Read indicators")
  $.ajax({
    url: 'parser/indicators.json',
    data: data,
    success: function(data){
      console.log(data);
      if($.parseJSON(data) == null){
        WBD.allIndicators = data;
      } else {
        WBD.allIndicators = $.parseJSON(data);
      }
      console.log(WBD.allIndicators);
    },
    async: false
  });

  // read all continents
  console.log("Read continents")
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

  $.ajax({
    url: 'parser/mapCountryToContinent.json',
    data: data,
    success: function(data){
      //console.log(data);
      if($.parseJSON(data) == null){
        WBD.mapCountryToContinent = data;
      } else {
        WBD.mapCountryToContinent = $.parseJSON(data);
      }
      //console.log(WBD.allContinents);
    },
    async: false
  });

}

WBD.getContinentByCountry = function(country){
  return WBD.mapCountryToContinent[country];
}