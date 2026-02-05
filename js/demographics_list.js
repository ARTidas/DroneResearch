// 1. Setup Data Processing Function
function processData(data, column) {
    const counts = d3.rollup(data, v => v.length, d => d[column]);
    return Array.from(counts, ([key, value]) => ({ key, value }));
}

// 2. The Reusable Pie Chart Builder
function drawPieChart(containerId, data, column) {
    
    // Process data
    const chartData = processData(data, column);
    
    // Calculate Total for Percentages
    const total = d3.sum(chartData, d => d.value);
    
    // --- Configuration ---
    const pieRadius = 130; 
    const width = 800; 
    const height = 350;

    // Select container and clean it
    d3.select(containerId).html(""); 

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // --- 1. Draw the Pie (Left Side) ---
    const pieGroup = svg.append("g")
        .attr("transform", `translate(200, ${height / 2})`);

    // Create Color Scale
    const color = d3.scaleOrdinal()
        .domain(chartData.map(d => d.key))
        .range(d3.schemeSet2);

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const data_ready = pie(chartData);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(pieRadius);

    // Arc for positioning labels (slightly larger than pie)
    const labelArc = d3.arc()
        .innerRadius(pieRadius + 15) 
        .outerRadius(pieRadius + 15);

    // Tooltip setup
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Draw Slices
    pieGroup.selectAll('paths')
        .data(data_ready)
        .join('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);
            tooltip.transition().duration(200).style("opacity", .9);
            const percent = ((d.data.value / total) * 100).toFixed(2);
            tooltip.html(`${d.data.key}: <strong>${d.data.value}</strong> (${percent}%)`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", 0.7);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // --- 2. Add Percentage Labels on the Edge ---
    pieGroup.selectAll('allLabels')
        .data(data_ready)
        .join('text')
        .text(d => {
            const percent = (d.data.value / total) * 100;
            // CHECK REMOVED: Now displays percentage for ALL slices
            return percent.toFixed(1) + "%"; 
        })
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .style('text-anchor', 'middle')
        .style('font-size', '11px') // Slightly smaller font to help fit them
        .style('fill', '#333')
        .style('font-weight', 'bold');

    // --- 3. Draw the Legend (Right Side) ---
    const legendX = 360; 
    const legendY = 60; 

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    legendGroup.selectAll("mydots")
        .data(chartData)
        .join("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 25)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => color(d.key));

    legendGroup.selectAll("mylabels")
        .data(chartData)
        .join("text")
            .attr("x", 25)
            .attr("y", (d, i) => i * 25 + 14)
            .style("fill", "#333")
            .text(d => {
                // Calculate percentage for the legend
                const percent = ((d.value / total) * 100).toFixed(2);
                return `${d.key} (${d.value} - ${percent}%)`;
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size", "14px");
}




// 3. The Population Pyramid Builder (With Auto-Grouping)
function drawPopulationPyramid(containerId, data) {
    
    // --- Helper: Calculate Age Group (10-20, 20-30, etc.) ---
    function getAgeBin(ageVal) {
        // specific check: if age is missing or not a number, skip or group as 'Unknown'
        const age = parseInt(ageVal);
        if (isNaN(age)) return null; 

        // Math: 23 / 10 = 2.3 -> floor(2.3) = 2 -> 2 * 10 = 20
        const lower = Math.floor(age / 10) * 10;
        const upper = lower + 10;
        return `${lower}-${upper}`;
    }

    // --- 1. Data Processing ---
    const rolledUp = d3.rollup(data, 
        v => ({
            // Check gender case-insensitively
            male: v.filter(d => d.gender && d.gender.toLowerCase() === 'male').length,
            female: v.filter(d => d.gender && d.gender.toLowerCase() === 'female').length
        }),
        // GROUP BY: Instead of raw age, we run the binning function
        d => getAgeBin(d.age || d.Age) // Handles 'age' or 'Age' keys
    );

    // Convert Map to Array
    let chartData = Array.from(rolledUp, ([ageGroup, counts]) => ({ 
        age: ageGroup, 
        male: counts.male, 
        female: counts.female 
    }));

    // Filter out nulls (bad data)
    chartData = chartData.filter(d => d.age !== null);

    // Sort Ages: numerical sort based on the first number (e.g., "20" in "20-30")
    chartData.sort((a, b) => {
        const numA = parseInt(a.age.split('-')[0]);
        const numB = parseInt(b.age.split('-')[0]);
        return d3.ascending(numA, numB);
    });

    // --- 2. Configuration (Same as before) ---
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const centerLabelWidth = 60; 
    const sideWidth = (width - centerLabelWidth) / 2;

    d3.select(containerId).html("");

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- 3. Scales ---
    const y = d3.scaleBand()
        .domain(chartData.map(d => d.age))
        .range([height, 0])
        .padding(0.1);

    const maxVal = d3.max(chartData, d => Math.max(d.male, d.female));

    const xMale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([sideWidth, 0]);

    const xFemale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([0, sideWidth]);

    // --- 4. Draw Bars ---
    
    // Tooltip reference
    const tooltip = d3.select("body").select(".tooltip").empty() 
        ? d3.select("body").append("div").attr("class", "tooltip") 
        : d3.select(".tooltip");
        
    // Helper functions for Tooltip
    function showTooltip(event, text, age) {
        tooltip.style("opacity", .9);
        tooltip.html(`<strong>Age: ${age}</strong><br>${text}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
    function hideTooltip() {
        tooltip.style("opacity", 0);
    }

    // Male Bars
    const leftGroup = svg.append("g");
    leftGroup.selectAll(".bar-male")
        .data(chartData)
        .join("rect")
        .attr("class", "bar-male")
        .attr("x", d => xMale(d.male))
        .attr("y", d => y(d.age))
        .attr("width", d => sideWidth - xMale(d.male))
        .attr("height", y.bandwidth())
        .attr("fill", "#66c2a5")
        .on("mouseover", (event, d) => showTooltip(event, `Male: ${d.male}`, d.age))
        .on("mouseout", hideTooltip);

    // Female Bars
    const rightGroup = svg.append("g")
        .attr("transform", `translate(${sideWidth + centerLabelWidth}, 0)`);
    rightGroup.selectAll(".bar-female")
        .data(chartData)
        .join("rect")
        .attr("class", "bar-female")
        .attr("x", 0)
        .attr("y", d => y(d.age))
        .attr("width", d => xFemale(d.female))
        .attr("height", y.bandwidth())
        .attr("fill", "#fc8d62")
        .on("mouseover", (event, d) => showTooltip(event, `Female: ${d.female}`, d.age))
        .on("mouseout", hideTooltip);

    // --- 5. Labels & Axes ---
    svg.selectAll(".label-age")
        .data(chartData)
        .join("text")
        .text(d => d.age)
        .attr("x", sideWidth + centerLabelWidth / 2)
        .attr("y", d => y(d.age) + y.bandwidth() / 2)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#333");

    svg.append("text")
        .attr("x", sideWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Male");

    svg.append("text")
        .attr("x", sideWidth + centerLabelWidth + sideWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Female");
}






// 4. Execute
if (typeof dbData !== 'undefined' && dbData.length > 0) {
    // Existing Pie Charts
    drawPieChart("#chart-gender", dbData, "gender");
    addDownloadButton("#chart-gender", "Thesis_Demographics_Gender");

    drawPieChart("#chart-education", dbData, "education");
    addDownloadButton("#chart-education", "Thesis_Demographics_Education");
    
    // NEW: Population Pyramid
    // Ensure your database actually returns "age" and "gender" keys!
    drawPopulationPyramid("#chart-pyramid", dbData);
    addDownloadButton("#chart-pyramid", "Thesis_Demographics_Age_Pyramid");
} else {
    console.error("No data found in dbData variable.");
}





// --- Helper: Add a "Save Image" Button to a chart container ---
function addDownloadButton(containerId, fileName) {
    const container = d3.select(containerId);
    
    // Create a button style that looks nice but unobtrusive
    const button = container.append("button")
        .text("📷 Download Chart")
        .style("margin-top", "10px")
        .style("padding", "5px 10px")
        .style("font-size", "12px")
        .style("cursor", "pointer")
        .style("background-color", "#f0f0f0")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px");

    button.on("click", function() {
        const svgElement = container.select("svg").node();
        
        // 1. Serialize the SVG to a string
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

        // 2. Create a Canvas to draw the image (Scale up 2x for Thesis Quality)
        const canvas = document.createElement("canvas");
        const scale = 2; 
        const width = +svgElement.getAttribute("width");
        const height = +svgElement.getAttribute("height");
        
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");

        // 3. Create an Image object
        const img = new Image();
        
        // This blob trick fixes special characters (like Hungarian accents) in SVGs
        const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
            // Fill background white (SVGs are transparent by default)
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw image scaled up
            ctx.drawImage(img, 0, 0, width * scale, height * scale);
            
            // Trigger Download
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = fileName + ".png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Cleanup
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    });
}