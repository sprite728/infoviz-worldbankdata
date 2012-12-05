infoviz-worldbankdata
=====================

This is a group project for the Information Visualization course in U Mich, which we are aiming to visualize some of the data from The World Bank

How to 
=====================
1. Go to the repository (infoviz-worldbankdata)
2. $python -m SimpleHTTPServer 3000
3. localhost:3000/index.html

Reference
=========
http://jonathanotto.com/blog/backbone_js_for_the_everyman.html
	- listen to a model change
		- some_model.set({name: 'new some thing'})
		- this.model.on("change", function(){ this.render(); })

To do
=====
1. Still don't know how to leave trace on the map
2. 

System Architecture
===================
WBD (parent object)
* Members & Methods
	- indicators
		- an array stores all the indiciators
	- defaultXIndicator
	- defaultYIndicator

Entries
* Members & Methods
	- allData
	- selDataXYPlot
	- filter
		- year
		- region: []
		- country: []
	- xAxisDatasetName
	- yAxisDatasetName
	- contentDisplayed = "region" or "country"

	- initialize()
	- render()
	- renderAxes()

	- applyFilter()
		- everytime when someone change the filter, call render()
		- when the dataset is changed, re-render axes renderAxes()
	- setRegionFilter()
	- setCountryFilter()


	- setXAxisDatasetName()
	- setYAxisDatasetName()
	- getXAxisDatasetName()
	- getYAxisDatasetName()

XYPlotView
* Add time selector
* Add model listener, whenever someone change the model(myEntries), View would respond to that change
* Process nations.json to get region & population data

MapView
* select which API to use 
	- Polymaps, http://polymaps.org/
	- Colorbrewer, http://colorbrewer2.org/
	- highcharts, http://www.highcharts.com/

* Members & Methods
	- initialize()
	- render()

	Filter related 
	- toggleSelectedCountry() 
	- toggleSelectedRegion()


* Render non-interactive data first
	- initialize()
	- render()

DisplayOptionView
* use jQuery & Backbone.js
	- selectXAxisDataset()
		- change the model myEntries.xAxisDatasetName = ...
		- change the model myEntries.yAxisDatasetName = ...
			- (Once the axes dataset change, XYPlotView and MapView would change)
			- NOTE: in XYPlotView & MapView, we cannot hard-coded axes data, should always get from myEntries model

	- selectYAxisDataset()
	- setDisplayByContinent()
	- setDisplayByCountry()

IndValueFilterView
* use jQuery & Backbone.js
	- defaultTab
	- currentTab

	- switchTab()
		- use jQuery to switch to another div?
	- render()
		- render all the tabs, and select the default tab
	- setFilterByIndValues(String indicator, Array range)
		- modify the 

RegionFilterView
* Methods 
	- initialize()
	- render()
	- select()
	- search(input) or inViewfilter()
	- toggleFilterbyRegion()
		- add or remove a region in the filter object
		- re-render all the views ( XYPlotView, MapView, RegionFilterView )
		- NOTE: DisplayOptionView and FilterByIndicatorView wont change 
	- Questions:
		- when select a region, is it collapsable so more countries would be shown under the region name?








