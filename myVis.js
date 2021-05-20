import { drawMap } from "./functions.js";
var myDat;

var myProjection = d3.geoAlbers().scale(3500)
var path = d3.geoPath().projection(myProjection)

var w = window
var w = 1920
var h = 1080

d3.csv("http://localhost:8000/stations.txt").then(function(data) {
		data.forEach( function(d) {
			d['type'] = "Feature";
			d['lat'] = +d['lat']; d['lon'] = +d['lon']
			d["geometry"] = {
				"type": "Point",
				"coordinates": [d['lon'], d['lat']],
				"pixels": myProjection([d['lon'], d['lat']])}
			d['coordinates'] = d['geometry']['coordinates']
		})
		myDat = data;
		console.log(myDat)
		myDat = myDat.filter(function(value, index, arr) {
		    return index%150 == 0;
		});
	});

var svg = d3.select("body").append("svg").attr("viewBox", "none")
   .attr("width", w)
   .attr("height", h) //the svg has HAPPENED. BOOM.


d3.json("http://localhost:8000/simplified-roads.json").then(function(usroads) {
    var bigHighways = JSON.parse(JSON.stringify(usroads))
    //bigHighways.objects.roads.geometries = bigHighways.objects.roads.geometries.filter(function(d) {return d.properties.type === "Major Highway" | d.properties.type === "Secondary Highway"} )
    //var bigHighways = usroads.objects.roads.geometries.filter( function(d) {return d.properties.type === "Major Highway"} )
    drawMap(svg, path, bigHighways, myProjection, myDat);
});

var offset = myProjection.translate()
