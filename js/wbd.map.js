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
    .add(org.polymaps.interact())
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
        .range([0, 1]);
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
      console.log("mouseOverFeature");
      // console.log(f);
      console.log(this);
      // console.log(this.id);
      var countryName = this.id;      
      
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
    };


    // triggered when a country is clicked
    function clickFeature(f, evt){
      console.log("clickFeature");

     
      var countryName = this.id;
      
      var isNew = that.model.get("filter").isNewCountry(countryName);
      
      if(isNew){
				//$("#countries_tags").tagit("createTag", countryName);
        that.model.get("filter").addCountry(countryName);
      } else {
				//$("#countries_tags").tagit("removeTagByLabel", countryName);
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

              // Country is not in the countries filter
            
              var countryColor = that.colorScale(aCountryData[that.currentInd]);
              feature.element.setAttribute("class", "country-tile");
              feature.element.setAttribute("id", aCountryData['country']);
              feature.element.setAttribute("fill", "rgba(103,184,222,"+countryColor+")");
              feature.element.setAttribute("style", "stroke:white ");
              feature.element.setAttribute("title", aCountryData['country']);
              feature.element.addEventListener("click", clickFeature , false);
              feature.element.addEventListener("mouseover", that.mouseOverFeature , false);
            }
            // Set the color of missing data as white
            else{
              feature.element.setAttribute("fill", "#fff");           
            }
          }

        }
      );

      this.map.add(geoMap);
    },


  
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
  },
  */

  renderColorMap: function(){

    console.log("==============renderColorMap================");
    console.log(this);

    var that = this;
    var i, feature, countryName;

    var allMapData = that.model.get("selDataMap"); 
    var mapData; //temp data to store filtered map data
    var aCountryData;

        if(this.model.get("filter").get("countries").length == 0){
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
                feature.element.setAttribute("fill", "rgba(103,184,222,"+countryColor+")");  
              }
            // Set the color of missing data as white
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
              

              // if there is no selected countries, show all the data of the countries


              // otherwise, check whether the country is selected, only render the selected part
              if(aCountryData){ 
                  console.log(aCountryData.country);                
                // If the country is not in the filter, then highlight;
                  console.log("selected country highlighted: " + aCountryData.country);
                  var countryColor = that.colorScale(aCountryData[that.currentInd]);
                  feature.element.setAttribute("fill", "rgba(103,184,222,"+countryColor+")"); 

                /*
                var isNotInFilter = that.model.get("filter").isNewCountry(aCountryData.country);
                console.log("isNotInFilter");
                console.log(isNotInFilter);
                  
                if(isNotInFilter){
                  console.log("unselected color change: " + aCountryData.country);
                  var countryColor = that.colorScale(aCountryData[that.currentInd]);
                  feature.element.setAttribute("fill", "rgba(173,221,10,"+countryColor+")");       
                } 
                else{
                  console.log("selected country highlighted: " + aCountryData.country);
                  var countryColor = that.colorScale(aCountryData[that.currentInd]);
                  feature.element.setAttribute("fill", "rgba(173,221,10,"+countryColor+")"); 
                }
                */

              } else
              {
                  console.log("unselected");
                  feature.element.setAttribute("fill", "rgb(200,200,200)"); 
              }
            }
          }
    //};
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
                feature.element.setAttribute("fill", "rgba(103,184,222,"+countryColor+")");  
              }
            // Set the color of missing data as white
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
              

              // if there is no selected countries, show all the data of the countries


              // otherwise, check whether the country is selected, only render the selected part
              if(aCountryData){ 
                  console.log(aCountryData.country);                
                // If the country is not in the filter, then highlight;
                  console.log("selected country highlighted: " + aCountryData.country);
                  var countryColor = that.colorScale(aCountryData[that.currentInd]);
                  feature.element.setAttribute("fill", "rgba(103,184,222,"+countryColor+")"); 

                /*
                var isNotInFilter = that.model.get("filter").isNewCountry(aCountryData.country);
                console.log("isNotInFilter");
                console.log(isNotInFilter);
                  
                if(isNotInFilter){
                  console.log("unselected color change: " + aCountryData.country);
                  var countryColor = that.colorScale(aCountryData[that.currentInd]);
                  feature.element.setAttribute("fill", "rgba(173,221,10,"+countryColor+")");       
                } 
                else{
                  console.log("selected country highlighted: " + aCountryData.country);
                  var countryColor = that.colorScale(aCountryData[that.currentInd]);
                  feature.element.setAttribute("fill", "rgba(173,221,10,"+countryColor+")"); 
                }
                */

              } else
              {
                  console.log("unselected");
                  feature.element.setAttribute("fill", "rgb(200,200,200)"); 
              }
            }
          }
  }


});

// 