// Author: Chuan-Che Huang, chuanche@umich.edu
var WBD = WBD || {};

// Map
WBD.Map = Backbone.View.extend({
  className: 'map',
  id: 'map',
  tagName: 'div',

  countryElements: [],
  showXValuesOnMap: true,
  showCountryData: true,


  initialize: function(opts){
    console.log("map_initialize");

    $('#main').append(this.el);
    this.model = opts.model;

    // Listen to changes on model
    //this.model.bind("change:selDataMap", this.renderColorMap, this);
    this.model.bind("change:selDataMap", this.chooseRender, this);
    // this.model.get("filter").bind("change:countries", this.renderColorMap, this);

    // Create the map object, append it to this.el
    this.map = org.polymaps.map()
    .container(d3.select(this.el).append("svg:svg").node())
    .center({lat: 51, lon: 0})
    .zoomRange([2,4])
    .zoom(2)
    //.add(org.polymaps.interact())
    .add(org.polymaps.drag())
    .add(org.polymaps.wheel().smooth(false))
    .add(org.polymaps.dblclick());
    //.add(org.polymaps.arrow());

    // Init tab 
    this.showXValuesOnMap = true;

    // Init country or continent
    this.showCountryData = true;


    // Custom layer implementation.  || TO BE CHANGED
    this.map.container().setAttribute("class", "Blues");    

    // set current indicator according to the current tabs
    this.updateCurrentInd();

    // Initialize color scale
    this.initColorScale();

    this.initBottomMap();
    this.initColorMap();
    //this.initTopMap(); //d3, circles over the map
    //this.updateColorMap();

    // Add the compass control on top.
    this.map.add(org.polymaps.compass()
        .pan("none"));    
  },

  chooseRender: function(){
    console.log("chooseRender");
    var that = this;
    //this.showCountryData = this.model.get("isViewedByCountry");
    this.showCountryData = true;
    console.log(this.model.get("isViewedByCountry"));
    
    if(this.showCountryData){
      that.renderColorMap();
    }
    else{
      that.renderContinentMap();
    }
  },

  initColorScale: function(){
    var that = this;

    if(this.showXValuesOnMap){
      that.colorScale = d3.scale.log()
        .domain(this.model.get("filter").get("xDataRange"))
        .range([0,1]);
    }
    else {
      that.colorScale = d3.scale.log()
        .domain(this.model.get("filter").get("yDataRange"))
        .range([0, 1]);
    }
  },

  initBottomMap: function(){
    console.log("initBottomMap");
    //console.log(this);

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
      this.currentInd = this.model.get("yDatasetName");
    }
    return this.currentInd;
  },

  initColorMap: function(){
    var that = this;
    
    console.log("initColorMap");



    function mouseOverFeature(f, evt){
      //console.log("mouseOverFeature");
      // console.log(f);
      //console.log(this);
      // console.log(this.id);
      var countryName = this.id;      
      that.model.get("filter").setHoveredCountry(countryName);   
      $(this).tipsy({ 
          gravity: 's', 
          html: true, 
          title: function() {
            $('.tipsy').remove();
            console.log("tipsy");
            console.log(f.screenX);
            console.log(f.screenY);

            var allMapData = that.model.get("selDataMap"); 
            var mapData; //temp data to store filtered map data
            var aCountryData;
            mapData = allMapData.filter(function(element, index, array){
              return element.country == countryName;
            });
            
            // To filt out missing data
            aCountryData = mapData[0] || null;

            // console.log(aCountryData);
            // console.log(aCountryData["population"]);
            var continent = aCountryData["population"];
            var population = aCountryData["continent"];
            var html1 = "<div><span>" + this.id + "</span><br>" + "<ul><li>" + that.currentInd + ": " + aCountryData[that.currentInd] + "</li><li>Population: " + population + "</li><li>Continent: " + continent + "</ul></div>";
            return html1; 
          }
      });
    };


    // triggered when a country is clicked
    function clickFeature(f, evt){
      console.log("clickFeature");

     
      var countryName = this.id;
      
      var isNew = that.model.get("filter").isNewCountry(countryName);
      
      if(isNew){
        that.model.get("filter").addCountry(countryName);
      } else {
        that.model.get("filter").removeCountry(countryName);
        // $(this).attr("class", "");
      }

      // var blurb = "<div class='info_blurb'>" + this.id + " to be passed" + "</div>";
  
      // that.model.get("filter").addCountry(this.id);
      //setCountry(this.id);
    };

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
            
            // To filt out missing data
            aCountryData = mapData[0] || null;

            // Render the countries with data
            if(aCountryData){        
              var isNew = that.model.get("filter").isNewCountry(aCountryData.country);

              
                var countryColor = that.colorScale(aCountryData[that.currentInd]);
                feature.element.setAttribute("class", "country-tile");
                feature.element.setAttribute("id", aCountryData['country']);
                
              if(aCountryData[that.currentInd] != undefined)
              {   
                feature.element.setAttribute("fill", "rgba(30,47,114,"+countryColor+")");
              }
              else{
                feature.element.setAttribute("fill", "rgb(180,180,180)");  //set as white because of missing indicator data
              }

                feature.element.setAttribute("style", "stroke:white ");
                feature.element.setAttribute("title", aCountryData['country']);
                feature.element.addEventListener("click", clickFeature , false);
                feature.element.addEventListener("mouseover", mouseOverFeature , false);
            }
            // Set the color of missing data as white
            else{
              //console.log("Missing: " + countryName);
              feature.element.setAttribute("fill", "#fff");  //set as white because of missing indicator data          
            }
          }

        });

      this.map.add(geoMap);

