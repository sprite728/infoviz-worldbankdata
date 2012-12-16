//var isNewHere = true;
var w = 400;

var po = org.polymaps;


console.log("enter");


// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#map").append("svg:svg").node())
    .center({lat: 51, lon: 0})
    .zoomRange([2,4])
    .zoom(2)
    .add(po.interact())
    .add(po.drag())
    .add(po.wheel().smooth(false))
    .add(po.dblclick())
    .add(po.arrow());

// Add the CloudMade image tiles as a base layer
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/27de2d670c794844882b7e7fdf5ebbef" 
    + "/20760/256/{Z}/{X}/{Y}.png")
    .repeat(false)
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.geoJson()
    .url(po.url("world.json").repeat(false))
    .tile(false) 
    .zoom(3)
    .on("load", loadMap));

// Add the custom stations layer…
//map.add(stations("stations.json"));
//map.add(world("world_fake.json"));
//map.add(world("stations.json"));

// Add the compass control on top.
map.add(po.compass()
    .pan("none"));

// Custom layer implementation.

map.container().setAttribute("class", "Blues");

function loadMap(e) {
  //alert("map color layer");
  //temp = e;
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    var n = feature.data.properties.name;
    var v = Math.floor(Math.random()*11);
    if(v>8){
      v= 4;
    }
    feature.element.setAttribute("class", "q" + ~~(v * 1) + "-" + 9);
    feature.element.setAttribute("title", n);
    feature.element.addEventListener("click", function(e){clickFeature(this,e);}, false);
    feature.element.addEventListener("mouseover", function(e){mouseOverFeature(this,e);}, false);
  }
}

function clickFeature(f, evt){
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
}

/*
      $('svg map').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          $('.tipsy').remove();
          var html1 = "<div><span>test POP UP </span><br><br>" + "<div><ul><li>test1</li><li>test2</li><li>test3</li></ul></div></div>";
          return html1; 
        }
      });
*/

function mouseOverFeature(f, evt){
  
    $(f).tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          $('.tipsy').remove();
          var html1 = "<div><span>test POP UP </span><br>" + "<div><ul><li>test1</li><li>test2</li><li>test3</li></ul></div></div>";
          return html1; 
        }
    });
  
  //alert(f);
  /*
  var html1 = "<div><span>test POP UP </span><br><br>" + "<div><ul><li>test1</li><li>test2</li><li>test3</li></ul></div></div>";
  $(f).html(html1);
  //$(f).hide();
  */
}




/*
function world(url) {

  // Create the tiler, for organizing our points into tile boundaries.
  var tiler = d3.geo.tiler()
      .zoom(4)
      .location(function(d) {return d.value; });

  // Create the base layer object, using our tile factory.
  var layer = po.layer(load);

  // Load the station data. When the data comes back, reload.
  d3.json(url, function(json) {
    tiler.points(d3.entries(json));
    layer.reload();
  });

  // Custom tile implementation.
  function load(tile, projection) {
    projection = projection(tile).locationPoint;

    // Add an svg:g for each station.
    var g = d3.select(tile.element = po.svg("g")).selectAll("circle")
        .data(tiler.tile(tile.column, tile.row, tile.zoom))
        .enter().append("svg:g")

      var w = 400;

    // Add a circle.
    g.append("svg:circle")
        .style("fill", d3.hsl(Math.random() * 360, 1, .5))
        .attr("transform", transform)
        .attr("r", 12)        
        .on("click", function(d) { 
            $(".circleSelected").attr("class","circleUnselected");

            d3.select(this).attr('r', 13)
                .attr("class", "circleSelected")
                //.style("fill","lightcoral")
                //.style("stroke","red");
        });

      $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          $('.tipsy').remove();
          var html1 = "<div><span>test POP UP </span><br><br>" + "<div><ul><li>test1</li><li>test2</li><li>test3</li></ul></div></div>";
          return html1; 
        }
      });

    function transform(d) {
      d = projection({lon: d.value[0], lat: d.value[1]});
      return "translate(" + d.x + "," + d.y + ")";
    }
  }

  return layer;
}
*/

