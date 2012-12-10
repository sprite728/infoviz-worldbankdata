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

WBD.allCountries = ["Canada", "Taiwan", "United States"];
WBD.allContinents = ["Africa"];