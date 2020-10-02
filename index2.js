// Ref: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91

const chartAreaHeight = 500
const chartAreaWidth = 900

const margin = {top: 20, right: 50, bottom: 70, left: 100}
const width = chartAreaWidth - margin.left - margin.right;
const height = chartAreaHeight - margin.top - margin.bottom;
const tooltip = { width: 100, height: 100, x: 10, y: -30 };

// Tooltip :  https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
// let tooltip = d3.select("body").append("div").attr("class", "toolTip");

// Creating svg (canvas)
const svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

// Creating groups
const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Extracting data from CSV - async IIFE
( async ()=>{
    try{
        const data = await d3.csv("emissions.csv")
        const emissionsByCountry = d3.group(data, d => d["Country"])
        const afgData = emissionsByCountry.get("Afghanistan");
        drawBarChart(afgData);
    }
    catch (e){
        console.error("Error : ", e)
    }
})()

// Rendering the bar chart
function drawBarChart(data) {

    const parseYear = d3.timeParse("%Y");
    const bisectDate = d3.bisector(function(d) { return d.Year; }).left;
    const formatValue = d3.format(",");
    // const dateFormatter = d3.time.format("%y");

    data.forEach(function(d) {
        d.Year = parseYear(d.Year);
        d["Emissions.Type.CO2"] = +d["Emissions.Type.CO2"];
    });

    data.sort(function(a, b) {
        return a.Year - b.Year;
    });

    var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.temperature);
        });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = d3.tsv.parse(myData);

    color.domain(d3.keys(data[0]).filter(function(key) {
        return key !== "date";
    }));

    data.forEach(function(d) {
        d.date = parseDate(d.date);
    });

    var cities = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {
                    date: d.date,
                    temperature: +d[name]
                };
            })
        };
    });

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));

    y.domain([
        d3.min(cities, function(c) {
            return d3.min(c.values, function(v) {
                return v.temperature;
            });
        }),
        d3.max(cities, function(c) {
            return d3.max(c.values, function(v) {
                return v.temperature;
            });
        })
    ]);

    var legend = svg.selectAll('g')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr('x', width - 20)
        .attr('y', function(d, i) {
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {
            return color(d.name);
        });

    legend.append('text')
        .attr('x', width - 8)
        .attr('y', function(d, i) {
            return (i * 20) + 9;
        })
        .text(function(d) {
            return d.name;
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");

    var city = svg.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            return color(d.name);
        });

    city.append("text")
        .datum(function(d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name;
        });

    var mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(cities)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            var mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {
                    console.log(width/mouse[0])
                    var xDate = x.invert(mouse[0]),
                        bisect = d3.bisector(function(d) { return d.date; }).right;
                    idx = bisect(d.values, xDate);

                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    while (true){
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0])      end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    d3.select(this).select('text')
                        .text(y.invert(pos.y).toFixed(2));

                    return "translate(" + mouse[0] + "," + pos.y +")";
                });
        });
    // Adding chart label
    g.append("text")
        .attr("class", "chart-label")
        .attr("x",  3 * width / 8)
        .attr("y", -30)
        .text("Total Flights Delays (2003-2016)")
}
