// Ref: https://bl.ocks.org/Qizly/8f6ba236b79d9bb03a80

const chartAreaHeight = 720
const chartAreaWidth = 1100

const margin = {top: 50, right: 50, bottom: 70, left: 100}
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

    const x = d3.scaleTime()
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([2 * height/ 3 , 0]);

    const xAxis = d3.axisBottom()
        .scale(x)
        // .tickFormat(dateFormatter);

    const yAxis = d3.axisLeft()
        .scale(y)
        // .tickFormat(d3.format("s"))

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

    focus.append("circle")
        .attr("r", 5);

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 100)
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
        .text("Likes:");

    focus.append("text")
        .attr("class", "tooltip-likes")
        .attr("x", 60)
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
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.likes) + ")");
        // focus.select(".tooltip-date").text(dateFormatter(d.Year));
        focus.select('line.x')
                .attr('x1', 0)
                .attr('x2', -x(d.date))
                .attr('y1', 0)
                .attr('y2', 0);

            focus.select('line.y')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', 0)
                .attr('y2', height - y(d.close));
        focus.select(".tooltip-likes").text(formatValue(d["Emissions.Type.CO2"]));
    }
    // function mousemove() {
    //     const x0 = x.invert(d3.pointer(event)[0]);
    //     const i = bisectDate(data, x0, 1);
    //     const d0 = data[i - 1];
    //     const d1 = data[i];
    //     const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    //     focus.attr('transform', `translate(${x(d.date)}, ${y(d.close)})`);
    //     focus.select('line.x')
    //         .attr('x1', 0)
    //         .attr('x2', -x(d.date))
    //         .attr('y1', 0)
    //         .attr('y2', 0);
    //
    //     focus.select('line.y')
    //         .attr('x1', 0)
    //         .attr('x2', 0)
    //         .attr('y1', 0)
    //         .attr('y2', height - y(d.close));
    //
    //     focus.select('text').text(formatCurrency(d.close));
    // }

    // Adding chart label
    g.append("text")
        .attr("class", "chart-label")
        .attr("x",  3 * width / 8)
        .attr("y", -30)
        .text("Total Flights Delays (2003-2016)")
}
