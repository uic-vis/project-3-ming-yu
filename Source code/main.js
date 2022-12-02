//Needs cleaning up
//var barChart = d3.selectAll('#plot').append('svg').style('width', '100%').style('height', '100%');
async function loadData() {
    const raw_crashes = await d3.csv('./data/Traffic_Crashes_-_Crashes.csv');
    const raw_crashes_vehicles = await d3.csv('./data/Traffic_Crashes_-_Vehicles.csv');
    //console.log(raw_crashes, raw_crashes_vehicles);
    return {raw_crashes, raw_crashes_vehicles};
}

function get_raw_crashes_array(raw_crashes) {
    const raw_crashes_array = {};
    raw_crashes.map(crash => {
        raw_crashes_array[crash.CRASH_RECORD_ID] = ({
        "CRASH_TYPE": crash.CRASH_TYPE,
        "INJURIES_TOTAL": crash.INJURIES_TOTAL == "" ? "" : parseInt(crash.INJURIES_TOTAL),
        "INJURIES_FATAL": crash.INJURIES_FATAL == "" ? "" : parseInt(crash.INJURIES_FATAL),
        "INJURIES_INCAPACITATING": crash.INJURIES_INCAPACITATING == "" ? "" : parseInt(crash.INJURIES_INCAPACITATING),
        "INJURIES_NON_INCAPACITATING": crash.INJURIES_NON_INCAPACITATING == "" ? "" : parseInt(crash.INJURIES_NON_INCAPACITATING),
        "INJURIES_REPORTED_NOT_EVIDENT": crash.INJURIES_REPORTED_NOT_EVIDENT == "" ? "" : parseInt(crash.INJURIES_REPORTED_NOT_EVIDENT),
        "INJURIES_NO_INDICATION": crash.INJURIES_NO_INDICATION == "" ? "" : parseInt(crash.INJURIES_NO_INDICATION),
        // Can ignore since it only contains 0 or blanks
        //"INJURIES_UNKNOWN": parseInt(crash.INJURIES_UNKNOWN)
        });
    });
    return raw_crashes_array;
}

function get_crases_points(raw_crashes) {
    const crashes_points = [];
    raw_crashes.map(crash => {
        crashes_points.push(L.latLng(crash.LATITUDE, crash.LONGITUDE));
    });
    return crashes_points;
}

