// Author: Chuan-Che Huang, chuanche@umich.edu
var WBD = WBD || {};

// Map
WBD.Map = Backbone.View.extend({
  className: 'map',
  id: 'map',
  tagName: 'div',

  countryElements: [],
  showXValuesOnMap: true,


  initialize: function(opts){
    console.log("map_initialize");

    $('#main').append(this.el);
    this.model = opts.model;

    // Listen to changes on model
    this.model.bind("change:selDataMap", this.renderColorMap, this );

    // Create the map object, append it to this.el
    this.map = org.polymaps.map()
    .container(d3.select(this.el).append("svg:svg").node())
    .center({lat: 51, lon: 0})
    .zoomRange([2,4])
    .zoom(2)
    .add(org.polymaps.interact())
    .add(org.polymaps.drag())
    .add(org.polymaps.wheel().smooth(false))
    .add(org.polymaps.dblclick())
    .add(org.polymaps.arrow());

    // Init tab 
    this.showXValuesOnMap = true;

    // Add the compass control on top.
    this.map.add(org.polymaps.compass()
        .pan("none"));

    // Custom layer implementation.  || TO BE CHANGED
    this.map.container().setAttribute("class", "Blues");    

    // set current indicator according to the current tabs
    this.updateCurrentInd();

    // Initialize color scale
    this.initColorScale();
    this.initBottomMap();
    this.initColorMap();
    //this.initTopMap(); //d3, circles over the map
    // this.updateColorMap();
  },

  initColorScale: function(){
    var that = this;

    if(this.showXValuesOnMap){
      that.colorScale = d3.scale.linear()
        .domain(this.model.get("filter").get("xDataRange"))
        .range([0, 1]);
    }
    else {
      that.colorScale = d3.scale.linear()
        .domain(this.model.get("filter").get("yDataRange"))
        .range([0, 1]);
    }
  },

  initBottomMap: function(){
    console.log("initBottomMap");
    console.log(this);

    // Add the CloudMade image tiles as a base layer
    this.map.add(org.polymaps.image()
        .url(org.polymaps.url("http://{S}tile.cloudmade.com"
        + "/27de2d670c794844882b7e7fdf5ebbef" 
        + "/20760/256/{Z}/{X}/{Y}.png")
        .repeat(false)
        .hosts(["a.", "b.", "c.", ""])));
  },

  updateCurrentInd: function(){
    if(this.showXValuesOnMap){
      this.currentInd = this.model.get("xDatasetName");
    } else {
      this.currentInd = this.model.get("xDatasetName");
    }

    return this.currentInd;
  },

  initColorMap: function(){
    var that = this;
    
    console.log("initColorMap");

    var geoMap = org.polymaps.geoJson()
        .url(org.polymaps.url("world.json").repeat(false))
        .tile(false) 
        .zoom(3)
        .on("load", function(event){

          var i, feature, countryName;
          var allMapData = that.model.get("selDataMap"); 
          var mapData; //temp data to store filtered map data
          var aCountryData;
          that.countryElements = event;
          

          for (i = 0; i < that.countryElements.features.length; i++) {
            
            feature = that.countryElements.features[i];
            countryName = feature.data.properties.name;
            mapData = allMapData.filter(function(element, index, array){
              return element.country == countryName;
            });
            
            // console.log(mapData);
            aCountryData = mapData[0] || null;
            // console.log("ACountryData");
            // console.log(aCountryData);

            if(aCountryData){
          

              var countryColor = that.colorScale(aCountryData[that.currentInd]);
            
              // setAttribute("style", "color: red;");
              
              // feature.element.setAttribute("class", "q" + (aCountryData * 1) + "-" + 9);
              feature.element.setAttribute("class", "country-tile");
              feature.element.setAttribute("id", aCountryData['country']);
              feature.element.setAttribute("fill", "rgba(173,221,10,"+countryColor+")");
              feature.element.setAttribute("title", aCountryData['country']);
              feature.element.addEventListener("click", that.clickFeature , false);
              feature.element.addEventListener("mouseover", that.mouseOverFeature , false);
            }
          }
        }
      );
    this.map.add(geoMap);

  },


  renderColorMap: function(){
    var that = this;
    var i, feature, countryName;

    var allMapData = that.model.get("selDataMap"); 
    var mapData; //temp data to store filtered map data
    var aCountryData;
      

    for (i = 0; i < that.countryElements.features.length; i++) {
      
      feature = that.countryElements.features[i];
      countryName = feature.data.properties.name;

      // Get current country from allMapData 
      mapData = allMapData.filter(function(element, index, array){
        return element.country == countryName;
      });
      
      aCountryData = mapData[0] || null;
     

      // reset country's attributes
      if(aCountryData){
    

        var countryColor = that.colorScale(aCountryData[that.currentInd]);
        
        // setAttribute("style", "color: red;");
        
        // feature.element.setAttribute("class", "q" + (aCountryData * 1) + "-" + 9);
        feature.element.setAttribute("class", "country-tile");
        feature.element.setAttribute("id", aCountryData['country']);
        feature.element.setAttribute("fill", "rgba(173,221,10,"+countryColor+")");
        feature.element.setAttribute("title", aCountryData['country']);
        
      }
    };
    
    
  },

  clickFeature: function(f, evt){
    console.log("clickFeature");

    f.setAttribute("class", "selected");

    var blurb = "<div class='info_blurb'>" + f.getAttribute("title") + " to be passed" + "</div>";

    var infowin = document.getElementById('detail')
    
    infowin.style.width = "200px";
    infowin.style.maxHeight = "200px";
    infowin.style.overflow = "auto";
    infowin.style.left = evt.clientX + "px";
    infowin.style.top = evt.clientY + "px";
    infowin.style.position = 'absolute';
    infowin.style.display = 'block';
        
    infowin.innerHTML = blurb; 

    setCountry(f.getAttribute("title"));
  },

  mouseOverFeature: function(f, evt){

    console.log("mouseOverFeature");
    console.log(f);
    $(f).tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          $('.tipsy').remove();
          var html1 = "<div><span>test POP UP </span><br>" + "<div><ul><li>test1</li><li>test2</li><li>test3</li></ul></div></div>";
          return html1; 
        }
    });  
  },

  setCountry: function(name){
    console.log("setCountry");
  }


});

// 