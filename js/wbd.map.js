// Author: Chuan-Che Huang, chuanche@umich.edu
var WBD = WBD || {};

// Map
WBD.Map = Backbone.View.extend({
  className: 'map',
  id: 'map',
  tagName: 'div',
  countryElements: [],

  initialize: function(opts){
    console.log("map_initialize");

    $('#main').append(this.el);
    this.model = opts.model;

    // Listen to changes on model
    this.model.bind("change:selDataXYPlot", this.updateColorMap, this );

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

    // Add the compass control on top.
    this.map.add(org.polymaps.compass()
        .pan("none"));

    // Custom layer implementation.  || TO BE CHANGED
    this.map.container().setAttribute("class", "Blues");    



    this.initBottomMap();
    this.initColorMap();
    //this.initTopMap(); //d3, circles over the map
    // this.updateColorMap();
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

  initColorMap: function(){
    var that = this;
    
    console.log("initColorMap");

    var geoMap = org.polymaps.geoJson()
        .url(org.polymaps.url("world.json").repeat(false))
        .tile(false) 
        .zoom(3)
        .on("load", function(event){

          var i, feature, countryName;
          var mapData = that.model.get("selDataXYPlot"); 
          var aCountryData;
          that.countryElements = event;
          

          for (i = 0; i < that.countryElements.features.length; i++) {
            
            feature = that.countryElements.features[i];
            countryName = feature.data.properties.name;

            console.log("country name");
            console.log(countryName);

            mapData = mapData.filter(function(element, index, array){
              return element.country == countryName;
            });
            
            aCountryData = mapData[0] || null;
            console.log("ACountryData");
            console.log(aCountryData);

            if(aCountryData){
              console.log("ACountryData");
              console.log(aCountryData);
              // feature.element.setAttribute("class", "q" + ~~(v * 1) + "-" + 9);
              // feature.element.setAttribute("title", countryName);
            }
          }
        }
      );

    console.log("TEST GeoMap");
    console.log(geoMap);

    this.map.add(geoMap);

  },


  renderColorMap: function(event, hi){
    var i, feature, countryName;
    var mapData;

    console.log("loadMap")
    this.countryElements = event;
    // console.log(this.countryElements);
    // console.log(e);
    console.log(hi);
    // var that = this;
    console.log("that");
    console.log(that);

    var mapData = this.model.get("selDataXYPlot"); 

    console.log("country elements");
    console.log(this.countryElements);

    for (i = 0; i < this.countryElements.features.length; i++) {
      
      feature = this.countryElements.features[i];
      countryName = feature.data.properties.name;

      mapData.filter(function(element, index, array){
        console.log("in filter");
        console.log(countryName);
        return element.country == countryName;
      });

      console.log("mapData");
      console.log(mapData);

      var v = Math.floor(Math.random()*11);  

      feature.element.setAttribute("class", "q" + ~~(v * 1) + "-" + 9);
      feature.element.setAttribute("title", countryName);
    }
    
  },

  clickFeature: function(f, evt){
    console.log("clickFeature");

      var v = Math.floor(Math.random()*11);
      if(v>8){
          v= 4;
      }
      $(".Blues .selected").attr("class", "q" + ~~(v * 1) + "-" + 9);
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
  },

  updateColorMap: function(){

    var that = this;
    var mapData = this.model.get("selDataXYPlot"); 
    console.log("country elements");
    console.log(this.countryElements);

        for (var i = 0; i < this.countryElements.features.length; i++) {
          var feature = this.countryElements.features[i];
          var countryName = feature.data.properties.name;

          mapData.filter(function(d){
            return d.country == countryName;
          });

          console.log("mapData");
          console.log(mapData);

          var v = Math.floor(Math.random()*11);
          



          feature.element.setAttribute("class", "q" + ~~(v * 1) + "-" + 9);
          feature.element.setAttribute("title", n);
          // feature.element.addEventListener("click", function(e){clickFeature(this,this.countryElements);}, false);
          // feature.element.addEventListener("mouseover", function(e){mouseOverFeature(this,this.countryElements);}, false);
        }

  }

});

// 