/*
      console.log("append legend");
      var color = d3.scale.category10();
            //Create the legend
      console.log("color: " + color);      

      var legend = d3.select(this.el = org.polymaps.svg("g")).selectAll(".legend")
            .data(color.domain())
          .enter().append("svg:g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      console.log("legend: " + legend);

        legend.append("rect")
            .attr("x", 100 - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", "red");

        legend.append("text")
            .attr("x", 100 - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

    },
*/

  
  /*
  mouseOverFeature: function(f, evt){
    // console.log("mouseOverFeature");
    // console.log(f);
     console.log(this);
    // console.log(this.id);
    
    
    $(this).tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          $('.tipsy').remove();
          console.log("tipsy");
          console.log(f.screenX);
          console.log(f.screenY);
          var html1 = "<div><span>" + this.id + "</span><br>"  + "</div>";
          return html1; 
        }
    });
  */
  },
  

  renderColorMap: function(){

    console.log("==============renderColorMap================");
    console.log(this);

    var that = this;
    var i, feature, countryName;

    var allMapData = that.model.get("selDataMap"); 
    var mapData; //temp data to store filtered map data
    var aCountryData;

    if(this.model.get("filter").get("countries").length == 0){
      console.log("No countries selected, render all");
        for (i = 0; i < that.countryElements.features.length; i++) {             
          feature = that.countryElements.features[i];
          countryName = feature.data.properties.name;

          // Get current country from allMapData 
          mapData = allMapData.filter(function(element, index, array){
            return element.country == countryName;
          });
  
          aCountryData = mapData[0] || null;
          
          if(aCountryData){
            var countryColor = that.colorScale(aCountryData[that.currentInd]);
            if(aCountryData[that.currentInd] != undefined)
            {   
              feature.element.setAttribute("fill", "rgba(30,47,114,"+countryColor+")");
            }
            else{
              feature.element.setAttribute("fill", "rgb(180,180,180)");  //set as white because of missing indicator data
            }
          }
          // Set as white for non-matched map name
          else{
            feature.element.setAttribute("fill", "#fff");           
          }
        }
    }

    else{ 
        for (i = 0; i < that.countryElements.features.length; i++) {            
          feature = that.countryElements.features[i];
          countryName = feature.data.properties.name;

          // Get current country from allMapData 
          mapData = allMapData.filter(function(element, index, array){
            return element.country == countryName;
          });
          
          aCountryData = mapData[0] || null;
          
          // Render the selected countries
          if(aCountryData){ 
              var countryColor = that.colorScale(aCountryData[that.currentInd]);
              if(aCountryData[that.currentInd] != undefined)
              {   
                feature.element.setAttribute("fill", "rgba(30,47,114,"+countryColor+")");
              }
              else{
                feature.element.setAttribute("fill", "rgb(120,120,120)");  //set as white because of missing indicator data
              }                  
          } 
          // Reder the unselected countries
          else
          {
            if(feature.element.getAttribute("fill") != "#fff"){
              feature.element.setAttribute("fill", "rgb(200,200,200)"); 
            }
          }
        }
      }
  },

  renderContinentMap: function(){

    console.log("==============renderContinentMap================");
    console.log(this);
   var that = this;
    var i, feature, countryName;

    var allMapData = that.model.get("selDataMap"); 
    var mapData; //temp data to store filtered map data
    var aCountryData;
    
    if(this.model.get("filter").get("countries").length == 0){
      console.log("No countries selected, render all");
        for (i = 0; i < that.countryElements.features.length; i++) {             
          feature = that.countryElements.features[i];
          countryName = feature.data.properties.name;

          // Get current country from allMapData 
          mapData = allMapData.filter(function(element, index, array){
            return element.country == countryName;
          });
  
          aCountryData = mapData[0] || null;
          
          if(aCountryData){
            var countryColor = that.colorScale(aCountryData[that.currentInd]);
            if(aCountryData[that.currentInd] != undefined)
            {   
              feature.element.setAttribute("fill", "rgba(30,47,114,"+countryColor+")");
            }
            else{
              feature.element.setAttribute("fill", "#fff");  //set as white because of missing indicator data
            }
          }
          // Set as white for non-matched map name
          else{
            feature.element.setAttribute("fill", "#fff");           
          }
        }
    }

    else{ 
        for (i = 0; i < that.countryElements.features.length; i++) {            
          feature = that.countryElements.features[i];
          countryName = feature.data.properties.name;

          // Get current country from allMapData 
          mapData = allMapData.filter(function(element, index, array){
            return element.country == countryName;
          });
          
          aCountryData = mapData[0] || null;
          
          // Render the selected countries
          if(aCountryData){ 
              var countryColor = that.colorScale(aCountryData[that.currentInd]);
              if(aCountryData[that.currentInd] != undefined)
              {   
                feature.element.setAttribute("fill", "rgba(30,47,114,"+countryColor+")");
              }
              else{
                feature.element.setAttribute("fill", "#fff");  //set as white because of missing indicator data
              }                  
          } 
          // Reder the unselected countries
          else
          {
            console.log("unselected country white or not");
            console.log(feature.element.getAttribute("fill"));
            if(feature.element.getAttribute("fill") != "#fff"){
              feature.element.setAttribute("fill", "rgb(200,200,200)"); 
            }
          }
        }
      }
  }


});

// 