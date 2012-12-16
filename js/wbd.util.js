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

WBD.prepareData = function(data){
  // Put pre-processing code here ...
  console.log("Prepare data ... ");
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
  // read all countries
  var data;
  
  console.log("Read countries")
  $.ajax({
    url: 'parser/countries.json',
    data: data,
    success: function(data){
      console.log(data);
      if($.parseJSON(data) == null){
        WBD.allCountries = data;
      } else {
        WBD.allCountries = $.parseJSON(data);
      }
      console.log(WBD.allCountries);
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
      console.log(WBD.allCountries);
    },
    async: false
  });

  // read all continents
  console.log("Read continents")
  $.ajax({
    url: 'parser/continents.json',
    data: data,
    success: function(data){
      console.log(data);
      if($.parseJSON(data) == null){
        WBD.allContinents = data;
      } else {
        WBD.allContinents = $.parseJSON(data);
      }
      console.log(WBD.allContinents);
    },
    async: false
  });

}