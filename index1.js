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

    let focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 130)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    focus.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Emission:");

    focus.append("text")
        .attr("class", "tooltip-emission")
        .attr("x", 90)
        .attr("y", 18);

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove(event,k) {
        const x0 = x.invert(d3.pointer(event)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        let yearVal = x(d.Year)+ 110
        let emissionVal = y(d["Emissions.Type.CO2"]) + 80
        focus.attr("transform", "translate(" + yearVal + "," + emissionVal + ")");
        focus.select(".tooltip-date").text("Year : " +dateFormatter(d.Year));
        focus.select(".tooltip-emission").text(formatValue(d["Emissions.Type.CO2"]));
    }

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
}
