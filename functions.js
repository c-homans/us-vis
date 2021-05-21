/* eslint-disable no-unused-vars */
var drag, zoom, remove;
var layer1, layer2, layer3;
var interactionTimer;
var fullOutline, simplifiedOutline;
var interstates, skeleton;
var states;
var secondaries;
var doneTime = 1750;
var drawSecondaries = true;
//helper functions. this is pretty spaghetti-esque

export function drawMap(svg, path, usroads, proj, stations) {
    console.log(stations);
    svg.append('rect').attr('height', '100%').attr('width', '100%').attr('fill', 'black');
    d3.json('http://localhost:8000/simplified-outline.json')
        .then(function(d) {simplifiedOutline = d;
            drawOutline(svg, path, simplifiedOutline.features, 'outline');});
    d3.json('http://localhost:8000/skeleton.json')
        .then(function(d) {
            console.log(d);
            skeleton = topojson.feature(d, d.objects.skeleton);
            drawOutline(svg, path, skeleton.features, 'skeleton');});
    d3.json('http://localhost:8000/outline.json')
        .then(function(d) {
            fullOutline = d;});
    d3.json('http://localhost:8000/arterials-test.json').then(function(d) {
        if(drawSecondaries) {
            secondaries = topojson.feature(d, d.objects.arterials);
            drawRoads(svg, path, secondaries); }
    });
    d3.json('http://localhost:8000/simple-interstates.json').then(function(d) {
        interstates = topojson.feature(d, d.objects.interstates);
        d3.selectAll('.skeleton').html('');
        drawRoads(svg, path, interstates);
    });
    d3.json('http://localhost:8000/states.json').then(function(d) {
        interstates = topojson.feature(d, d.objects.states);
        d3.selectAll('.skeleton').html('');
        drawRoads(svg, path, interstates);
    });


    setTimeout(function() {
        d3.selectAll('.outline').html('');
        drawOutline(svg, path, fullOutline.features, 'outline');
    }, 2000);

    drag = d3.drag()
        .on('start', function(ev) {
            svg.selectAll('.outline').html('');
            svg.selectAll('.roads').html('');
            drawOutline(svg, path, simplifiedOutline.features, 'outline');
            drawOutline(svg, path, skeleton.features, 'skeleton');
            clearTimeout(interactionTimer);})
        .on('drag', function(ev) {dragBehavior(svg, path, proj, d3.event);})
        .on('end', function(ev) {
            clearTimeout(interactionTimer);
            interactionTimer = setTimeout(function() {
                svg.selectAll('.outline').html('');
                svg.selectAll('.skeleton').html('');
                drawOutline(svg, path, fullOutline.features, 'outline');
                drawRoads(svg, path, secondaries);
                drawRoads(svg, path, interstates);
            }, doneTime);});


    zoom = d3.zoom()
        .on('start', function(ev) {
            svg.selectAll('.outline').html('');
            svg.selectAll('.roads').html('');
            drawOutline(svg, path, simplifiedOutline.features, 'outline');
            drawOutline(svg, path, skeleton.features, 'skeleton');
            clearTimeout(interactionTimer);})
        .on('zoom', function(ev) {zoomBehavior(svg, path, proj, d3.event);})
        .on('end', function(ev) {
            clearTimeout(interactionTimer);
            interactionTimer = setTimeout(function() {
                svg.selectAll('.outline').html('');
                svg.selectAll('.skeleton').html('');
                drawOutline(svg, path, fullOutline.features, 'outline');
                drawRoads(svg, path, secondaries);
                drawRoads(svg, path, interstates);
            }, doneTime);});
    svg.call(drag);
    svg.call(zoom);
}

function drawOutline(svg, path, outline, cl) {
    var color;
    if(cl == 'outline') {
        color = 'white';}
    else {color = 'grey';}
    svg.append('g')
        .attr('class', cl)
        .selectAll('path')
        .data(outline)
        .enter().append('path')
        .attr('d', path)
        .style('stroke', color)
        .style('fill', 'none')
        .style('stroke-width', 1);
}

export function drawRoads(svg, path, roads) {
    var scaleDomain = [0, 250000];
    var scaleRange = ['green', 'red'];
    var colorScale = d3.scaleLinear()
        .domain([0, 250000])
        .range(['green', 'red'])
        .interpolate(d3.interpolateRgb.gamma(2.2));
    var widthScale = d3.scaleLinear()
        .domain([0, 50000, 250000])
        .range([1, 1, 1]);


    svg.append('g').attr('class', 'roads')
        .selectAll('path')
        .data(roads.features)
        .enter().append('path')
        .attr('d', path)
        .attr('class', 'roads')
        .style('fill', 'none')
        .style('stroke', 'transparent')
        .style('shape-rendering', 'crispEdgeskkic')
        //.style("stroke-width", function(d) {return Math.round(widthScale(d['properties']['AADT']))})
        .style('stroke', function(d) {return colorScale(d['properties']['AADT']);});
}


function drawStations(svg, proj, stations)
{
    svg.select('.roads').append('g').attr('class', 'stations')
        .selectAll('circle')
        .data(stations)
        .enter().append('circle')
        .attr('cx', function(d) {return proj(d['coordinates'])[0];})
        .attr('cy', function(d) {return proj(d['coordinates'])[1];})
        .attr('r', 2)
        .attr('fill', 'transparent')
        .transition()
        .duration(3000)
        .attr('fill', 'blue');
}

function dragBehavior(svg, path, myProjection, ev) {
    var offset = myProjection.translate();
    offset[0] += ev.dx;
    offset[1] += ev.dy;
    myProjection.translate(offset);
    svg.selectAll('path')
        .attr('d', path);
}

function zoomBehavior(svg, path, myProjection, ev) {
    var offset = [ev.transform.x, ev.transform.y];
    var newScale = d3.event.transform.k * 3500;
    myProjection.scale(newScale);

    svg.selectAll('path')
        .transition()
        .ease(d3.easeLinear)
        .attr('d', path);
}
