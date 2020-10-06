// set the dimensions and margins of the graph
const margin = {top: 40, right: 20, bottom: 30, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom + 100)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

( async ()=>{
    try{
        // set the ranges
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const countries = ["Afghanistan","Albania","Angola","Armenia"];
        const colourRange = ['#e41a1c','#377eb8','#4daf4a','#984ea3'];

        let data = await d3.csv("emissions.csv")
        data = data.filter(function(d, i){ return countries.includes(d["Country"])});

        // parse the date / time
        const parseTime = d3.timeParse("%Y");
        
        data.forEach(function(d) {
            d.Year = parseTime(d.Year);
            d["Emissions.Type.CO2"] = +d["Emissions.Type.CO2"];
        });

        // group the data
        const emissionsByCountry = d3.group(data, d => d["Country"])
        console.log("emissionsByCountry :",emissionsByCountry);

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d["Year"]; }));
        y.domain([0, d3.max(data, function(d) { return d["Emissions.Type.CO2"] })]);

        //Heading
        svg.append("text")
            .attr("x", width/2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Line chart for CO2 Emission for multiple countries");

        //x-axis labels
        svg.append("text")
            .attr("x", (width / 2)  )
            .attr("y", height + margin.top )
            .style("text-anchor", "middle")
            .text("Years");

        //y-axis labels
        svg.append("text")
            .attr("x", -(height/2) )
            .attr("y", margin.left - 130)
            .attr("transform","rotate(-90)")
            .style("text-anchor", "middle")
            .text("Total CO2 Emission");

        //colour labels
        svg.append("text")
            .attr("x", width + 60 )
            .attr("y", 0)
            .style("text-anchor", "middle")
            .text("Countries:");

        // Handmade legend
        for(let i = 0;i<countries.length;i++){
            svg.append("circle").attr("cx",width + 20).attr("cy",20 + (25*i)).attr("r", 6).style("fill", colourRange[i]);
            svg.append("text").attr("x",  width + 40).attr("y", 20 + (25*i)).text(countries[i]).style("font-size", "15px").attr("alignment-baseline","middle");
        }


        const color = d3.scaleOrdinal()
            .domain(emissionsByCountry.keys())
            .range(colourRange);


        // Draw the line
        svg.selectAll(".line")
            .data(emissionsByCountry)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return x(d["Year"]); })
                    .y(function(d) { return y(+d["Emissions.Type.CO2"]); })
                    (d[1])
            })

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
    }
    catch (e){
        console.error("Error : ", e)
    }
})();