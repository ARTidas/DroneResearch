// ==========================================================
// THESIS SWOT VISUALIZATION
// ==========================================================
const CONFIG = {
    // 1. Dimensions
    width: 650,   // Slightly wider to fit labels
    height: 600,
    margin: { top: 50, right: 100, bottom: 50, left: 110 }, // Big margins to prevent cutting off text
    
    // 2. Visual Style
    colorDot: "#d95f02",       // Orange/Red for result
    colorFill: "rgba(54, 162, 235, 0.2)", // Diamond fill
    colorLine: "rgb(54, 162, 235)",       // Diamond stroke
    colorGrid: "#e0e0e0",      // Light gray grid
    colorAxis: "#333",         // Black axis lines
    
    // 3. Typography
    fontLabel: "14px Arial", // S, W, O, T main labels
    fontTick: "12px Arial",       // Axis numbers (1, 2, 3...)
    fontValue: "16px Arial"  // The red result numbers
};


// ----------------------------------------------------------
// CHART 1: SWOT Coordinate Matrix (The Net Position)
// ----------------------------------------------------------
function drawSWOTMatrix(containerId, data) {
    
    // --- Data Processing ---
    let totalS = 0, totalW = 0, totalO = 0, totalT = 0, count = 0;
    data.forEach(d => {
        const s = (Number(d.S1)+Number(d.S2)+Number(d.S3)+Number(d.S4)) / 4;
        const w = (Number(d.W1)+Number(d.W2)+Number(d.W3)+Number(d.W4)) / 4;
        const o = (Number(d.O1)+Number(d.O2)+Number(d.O3)+Number(d.O4)) / 4;
        const t = (Number(d.T1)+Number(d.T2)+Number(d.T3)+Number(d.T4)) / 4;
        if (!isNaN(s)) { totalS += s; totalW += w; totalO += o; totalT += t; count++; }
    });
    const xVal = (totalS/count) - (totalW/count);
    const yVal = (totalO/count) - (totalT/count);

    // --- Setup Canvas ---
    const width = CONFIG.width - CONFIG.margin.left - CONFIG.margin.right;
    const height = CONFIG.height - CONFIG.margin.top - CONFIG.margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;

    d3.select(containerId).html("");
    const svg = d3.select(containerId).append("svg")
        .attr("width", CONFIG.width).attr("height", CONFIG.height)
        .append("g").attr("transform", `translate(${CONFIG.margin.left},${CONFIG.margin.top})`);

    // --- Scales ---
    const limit = 2.5; // Scale from -2.5 to +2.5
    const x = d3.scaleLinear().domain([-limit, limit]).range([0, width]);
    const y = d3.scaleLinear().domain([limit, -limit]).range([0, height]); // Inverted for Y

    // --- Background Quadrants ---
    svg.append("rect").attr("x", centerX).attr("y", 0).attr("width", centerX).attr("height", centerY).attr("fill", "#e6f5c9").attr("opacity", 0.3); // Q1
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", centerX).attr("height", centerY).attr("fill", "#fff2ae").attr("opacity", 0.3);       // Q2
    svg.append("rect").attr("x", 0).attr("y", centerY).attr("width", centerX).attr("height", centerY).attr("fill", "#f4cae4").attr("opacity", 0.3); // Q3
    svg.append("rect").attr("x", centerX).attr("y", centerY).attr("width", centerX).attr("height", centerY).attr("fill", "#cbd5e8").attr("opacity", 0.3); // Q4

    // --- Axes & Ticks ---
    // X Axis (Bottom)
    svg.append("g")
        .attr("transform", `translate(0, ${centerY})`) // Move to middle
        .call(d3.axisBottom(x).ticks(5).tickSize(-5))
        .call(g => g.select(".domain").attr("stroke", CONFIG.colorAxis).attr("stroke-width", 1)) // Thicker line
        .call(g => g.selectAll("text").style("font", CONFIG.fontTick).attr("dy", "15px")); // Push numbers down

    // Y Axis (Left)
    svg.append("g")
        .attr("transform", `translate(${centerX}, 0)`) // Move to middle
        .call(d3.axisLeft(y).ticks(5).tickSize(-5))
        .call(g => g.select(".domain").attr("stroke", CONFIG.colorAxis).attr("stroke-width", 1))
        .call(g => g.selectAll("text").style("font", CONFIG.fontTick).attr("dx", "-10px")); // Push numbers left

    // --- Axis Labels (S-W-O-T) ---
    // We place these at the very ends of the chart area
    svg.append("text").attr("x", centerX).attr("y", -10).text("OPPORTUNITIES").attr("text-anchor", "middle").style("font", CONFIG.fontLabel);
    svg.append("text").attr("x", centerX).attr("y", height + 20).text("THREATS").attr("text-anchor", "middle").style("font", CONFIG.fontLabel);
    svg.append("text").attr("x", width + 10).attr("y", centerY + 5).text("STRENGTHS").attr("text-anchor", "start").style("font", CONFIG.fontLabel);
    svg.append("text").attr("x", -10).attr("y", centerY + 5).text("WEAKNESSES").attr("text-anchor", "end").style("font", CONFIG.fontLabel);

    
    // --- The Result Dot ---
    const dotGroup = svg.append("g").attr("transform", `translate(${x(xVal)}, ${y(yVal)})`);
    dotGroup.append("circle").attr("r", 8).attr("fill", CONFIG.colorDot).attr("stroke", "white").attr("stroke-width", 2);

    const label = dotGroup.append("text")
        .attr("x", 15).attr("y", 5)
        .text(`(${xVal.toFixed(2)}, ${yVal.toFixed(2)})`)
        .style("font", CONFIG.fontValue).style("fill", CONFIG.colorDot);
    label.clone(true).lower().attr("stroke", "white").attr("stroke-width", 4);
}

