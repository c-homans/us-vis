var jsdom = require("jsdom");
var d3 = require("d3");
var fetch = require("node-fetch")
var topojson = require("topojson")

var {JSDOM} = jsdom;
var {document} = (new JSDOM('<!doctype html><html><body></body></html>')).window;
global.document = document;
global.window = document.defaultView;
var screen = global.window.screen;
var navigator = global.navigator;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};
var svg = d3.select(document.body).append("svg");
var myDat;
//converting the csv to geoJSON too
d3.csv("http://localhost:8000/stations.txt").then(function(data) {
		data.forEach( function(d) {
			d['type'] = "Feature";
			d['lat'] = +d['lat']; d['lon'] = +d['lon']
			d["geometry"] = {
				"type": "Point",
				"coordinates": [d['lat'], d['lon']],
				"pixels": myProjection([d['lon'], d['lat']])
			}
		})


		svg.append("path")
		myDat = data;
	});

var slimData = [];
for(i = 0; i<myDat.length; i++)
	{
		if(i%25 == 0)
			slimData.push(myDat[i]);
	}

var myProjection = d3.geoAlbers().scale(5000)
var path = d3.geoPath().projection(myProjection)
var graticule = d3.geoGraticule()

function drawMap(world) {
	svg.append("path")
	.datum(graticule)
	.attr("class", "graticule")
	.attr("d", path)
	.style("fill", "none");

	svg.append("path")
	.datum(graticule.outline)
	.attr("class", "foreground")
	.attr("d", path)
	.style("stroke", 'blue')
	.style("fill", "none");

	svg.append("g")
    .selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter().append("path")
    .attr("d", path)
		.style("stroke", "grey")
		.style("fill", "none");

	console.log("k")

}

function drawStations(stations) {
	console.log(myDat[0])
	console.log(myDat[0]['geometry']['coordinates'][1]);
	svg.selectAll("circle")
	.data(stations).enter()
		.append("circle")
		.attr("cx", function(d) {
			return Math.round(d['geometry']['pixels'][0]);
		}) //function(d) {return 300})
		.attr("cy", function(d) {
			console.log("uh")
			return Math.round(d['geometry']['pixels'][1]);
		})
		.attr("r", 1)
		.style("stroke", "red");
}

var svg = d3.select("body")
		 .append("svg")
		 .attr("width", 1500)
		 .attr("height", 1000)
		 .call(d3.zoom().on("zoom", function () {
       svg.attr("transform", d3.event.transform)
    }));

d3.json("http://localhost:8000/roads.json").then(function(usroads) {
	svg.append("g")
	.selectAll("path")
		.data(topojson.feature(usroads, usroads.objects.usa).features)
	.enter().append("path")
		.attr("d", path)
		.style("fill","none")
		.style("stroke","#252525")
		.style("stroke-width",1);

		svg.append("g")
	.selectAll("path")
		.data(topojson.feature(usroads, usroads.objects.roads).features)
	.enter().append("path")
		.attr("d", path)
		.style("fill", "none")
		.style("fill","none")
		.style("stroke","grey")
		.style("stroke-width",1);

});

drawStations(slimData)

$$.svg(svg.node().outerHTML);