function q1_barchart(unit_no, vehicle_types, vehicle_type_unit_no_count) {  
    // set up
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
  
    const size = {height: 400, width: 400};

    const svg = d3.select("#q1_plot")
        .append('svg')
        .attr('width', size.width + margin.left + margin.right)
        .attr('height', size.height + margin.top + margin.bottom);

    const g = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const unit_no_color = d3.scaleOrdinal().domain(unit_no).range(d3.schemeCategory10);

    // populate the drop down selector with vehicle types
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(vehicle_types)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button
  
    // create scales
    const y = d3.scaleLinear().range([size.height, 0]);
  
    const x = d3.scaleBand()
        .domain(unit_no_color.domain())
        .range([0, size.width])
        .padding(0.2);
  
    // create and add axes
    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
  
    const yAxisGroup = g.append("g")
        .attr("transform", `translate(${margin.left}, 0)`);
  
    yAxisGroup.append("text")
        .attr("x", -70)
        .attr("y", size.height / 2)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Count");
  
    const xAxis = d3.axisBottom(x);
  
    const xAxisGroup = g.append("g")
        .call(xAxis)
        // remove baseline from the axis
        .call(g => g.select(".domain").remove())
        .attr("transform", `translate(${margin.left}, ${size.height})`);
    
    xAxisGroup.append("text")
        .attr("x", size.width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("UNIT_NO");

    let barsGroup = g.append("g");

    function update(data) {
    
        const unit_no_count = get_unit_no_count(data, unit_no, vehicle_type_unit_no_count);

        // update y scale
        y.domain([0, d3.max(unit_no_count.values())]).nice();

        // update y axis

        const t = svg.transition()
            .ease(d3.easeLinear)
            .duration(200);

        yAxisGroup
        .transition(t)
        .call(yAxis);
        
        // draw bars
        barsGroup.selectAll("rect")
        .data(unit_no_count, ([no, count]) => no)
        .join("rect")
            .attr("fill", ([no, count]) => unit_no_color (no))
            .attr("width", x.bandwidth())
            .attr("x", ([no, count]) => x(no)+margin.left)
            .attr("y", ([no, count]) => y(count))
            .attr("opacity", 1)
        .transition(t)
            .attr("height", ([no, count]) => size.height-y(count));
  }
  
  return Object.assign(svg.node(), { update });
}

function get_unit_no_count(data, unit_no, vehicle_type_unit_no_count){
    const temp = new Map();
    unit_no.map(no => {
        if(no in vehicle_type_unit_no_count[data]) {
            temp.set(no, vehicle_type_unit_no_count[data][no]);
        } else {
            temp.set(no, 0);
        }
    })
    return temp;
}

function q2_piechart(crash_types, vehicle_type_crash_type_count) {
    //set up
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    
    const size = {height: 400, width: 400};
    
    const radius = Math.min(size.width, size.height) / 2 - margin.top;

    const svg = d3.select("#q2_plot")
        .append('svg')
        .attr('width', size.width + margin.left + margin.right)
        .attr('height', size.height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${size.width/2}, ${size.height/2 + 20})`);
    
    // set the color scale
    const crash_type_color = d3.scaleOrdinal().domain(crash_types).range(d3.schemeCategory10);

    // add legend
    svg.selectAll("rect")
        .data(crash_types)
        .join("rect")
        .attr("x", size.width/3)
        .attr("y", (d, i) => size.height + i * 30)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", (d) => crash_type_color(d))
        
    svg.selectAll("text")
        .data(crash_types)
        .join("text")
        .attr("x", size.width/3 + 30)
        .attr("y", (d, i) => size.height + 10 + i * 30)
        .text((d) => d)
        .style("font-size", "10px")
        .attr("alignment-baseline", "left")

    // A function that create / update the plot for a given variable:
    function update(data) {

        // Compute the position of each group on the pie:
        const pie = d3.pie()
        .value(([type, count]) => count);
        const data_ready = pie(Object.entries(vehicle_type_crash_type_count[data]));

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);
        
        // map to data
        g.selectAll("path")
        .data(data_ready)
        .join("path")
        .transition(1000)
        .attr('d', arc)
        .attr('fill', (d) =>  crash_type_color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1);
        
    }

    return Object.assign(svg.node(), { update });
}

function get_crash_type_count(data, vehicle_type_crash_type_count) {
  return new Map(
    [
      ["NO INJURY / DRIVE AWAY", vehicle_type_crash_type_count[data]["NO INJURY / DRIVE AWAY"]],
      ["INJURY AND / OR TOW DUE TO CRASH", vehicle_type_crash_type_count[data]["INJURY AND / OR TOW DUE TO CRASH"]]
    ]
  )
}

function q1_q2_linked(raw_crashes, raw_crashes_vehicles, raw_crashes_array) {
    const no = new Set(raw_crashes_vehicles.map( vehicle => vehicle.UNIT_NO ));
    const unit_no = Array.from(no).sort((a, b) => a - b);
      
    const temp = new Set(raw_crashes_vehicles.map( vehicle => vehicle.UNIT_TYPE ));
    temp.delete("");
    const vehicle_types = Array.from(temp).sort();
    
    const vehicle_type_unit_no_count = [];
    vehicle_types.forEach(type => {vehicle_type_unit_no_count[type] = []});

    const crash_type = new Set(raw_crashes.map( crash => crash.CRASH_TYPE ));

    const crash_types = Array.from(crash_type).sort();

    const vehicle_type_crash_type_count = [];
    vehicle_types.map(type => {vehicle_type_crash_type_count[type] = ({
        //Can do this because it only contains two values and init to 0 to avoid NaN error
        "NO INJURY / DRIVE AWAY": 0,
        "INJURY AND / OR TOW DUE TO CRASH": 0,
    })});

    raw_crashes_vehicles.map(vehicle => {
        if(vehicle.UNIT_TYPE != "") {
            if(vehicle.UNIT_NO in vehicle_type_unit_no_count[vehicle.UNIT_TYPE]) {
                vehicle_type_unit_no_count[vehicle.UNIT_TYPE][vehicle.UNIT_NO] += 1;
            } else {
                vehicle_type_unit_no_count[vehicle.UNIT_TYPE][vehicle.UNIT_NO] = 1;
            }
            vehicle_type_crash_type_count[vehicle.UNIT_TYPE][raw_crashes_array[vehicle.CRASH_RECORD_ID].CRASH_TYPE] += 1;
        }
    });

    const bar = q1_barchart(unit_no, vehicle_types, vehicle_type_unit_no_count);
    const pie = q2_piechart(crash_types, vehicle_type_crash_type_count);
    
    bar.update(vehicle_types[0]);
    pie.update(vehicle_types[0])
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        pie.update(selectedOption);
        bar.update(selectedOption);
    });
}

function q3_scatterplot(occupant_count_injury_array) {
    const margin = {top: 10, right: 20, bottom: 50, left: 105};
    const size = {height: 400, width: 400};
    
    const initialValue = occupant_count_injury_array;
    
    const svg = d3.select("#q3_plot")
        .append('svg')
        .attr('width', size.width + margin.left + margin.right)
        .attr('height', size.height + margin.top + margin.bottom)
        .property('value', initialValue);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xAxis = (g, scale, label) =>
    g.attr('transform', `translate(0, ${size.height})`)
        // add axis
        .call(d3.axisBottom(scale))
        // remove baseline
        .call(g => g.select('.domain').remove())
        // add grid lines
        // references https://observablehq.com/@d3/connected-scatterplot
        .call(g => g.selectAll('.tick line')
            .clone()
            .attr('stroke', '#d3d3d3')
            .attr('y1', -size.height)
            .attr('y2', 0))
        // add label
        .append('text')
        .attr('x', size.width / 2)
        .attr('y', 40)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .text(label)

    const yAxis = (g, scale, label) => 
    // add axis
    g.call(d3.axisLeft(scale))
        // remove baseline
        .call(g => g.select('.domain').remove())
        // add grid lines
        // references https://observablehq.com/@d3/connected-scatterplot
        .call(g => g.selectAll('.tick line')
            .clone()
            .attr('stroke', '#d3d3d3')
            .attr('x1', 0)
            .attr('x2', size.width))
        // add label
        .append('text')
        .attr('x', -40)
        .attr('y', size.height / 2)
        .attr('fill', 'black')
        .attr('dominant-baseline', 'middle')
        .text(label)

    const x = d3.scaleLinear()
            .domain(d3.extent(occupant_count_injury_array, d => d.OCCUPANT_CNT)).nice()
            .range([0, size.width]);

    const y = d3.scaleLinear()
            .domain(d3.extent(occupant_count_injury_array, d => d.INJURIES_TOTAL)).nice()
            .range([size.height, 0]);

    const radius = d3.scaleLinear()
            .domain(d3.extent(occupant_count_injury_array, d => d.ID_LIST.length)).nice()
            .range([3, 7]);
    
    g.append("g").call(xAxis, x, 'Total Occupant');
    g.append("g").call(yAxis, y, 'Total Injuries');

    const dots = g.selectAll('circle')
        .data(occupant_count_injury_array)
        .join('circle')
        .attr('cx', d => x(d.OCCUPANT_CNT))
        .attr('cy', d => y(d.INJURIES_TOTAL))
        .attr('fill', d =>  "red")
        .attr('opacity', 1)
        .attr('r', d => radius(d.ID_LIST.length));

    const brush = d3.brush()
        .extent([[0, 0], [size.width, size.height]])
        .on('brush', onBrush)
        .on('end', onEnd);

    g.append('g')
        .call(brush);

    function onBrush(event) {
        // event.selection gives us the coordinates of the
        // top left and bottom right of the brush box
        const [[x1, y1], [x2, y2]] = event.selection;
        
        // return true if the dot is in the brush box, false otherwise
        function isBrushed(d) {
        const cx = x(d.OCCUPANT_CNT);
        const cy = y(d.INJURIES_TOTAL)
        return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
        } 
        
        // style the dots
        dots.attr('fill', d => isBrushed(d) ? "red" : 'gray');
        
        // update the data that appears in the cars variable
        svg.property('value', occupant_count_injury_array.filter(isBrushed)).dispatch('input');
    }

    function onEnd(event) {
        if (event.selection === null) {
        // reset the color of all of the dots
        dots.attr('fill', d => "red");
        svg.property('value', initialValue).dispatch('input');
        }
    }
    
    return svg.node();
}

function q4_barchart(injury_type_array, raw_crashes_array) {
    // set up
    
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    
    const size = {height: 500, width: 500};
  
    const svg = d3.select("#q4_plot")
        .append('svg')
        .attr('width', size.width + margin.left + margin.right)
        .attr('height', size.height + margin.top + margin.bottom);
  
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    const injury_type_color = d3.scaleOrdinal().domain(injury_type_array).range(d3.schemeCategory10);
    
    // create scales
    const y = d3.scaleLinear()
        .range([size.height, 0]);
    
    const x = d3.scaleBand()
        .domain(injury_type_color.domain())
        .range([0, size.width])
        .padding(0.2);
    
    // create and add axes
    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
    
    const yAxisGroup = g.append("g")
        .attr("transform", `translate(${margin.left}, 0)`);
    
    yAxisGroup.append("text")
        .attr("x", -70)
        .attr("y", size.height / 2)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Count");
    
    const xAxis = d3.axisBottom(x);
    
    const xAxisGroup = g.append("g")
        .call(xAxis)
        // remove baseline from the axis
        .call(g => g.select(".domain").remove())
        .attr("transform", `translate(${margin.left}, ${size.height})`);

    xAxisGroup.append("text")
        .attr("x", size.width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Injury Reported");
      
    let barsGroup = g.append("g");
  
    function update(data) {
      
      // get the number of cars for each origin
      const injury_type_count = get_injuries_type_count(data, raw_crashes_array);
  
      // update x scale
      y.domain([0, d3.max(injury_type_count.values())]).nice();
  
      // update x axis
  
      const t = svg.transition()
          .ease(d3.easeLinear)
          .duration(200);
  
      yAxisGroup
        .transition(t)
        .call(yAxis);
      
      // draw bars
      barsGroup.selectAll("rect")
        .data(injury_type_count, ([type, count]) => type)
        .join("rect")
          .attr("fill", ([type, count]) => injury_type_color(type))
          .attr("width", x.bandwidth())
          .attr("x", ([type, count]) => x(type)+margin.left)
          .attr("y", ([type, count]) => y(count))
          .attr("opacity", 1)
        .transition(t)
          .attr("height", ([type, count]) => size.height-y(count));
    }
    
    return Object.assign(svg.node(), { update });
}

function get_injuries_type_count(data, raw_crashes_array) {
    const temp = new Map([
        ["FATAL", 0],
        ["INCAPACITATING", 0],
        ["NON-INCAPACITATING", 0],
        ["NOT EVIDENT", 0],
        ["NO INDICATION", 0],
    ]);

    data.map(d => {
        d.ID_LIST.map(id => {
        if(raw_crashes_array[id].INJURIES_TOTAL != 0 ) {
            if(raw_crashes_array[id].INJURIES_FATAL != "") {
                temp.set("FATAL", temp.get("FATAL") + raw_crashes_array[id].INJURIES_FATAL);
            }
            if(raw_crashes_array[id].INJURIES_INCAPACITATING != "") {
                temp.set("INCAPACITATING", temp.get("INCAPACITATING") + raw_crashes_array[id].INJURIES_INCAPACITATING);
            }
            if(raw_crashes_array[id].INJURIES_NON_INCAPACITATING != "") {
                temp.set("NON-INCAPACITATING", temp.get("NON-INCAPACITATING") + raw_crashes_array[id].INJURIES_NON_INCAPACITATING);
            }
            if(raw_crashes_array[id].INJURIES_REPORTED_NOT_EVIDENT != "") {
                temp.set("NOT EVIDENT", temp.get("NOT EVIDENT") + raw_crashes_array[id].INJURIES_REPORTED_NOT_EVIDENT);
            }
            if(raw_crashes_array[id].INJURIES_NO_INDICATION != "") {
                temp.set("NO INDICATION", temp.get("NO INDICATION") + raw_crashes_array[id].INJURIES_NO_INDICATION);
            }
        }
        })
    });

    return temp;
}

function q3_q4_linked(raw_crashes, raw_crashes_vehicles, raw_crashes_array) {
    const all_crash = {};
    raw_crashes.map(crash => {
        if(crash.INJURIES_TOTAL != "") {
            all_crash[crash.CRASH_RECORD_ID] = ({
                "CRASH_RECORD_ID": crash.CRASH_RECORD_ID,
                "INJURIES_TOTAL": parseInt(crash.INJURIES_TOTAL),
                "OCCUPANT_CNT": 0
            });
        }
    });
    raw_crashes_vehicles.map(vehicle => {
        if(vehicle.OCCUPANT_CNT != "" && vehicle.CRASH_RECORD_ID in all_crash){
            all_crash[vehicle.CRASH_RECORD_ID].OCCUPANT_CNT += parseInt(vehicle.OCCUPANT_CNT);
        }
    });
    const occupant_count_injury_array = [];
    for(var key in all_crash) {
        const index = occupant_count_injury_array.findIndex(x => (x.INJURIES_TOTAL === all_crash[key].INJURIES_TOTAL && x.OCCUPANT_CNT === all_crash[key].OCCUPANT_CNT));
        if(index != -1) {
            occupant_count_injury_array[index].ID_LIST.push(all_crash[key].CRASH_RECORD_ID);
        } else {
            occupant_count_injury_array.push({"INJURIES_TOTAL": all_crash[key].INJURIES_TOTAL, "OCCUPANT_CNT": all_crash[key].OCCUPANT_CNT, "ID_LIST":[all_crash[key].CRASH_RECORD_ID]});
        }
    }
    occupant_count_injury_array.sort((a, b) => a.INJURIES_TOTAL - b.INJURIES_TOTAL || a.OCCUPANT_CNT - b.OCCUPANT_CNT);

    const injury_type_array = [
        "FATAL",
        "INCAPACITATING",
        "NON-INCAPACITATING",
        "NOT EVIDENT",
        "NO INDICATION",
    ]

    const q3_scatter = q3_scatterplot(occupant_count_injury_array);
    const q4_bar = q4_barchart(injury_type_array, raw_crashes_array);

    // update the bar chart when the scatterplot
    // selection changes
    d3.select(q3_scatter).on('input', () => {
        q4_bar.update(q3_scatter.value);
    });

    // intial state of bar chart
    q4_bar.update(q3_scatter.value);
}

function q5_barchart(month_array, month_count, day_array, date_Array) {
    // set up
    
    const q6_bar = q6_barchart(day_array, date_Array);
    q6_bar.update(month_array[0]);

    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    
    const size = {height: 500, width: 500};
  
    const svg = d3.select("#q5_plot")
        .append('svg')
        .attr('width', size.width + margin.left + margin.right)
        .attr('height', size.height + margin.top + margin.bottom);
  
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    const month_color = d3.scaleOrdinal().domain(month_array).range(d3.schemeCategory10);
    
    // create scales
    const y = d3.scaleLinear()
        .domain([0, d3.max(month_count.values())])
        .nice()
        .range([size.height, 0]);
    
    const x = d3.scaleBand()
        .domain(month_color.domain())
        .range([0, size.width])
        .padding(0.2);
    
    // create and add axes
    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
    
    const yAxisGroup = g.append("g")
        .attr("transform", `translate(${margin.left}, 0)`);
    
    yAxisGroup.append("text")
        .attr("x", -70)
        .attr("y", size.height / 2)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Count");

    yAxisGroup.call(yAxis);
    
    const xAxis = d3.axisBottom(x);
    
    const xAxisGroup = g.append("g")
        .call(xAxis)
        // remove baseline from the axis
        .call(g => g.select(".domain").remove())
        .attr("transform", `translate(${margin.left}, ${size.height})`);
    
    xAxisGroup.append("text")
        .attr("x", size.width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Month");
      
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
    
    // draw bars
    const barsGroup = g.selectAll("rect")
        .data(month_count, ([month, count]) => month)
        .join("rect")
            .attr("fill", ([month, count]) => month_color(month))
            .attr("opacity", ([month, count]) => {return month === month_array[0] ? 1 : 0.5})
            .attr('selected', ([month, count]) =>{return month === month_array[0]})
            .attr("width", x.bandwidth())
            .attr("height", ([month, count]) => size.height-y(count))
            .attr("x", ([month, count]) => x(month)+margin.left)
            .attr("y", ([month, count]) => y(count))
            .attr("plot", "q5")
        .on('mouseover', function (d, i) {
            d3.select(this)
                .transition()
                .duration('50')
                .attr('opacity', 1);
            tooltip.transition()
                .duration(50)
                .style("opacity", 1);
            tooltip.html(`Total: ${i[1]}`)
                .style("left", ()=>{return (d.pageX + 10) + "px"})
                .style("top", (d.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .transition()
                .duration('50')
                .attr('opacity', this.getAttribute('selected') === 'true' ? 1 : 0.5);
            tooltip.transition()
                .duration(50)
                .style("opacity", 0);
        })
        .on('click', function (d, i) {
            d3.selectAll('rect')
            .filter(function() {
                return d3.select(this).attr("plot") == "q5";
            })
                .transition()
                .duration('50')
                .attr("selected", false)
                .attr("opacity", 0.55);
            d3.select(this)
                .transition()
                .duration('50')
                .attr('selected', true);
            q6_bar.update(i[0], date_Array);
        });

    return Object.assign(svg.node());
}

function q6_barchart(day_array, date_Array) {
    // set up

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    
    const size = {height: 500, width: 500};
  
    const svg = d3.select("#q6_plot")
        .append('svg')
        .attr('width', size.width + margin.left + margin.right)
        .attr('height', size.height + margin.top + margin.bottom);
  
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    const day_color = d3.scaleOrdinal().domain(day_array).range(d3.schemeCategory10);

    g.append("text")
        .attr("x", ((size.width + margin.left + margin.right) / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("label", "title")
        
    
    // create scales
    const y = d3.scaleLinear()
        .range([size.height, 0]);
    
    const x = d3.scaleBand()
        .domain(day_color.domain())
        .range([0, size.width])
        .padding(0.2);
    
    // create and add axes
    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
    
    const yAxisGroup = g.append("g")
        .attr("transform", `translate(${margin.left}, 0)`);
    
    yAxisGroup.append("text")
        .attr("x", -70)
        .attr("y", size.height / 2)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Count");
    
    const xAxis = d3.axisBottom(x);
    
    const xAxisGroup = g.append("g")
        .call(xAxis)
        // remove baseline from the axis
        .call(g => g.select(".domain").remove())
        .attr("transform", `translate(${margin.left}, ${size.height})`);

    xAxisGroup.append("text")
        .attr("x", size.width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Day");
      
    let barsGroup = g.append("g");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
  
    function update(month) {
      
      // get the number of cars for each origin
      const day_count = get_day_count(month, date_Array);
  
      // update x scale
      y.domain([0, d3.max(day_count.values())]).nice();
  
      // update x axis
  
      const t = svg.transition()
          .ease(d3.easeLinear)
          .duration(200);
  
      yAxisGroup
        .transition(t)
        .call(yAxis);
      
      // draw bars
      barsGroup.selectAll("rect")
        .data(day_count, ([type, count]) => type)
        .join("rect")
          .attr("fill", ([type, count]) => day_color(type))
          .attr("width", x.bandwidth())
          .attr("x", ([type, count]) => x(type)+margin.left)
          .attr("y", ([type, count]) => y(count))
          .attr("opacity", 1)
        .on('mouseover', function (d, i) {
            const temp = new Date(`${i[0]} ${month} 2022`);
            d3.select(this)
                .transition()
                .duration('50')
                .attr('opacity', 0.75);
            tooltip.transition()
                .duration(50)
                .style("opacity", 1);
            tooltip.html(`${days[temp.getDay()]}, Total: ${i[1]}`)
                .style("left", ()=>{return (d.pageX + 10) + "px"})
                .style("top", (d.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .transition()
                .duration('50')
                .attr('opacity', 1);
            tooltip.transition()
                .duration(50)
                .style("opacity", 0);
        })
        .transition(t)
            .attr("height", ([type, count]) => size.height-y(count));

        svg.selectAll("text")
            .filter(function() {
                return d3.select(this).attr("label") == "title";
            })
            .text(month);
    }
    
    return Object.assign(svg.node(), { update });
}

function get_day_count(month, date_Array) {
    const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    const month_num_days = new Map([
        ["January", 31],
        ["February", 28],
        ["March", 31],
        ["April", 30],
        ["May", 31],
        ["June", 30],
        ["July", 31],
        ["August", 31],
        ["September", 30],
        ["October", 31],
        ["November", 30],
        ["December", 31],
    ]);

    const day_array = Array.from({length: month_num_days.get(month)}, (_, i) => i + 1);
    const day_count = new Map();
    day_array.map(day => {
        day_count.set(day, 0);
    });

    date_Array.map(date => {
        if(months[date.getMonth()] == month) {
            day_count[day_count.set(date.getDate(), day_count.get(date.getDate())+1)];
        }
    });

    return day_count;
}

function q5_q6_linked(raw_crashes_vehicles) {
    const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    const date_Array = [];
    raw_crashes_vehicles.map(crash => {
        date_Array.push(new Date(crash.CRASH_DATE));
    });

    const month_array = [];

    const month_count = new Map();

    // We use 31 here because it is the maximum amount in a month
    // It is only used to create a color scheme for each day will be changed later on when the visualization changes
    const day_array = Array.from({length: 31}, (_, i) => i + 1);

    date_Array.map(date => {
        if(!month_array.includes(months[date.getMonth()])) {
            month_array.push(months[date.getMonth()]);
        }
        if(month_count.has(months[date.getMonth()])) {
            month_count[month_count.set(months[date.getMonth()], month_count.get(months[date.getMonth()])+1)];
        } else {
            month_count[month_count.set(months[date.getMonth()], 1)];
        }
    });

    const q5_bar = q5_barchart(month_array, month_count, day_array, date_Array);
}

function createMap(crashes_points) {

    var map = L.map('map').setView([41.9, -87.7], 11);

    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'black',
            dashArray: '3',
            fillOpacity: 0
        };
    }

    var geojson = L.geoJson(neighborhoods, {style: style}).addTo(map);

    var heat = L.heatLayer(crashes_points, {radius: 15, blur: 15} ).addTo(map);

}

async function generate_visualizations() {
    let {raw_crashes, raw_crashes_vehicles} = await loadData();
    const raw_crashes_array = get_raw_crashes_array(raw_crashes);
    q1_q2_linked(raw_crashes, raw_crashes_vehicles, raw_crashes_array);
    q3_q4_linked(raw_crashes, raw_crashes_vehicles, raw_crashes_array);
    q5_q6_linked(raw_crashes_vehicles);
    const crashes_points = get_crases_points(raw_crashes)
    createMap(crashes_points);
}

async function init(){
    generate_visualizations();
}

window.onload = init;