// ----------------------------------------------------------
// CHART 2: SWOT Component Breakdown (Diamond Radar)
// ----------------------------------------------------------
function drawSWOTBreakdown(containerId, data) {
    
    // --- Data Processing ---
    let totalS = 0, totalW = 0, totalO = 0, totalT = 0, count = 0;
    data.forEach(d => {
        const s = (Number(d.S1)+Number(d.S2)+Number(d.S3)+Number(d.S4)) / 4;
        const w = (Number(d.W1)+Number(d.W2)+Number(d.W3)+Number(d.W4)) / 4;
        const o = (Number(d.O1)+Number(d.O2)+Number(d.O3)+Number(d.O4)) / 4;
        const t = (Number(d.T1)+Number(d.T2)+Number(d.T3)+Number(d.T4)) / 4;
        if (!isNaN(s)) { totalS += s; totalW += w; totalO += o; totalT += t; count++; }
    });
    const avgS = totalS / count;
    const avgW = totalW / count;
    const avgO = totalO / count;
    const avgT = totalT / count;

    // --- Setup Canvas ---
    const width = CONFIG.width - CONFIG.margin.left - CONFIG.margin.right;
    const height = CONFIG.height - CONFIG.margin.top - CONFIG.margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;

    d3.select(containerId).html("");
    const svg = d3.select(containerId).append("svg")
        .attr("width", CONFIG.width).attr("height", CONFIG.height)
        .append("g").attr("transform", `translate(${CONFIG.margin.left},${CONFIG.margin.top})`);

    const chartGroup = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    // --- Scale ---
    // Radius scale matching the chart size
    const maxRadius = Math.min(width, height) / 2;
    const rScale = d3.scaleLinear().domain([0, 5]).range([0, maxRadius]);

    // --- Background Quadrants ---
    svg.append("rect").attr("x", centerX).attr("y", 0).attr("width", centerX).attr("height", centerY).attr("fill", "#e6f5c9").attr("opacity", 0.3); // Q1
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", centerX).attr("height", centerY).attr("fill", "#fff2ae").attr("opacity", 0.3);       // Q2
    svg.append("rect").attr("x", 0).attr("y", centerY).attr("width", centerX).attr("height", centerY).attr("fill", "#f4cae4").attr("opacity", 0.3); // Q3
    svg.append("rect").attr("x", centerX).attr("y", centerY).attr("width", centerX).attr("height", centerY).attr("fill", "#cbd5e8").attr("opacity", 0.3); // Q4


    // --- Scales ---
    const limit = 5; // Scale from -2.5 to +2.5
    const x = d3.scaleLinear().domain([-limit, limit]).range([0, width]);
    const y = d3.scaleLinear().domain([limit, -limit]).range([0, height]); // Inverted for Y
    // --- Axes & Ticks ---
    // X Axis (Bottom)
    svg.append("g")
        .attr("transform", `translate(0, ${centerY})`) // Move to middle
        .call(d3.axisBottom(x).ticks(5).tickSize(-5))
        .call(g => g.select(".domain").attr("stroke", CONFIG.colorAxis).attr("stroke-width", 1)) // Thicker line
        .call(g => g.selectAll("text").style("font", CONFIG.fontTick).attr("dy", "15px")); // Push numbers down

    // Y Axis (Left)
    svg.append("g")
        .attr("transform", `translate(${centerX}, 0)`) // Move to middle
        .call(d3.axisLeft(y).ticks(5).tickSize(-5))
        .call(g => g.select(".domain").attr("stroke", CONFIG.colorAxis).attr("stroke-width", 1))
        .call(g => g.selectAll("text").style("font", CONFIG.fontTick).attr("dx", "-10px")); // Push numbers left


    // --- Axis Labels (S-W-O-T) ---
    // We place these at the very ends of the chart area
    svg.append("text").attr("x", centerX).attr("y", -10).text("OPPORTUNITIES").attr("text-anchor", "middle").style("font", CONFIG.fontLabel);
    svg.append("text").attr("x", centerX).attr("y", height + 20).text("THREATS").attr("text-anchor", "middle").style("font", CONFIG.fontLabel);
    svg.append("text").attr("x", width + 10).attr("y", centerY + 5).text("STRENGTHS").attr("text-anchor", "start").style("font", CONFIG.fontLabel);
    svg.append("text").attr("x", -10).attr("y", centerY + 5).text("WEAKNESSES").attr("text-anchor", "end").style("font", CONFIG.fontLabel);

    // --- Diamond Shape ---
    // Top=O, Right=S, Bottom=T, Left=W
    const points = [
        { x: rScale(avgS),  y: 0 },             // S (Right)
        { x: 0,             y: -rScale(avgO) }, // O (Top, negative Y)
        { x: -rScale(avgW), y: 0 },             // W (Left)
        { x: 0,             y: rScale(avgT) }   // T (Bottom)
    ];

    const line = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveLinearClosed);

    chartGroup.append("path")
        .datum(points)
        .attr("d", line)
        .attr("fill", CONFIG.colorFill)
        .attr("stroke", CONFIG.colorLine).attr("stroke-width", 2);

    // --- Dots & Values ---
    const values = [avgS, avgO, avgW, avgT]; // Match point order (S, O, W, T)
    
    points.forEach((p, i) => {
        chartGroup.append("circle").attr("cx", p.x).attr("cy", p.y).attr("r", 6).attr("fill", CONFIG.colorDot).attr("stroke", "white");

        // Dynamic Offset logic to keep text readable
        let xOff = 0, yOff = 0, anchor = "middle";
        
        if (p.y === 0) { // Horizontal Axis (S or W)
            yOff = -15; // Push up slightly
            if (p.x > 0) { xOff = 10; anchor = "start"; } // Right side
            else { xOff = -10; anchor = "end"; }          // Left side
        } else { // Vertical Axis (O or T)
            xOff = 15; // Push right slightly
            anchor = "start";
            if (p.y < 0) yOff = -5; // Top
            else yOff = 15;         // Bottom
        }

        const valText = chartGroup.append("text")
            .attr("x", p.x + xOff)
            .attr("y", p.y + yOff)
            .text(values[i].toFixed(2))
            .style("font", CONFIG.fontValue).style("fill", CONFIG.colorDot).attr("text-anchor", anchor);

        valText.clone(true).lower().attr("stroke", "white").attr("stroke-width", 4);
    });
}






// ----------------------------------------------------
// EXECUTE
// ----------------------------------------------------
if (typeof dbData !== 'undefined' && dbData.length > 0) {
    drawSWOTMatrix("#chart-swot", dbData);
    addDownloadButton("#chart-swot", "Thesis_SWOT_Net_Position");

    drawSWOTBreakdown("#chart-swot-breakdown", dbData);
    addDownloadButton("#chart-swot-breakdown", "Thesis_SWOT_Components");
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