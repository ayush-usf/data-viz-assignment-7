// Ref: https://bl.ocks.org/Qizly/8f6ba236b79d9bb03a80

const chartAreaHeight = 720
const chartAreaWidth = 1100

const margin = {top: 100, right: 50, bottom: 70, left: 150}
const width = chartAreaWidth - margin.left - margin.right;
const height = chartAreaHeight - margin.top - margin.bottom;
const tooltip = { width: 300, height: 200, x: 10, y: -30 };

// Tooltip :  https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
// let tooltip = d3.select("body").append("div").attr("class", "toolTip");

// Creating svg (canvas)
const svg = d3.select("#chart-area").append("svg")
    .attr("width", chartAreaWidth + 200)
    .attr("height", chartAreaHeight);

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
    const dateFormatter = d3.timeFormat("%Y");

    data.forEach(function(d) {
        d.Year = parseYear(d.Year);
        d["Emissions.Type.CO2"] = +d["Emissions.Type.CO2"];
    });

    data.sort(function(a, b) {
        return a.Year - b.Year;
    });

    const x = d3.scaleTime()
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([2 * height/ 3 , 0]);

    const xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(dateFormatter);

    const yAxis = d3.axisLeft()
        .scale(y)

    const line = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d["Emissions.Type.CO2"]); });

    x.domain([data[0].Year, data[data.length - 1].Year]);
    y.domain(d3.extent(data, function(d) { return d["Emissions.Type.CO2"]; }));

    const minVal = d3.min(data, d => { return d["Emissions.Type.CO2"]; })
    const maxVal = d3.max(data, d => { return d["Emissions.Type.CO2"]; })

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 2 *height/3 + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("CO2 Emissions");

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    // Adding chart label
    g.append("text")
        .attr("class", "chart-label")
        .attr("x",  width / 4)
        .attr("y", -30)
        .text("CO2 Emissions Per Year in Afghanistan (1970-2012)")

    // Y label
    g.append("text")
        .attr("class", "y axis-label")
        .attr("x", - ( height / 3))
        .attr("y", -80)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("CO2 Emissions")

    // X axis label
    // Ref: text label for the x axis (https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e)
    g.append("text")
        .attr("class", "x axis-label")
        .attr("x",  width / 3 + 50)
        .attr("y", height - 100)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .text("Year")

    // Add the area
    g.append("path")
        .datum(data)
        .attr("fill", "#cce5df")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("d", d3.area()
            .x(function(d) { return x(d.Year) })
            .y0(y(minVal))
            .y1(function(d) { return y(d["Emissions.Type.CO2"]) })
        )

    function drawFocus() {

        // Create focus object
        let focus = svg.append('g')
            .attr('class', 'focus')

        // Add an x-line to show where hovering
        // focus.append('line')
        //     .classed('x', true);

        // Add a y-line to show where hovering
        focus.append('line')
            .classed('y', true);


        // append circle on the line path
        focus.append('circle')
            .attr('r', 7.5)

        // add background rectangle behind the text tooltip
        focus.append('rect')
            .attr('x', -30)
            .attr('y', '-2em')
            .attr('width', 70)
            .attr('height', 20)
            .style("fill", "white");

        // add text annotation for tooltip
        focus.append('text')
            .attr('x', -30)
            .attr('dy', '-1em')
            .style("fill", "black")
            .style("font-family", "SuisseIntl");

        focus.append('div')
            .attr('x', 10)
            .attr('dy', '.35em')
            .attr("class", "tooltip")
            .style("opacity", 1)

        // create an overlay rectangle to draw the above objects on top of
        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height);

        // make the overlay rectangle transparent,
        // so it only serves the purpose of detecting mouse events
        d3.select('.overlay')
            .style('fill', 'none')
            .style('pointer-events', 'all');

        // select focus objects and set opacity
        d3.selectAll('.focus')
            .style('opacity', 0.9);

        // select the circle and style it
        d3.selectAll('.focus circle')
            .style("fill", '#068ca0')
            .style("opacity", 0)

        // select the hover lines and style them
        d3.selectAll('.focus line')
            .style("fill", "none")
            .style("stroke", "black")
            .style("opacity", 0.4)
            .style("stroke-width", '1px');


    }

    drawFocus();
}
