// Author: Chuan-Che Huang, chuanche@umich.edu
var WBD = WBD || {};

// Map
WBD.Map = Backbone.View.extend({
  className: 'map',
  id: 'map',
  tagName: 'div',

  initialize: function(opts){
    $('#main').append(this.el);
    this.model = opts.model;

    // Listen to changes on model
    this.model.bind("change:selDataXYPlot", this.render, this );

  },

  render: function(){

  }

});

