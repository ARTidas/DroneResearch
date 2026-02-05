// ==========================================================
// THESIS SWOT VISUALIZATION (MULTI-SERIES SUPPORT)
// ==========================================================

const CONFIG = {
    width: 800,
    height: 500,
    margin: { top: 5, right: 270, bottom: 5, left: 5 },
    
    // Style
    colorGrid: "#e0e0e0",
    colorAxis: "#333",
    fontLabel: "12px Arial",
    fontTick: "11px Arial",
    
    // Compact Legend Settings
    legendFontTitle: "bold 11px Arial",
    legendFontValue: "10px monospace",
    legendBoxSize: 10,
    
    // Series Colors
    colors: {
        // ... keep existing palettes ...
        total:  "#d95f02",
        male:   "#36a2eb", female: "#ff6384",
        young:  "#4bc0c0", old:    "#9966ff",
        rural:  "#66c2a5", urban:  "#8da0cb",
        moreFamiliar: "#3f51b5", lessFamiliar: "#ffb74d",
        buckets: ["#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845", "#2E86C1", "#1ABC9C", "#27AE60", "#7DCEA0"],
        education: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"],
        
        // NEW PALETTE: Professions
        profession: [
            "#e7298a", // Student (Pinkish)
            "#1b9e77", // Military/Law (Green)
            "#7570b3", // IT/Tech (Purple)
            "#d95f02", // Retired (Orange)
            "#66a61e", // Healthcare (Lime)
            "#e6ab02", // Business/Other (Yellow)
            "#a6761d"  // Blue Collar (Brown)
        ]
    }
};
CONFIG.colors.clusters = {
    optimist:   "#4caf50", // Green
    skeptic:    "#f44336", // Red
    conflicted: "#ff9800", // Orange
    indifferent:"#9e9e9e"  // Grey
};
CONFIG.colors.gengender = [
    "#2196f3", // Young Male (Blue)
    "#e91e63", // Young Female (Pink)
    "#1565c0", // Old Male (Dark Blue)
    "#ad1457"  // Old Female (Dark Pink)
];

// ==========================================================
// DATA PROCESSING HELPER
// ==========================================================
function calculateSwotAverages(data) {
    let totalS = 0, totalW = 0, totalO = 0, totalT = 0, count = 0;
    
    data.forEach(d => {
        const s = (Number(d.S1)+Number(d.S2)+Number(d.S3)+Number(d.S4)) / 4;
        const w = (Number(d.W1)+Number(d.W2)+Number(d.W3)+Number(d.W4)) / 4;
        const o = (Number(d.O1)+Number(d.O2)+Number(d.O3)+Number(d.O4)) / 4;
        const t = (Number(d.T1)+Number(d.T2)+Number(d.T3)+Number(d.T4)) / 4;
        
        if (!isNaN(s)) { 
            totalS += s; totalW += w; totalO += o; totalT += t; 
            count++; 
        }
    });

    if (count === 0) return null;
    const avgS = totalS / count;
    const avgW = totalW / count;
    const avgO = totalO / count;
    const avgT = totalT / count;

    return {
        count: count,
        S: avgS, W: avgW, O: avgO, T: avgT,
        x: avgS - avgW,
        y: avgO - avgT
    };
}

// ==========================================================
// CHART 1: STRATEGIC MATRIX
// ==========================================================
function drawMultiMatrix(containerId, seriesList) {
    
    const width = CONFIG.width - CONFIG.margin.left - CONFIG.margin.right;
    const height = CONFIG.height - CONFIG.margin.top - CONFIG.margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;

    d3.select(containerId).html("");
    const svg = d3.select(containerId).append("svg")
        .attr("width", CONFIG.width).attr("height", CONFIG.height)
        .append("g").attr("transform", `translate(${CONFIG.margin.left},${CONFIG.margin.top})`);

    const limit = 2.5; 
    const x = d3.scaleLinear().domain([-limit, limit]).range([0, width]);
    const y = d3.scaleLinear().domain([limit, -limit]).range([0, height]);

    // Background Quadrants
    svg.append("rect").attr("x", centerX).attr("y", 0).attr("width", centerX).attr("height", centerY).attr("fill", "#e6f5c9").attr("opacity", 0.3);
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", centerX).attr("height", centerY).attr("fill", "#fff2ae").attr("opacity", 0.3);
    svg.append("rect").attr("x", 0).attr("y", centerY).attr("width", centerX).attr("height", centerY).attr("fill", "#f4cae4").attr("opacity", 0.3);
    svg.append("rect").attr("x", centerX).attr("y", centerY).attr("width", centerX).attr("height", centerY).attr("fill", "#cbd5e8").attr("opacity", 0.3);

    // Axes
    svg.append("g").attr("transform", `translate(0, ${centerY})`).call(d3.axisBottom(x).ticks(5).tickSize(-5)).call(g => g.select(".domain").attr("stroke", "#333"));
    svg.append("g").attr("transform", `translate(${centerX}, 0)`).call(d3.axisLeft(y).ticks(5).tickSize(-5)).call(g => g.select(".domain").attr("stroke", "#333"));
    
    // Labels (Moved Inside)
    const addLabel = (txt, x, y, anchor) => {
        const t = svg.append("text").attr("x", x).attr("y", y).text(txt)
            .attr("text-anchor", anchor)
            .style("font", CONFIG.fontLabel).style("font-weight", "bold").style("fill", "#444");
        t.clone(true).lower().attr("stroke", "white").attr("stroke-width", 3);
    };

    addLabel("OPPORTUNITIES", centerX, 15, "middle");
    addLabel("THREATS", centerX, height - 10, "middle");
    addLabel("STRENGTHS", width - 10, centerY + 5, "end");
    addLabel("WEAKNESSES", 10, centerY + 5, "start");

    // Plot Series
    const legendGroup = svg.append("g").attr("transform", `translate(${width + 30}, 0)`);
    
    seriesList.forEach((series, index) => {
        const stats = calculateSwotAverages(series.data);
        if (!stats) return;

        svg.append("circle")
            .attr("cx", x(stats.x)).attr("cy", y(stats.y)).attr("r", 7)
            .attr("fill", series.color).attr("stroke", "white").attr("stroke-width", 2).attr("opacity", 0.9);

        // --- COMPACT LEGEND ---
        const rowHeight = 35;
        const lg = legendGroup.append("g").attr("transform", `translate(0, ${index * rowHeight})`);
        
        lg.append("rect").attr("width", CONFIG.legendBoxSize).attr("height", CONFIG.legendBoxSize).attr("fill", series.color).attr("rx", 2);
        
        lg.append("text").attr("x", 15).attr("y", 9)
          .text(`${series.label} (n=${stats.count})`)
          .style("font", CONFIG.legendFontTitle);
        
        lg.append("text").attr("x", 0).attr("y", 22)
          .text(`x: ${stats.x.toFixed(2)}, y: ${stats.y.toFixed(2)}`)
          .style("font", CONFIG.legendFontValue).attr("fill", "#555");
    });
}

// ==========================================================
// CHART 2: COMPONENT BREAKDOWN
// ==========================================================
function drawMultiBreakdown(containerId, seriesList) {
    
    const width = CONFIG.width - CONFIG.margin.left - CONFIG.margin.right;
    const height = CONFIG.height - CONFIG.margin.top - CONFIG.margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    const rScale = d3.scaleLinear().domain([0, 5]).range([0, maxRadius]);

    d3.select(containerId).html("");
    const svg = d3.select(containerId).append("svg")
        .attr("width", CONFIG.width).attr("height", CONFIG.height)
        .append("g").attr("transform", `translate(${CONFIG.margin.left},${CONFIG.margin.top})`);

    const chartGroup = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    // Grid Rings
    [1, 2, 3, 4, 5].forEach(tick => {
        chartGroup.append("circle").attr("r", rScale(tick)).attr("fill", "none").attr("stroke", "#ddd").attr("stroke-dasharray", "3,3");
        chartGroup.append("text").attr("x", 2).attr("y", -rScale(tick) + 2).text(tick).style("font-size", "9px").style("fill", "#999").attr("text-anchor", "start");
    });

    // Labels
    const addLabel = (txt, x, y, anchor) => {
        const t = svg.append("text").attr("x", x).attr("y", y).text(txt)
            .attr("text-anchor", anchor)
            .style("font", CONFIG.fontLabel).style("font-weight", "bold").style("fill", "#444");
        t.clone(true).lower().attr("stroke", "white").attr("stroke-width", 3);
    };

    addLabel("OPPORTUNITIES", centerX, 15, "middle");
    addLabel("THREATS", centerX, height - 10, "middle");
    addLabel("STRENGTHS", width - 10, centerY + 5, "end");
    addLabel("WEAKNESSES", 10, centerY + 5, "start");

    // Plot Series
    const legendGroup = svg.append("g").attr("transform", `translate(${width + 30}, 0)`);

    seriesList.forEach((series, index) => {
        const stats = calculateSwotAverages(series.data);
        if (!stats) return;

        const points = [
            { x: rScale(stats.S), y: 0 },
            { x: 0,               y: -rScale(stats.O) },
            { x: -rScale(stats.W), y: 0 },
            { x: 0,               y: rScale(stats.T) },
        ];
        const line = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveLinearClosed);

        chartGroup.append("path").datum(points).attr("d", line).attr("fill", series.color).attr("fill-opacity", 0.05).attr("stroke", series.color).attr("stroke-width", 2);
        points.forEach(p => { chartGroup.append("circle").attr("cx", p.x).attr("cy", p.y).attr("r", 3).attr("fill", series.color); });

        // --- COMPACT LEGEND ---
        const rowHeight = 45; 
        const lg = legendGroup.append("g").attr("transform", `translate(0, ${index * rowHeight})`);
        
        lg.append("rect").attr("width", CONFIG.legendBoxSize).attr("height", CONFIG.legendBoxSize).attr("fill", series.color).attr("rx", 2);
        
        lg.append("text").attr("x", 15).attr("y", 9)
          .text(`${series.label} (n=${stats.count})`)
          .style("font", CONFIG.legendFontTitle);
        
        lg.append("text").attr("x", 0).attr("y", 22)
          .text(`S:${stats.S.toFixed(2)}  W:${stats.W.toFixed(2)}`)
          .style("font", CONFIG.legendFontValue).attr("fill", "#555");
        
        lg.append("text").attr("x", 0).attr("y", 33) 
          .text(`O:${stats.O.toFixed(2)}  T:${stats.T.toFixed(2)}`)
          .style("font", CONFIG.legendFontValue).attr("fill", "#555");
    });
}

// ==========================================================
// EXECUTE
// ==========================================================

if (typeof dbData !== 'undefined' && dbData.length > 0) {
    
    // 1. Total
    drawMultiMatrix("#chart-total-matrix", [{ label: "Total", color: CONFIG.colors.total, data: dbData }]);
    drawMultiBreakdown("#chart-total-breakdown", [{ label: "Total", color: CONFIG.colors.total, data: dbData }]);
    addDownloadButton("#chart-total-matrix", "Total_Net_Position");
    addDownloadButton("#chart-total-breakdown", "Total_Components");

    // 2. Gender
    const maleData = dbData.filter(d => d.gender === 'Male'); 
    const femaleData = dbData.filter(d => d.gender === 'Female');
    const genderSeries = [
        { label: "Male", color: CONFIG.colors.male, data: maleData },
        { label: "Female", color: CONFIG.colors.female, data: femaleData }
    ];
    drawMultiMatrix("#chart-gender-matrix", genderSeries);
    drawMultiBreakdown("#chart-gender-breakdown", genderSeries);
    addDownloadButton("#chart-gender-matrix", "Gender_Net_Position");
    addDownloadButton("#chart-gender-breakdown", "Gender_Components");

    // 3. Age Split
    const AGE_CUTOFF = 76.64 / 2; 
    const youngData = dbData.filter(d => parseFloat(d.age) < AGE_CUTOFF);
    const oldData = dbData.filter(d => parseFloat(d.age) >= AGE_CUTOFF);
    const ageSeries = [
        { label: "Younger", color: CONFIG.colors.young, data: youngData },
        { label: "Older", color: CONFIG.colors.old, data: oldData }
    ];
    drawMultiMatrix("#chart-age-matrix", ageSeries);
    drawMultiBreakdown("#chart-age-breakdown", ageSeries);
    addDownloadButton("#chart-age-matrix", "Age_Split_Net_Position");
    addDownloadButton("#chart-age-breakdown", "Age_Split_Components");

    // 4. Age Buckets
    const bucketRanges = [
        { min: 10, max: 20, label: "10-20y" },
        { min: 20, max: 30, label: "20-30y" },
        { min: 30, max: 40, label: "30-40y" },
        { min: 40, max: 50, label: "40-50y" },
        { min: 50, max: 60, label: "50-60y" },
        { min: 60, max: 70, label: "60-70y" },
        { min: 70, max: 80, label: "70-80y" },
        { min: 80, max: 90, label: "80-90y" },
        { min: 90, max: 999, label: "90+y" }
    ];
    const bucketSeries = [];
    bucketRanges.forEach((range, i) => {
        const subset = dbData.filter(d => {
            const age = parseFloat(d.age);
            return age >= range.min && age < range.max;
        });
        if (subset.length > 0) {
            bucketSeries.push({
                label: range.label,
                color: CONFIG.colors.buckets[i] || "#333",
                data: subset
            });
        }
    });
    drawMultiMatrix("#chart-age-bucket-matrix", bucketSeries);
    drawMultiBreakdown("#chart-age-bucket-breakdown", bucketSeries);
    addDownloadButton("#chart-age-bucket-matrix", "Age_Buckets_Net_Position");
    addDownloadButton("#chart-age-bucket-breakdown", "Age_Buckets_Components");

    // 5. Education Split
    const educationGroups = {};
    const orderMap = { 
        "primary": 1, "elementary": 1,
        "secondary": 2, "high school": 2, 
        "college": 3, "vocational": 3,
        "bachelor": 4, "university": 4,
        "master": 5, "phd": 6, "doctorate": 6 
    };
    dbData.forEach(d => {
        const edu = d.education ? d.education.trim() : "Unknown";
        if (!educationGroups[edu]) educationGroups[edu] = [];
        educationGroups[edu].push(d);
    });
    const eduSeries = Object.keys(educationGroups)
        .sort((a, b) => {
            const valA = orderMap[a.toLowerCase()] || 99;
            const valB = orderMap[b.toLowerCase()] || 99;
            if (valA !== valB) return valA - valB;
            return a.localeCompare(b);
        })
        .map((key, index) => {
            return {
                label: key,
                color: CONFIG.colors.education[index % CONFIG.colors.education.length], 
                data: educationGroups[key]
            };
        });
    drawMultiMatrix("#chart-education-matrix", eduSeries);
    drawMultiBreakdown("#chart-education-breakdown", eduSeries);
    addDownloadButton("#chart-education-matrix", "Education_Net_Position");
    addDownloadButton("#chart-education-breakdown", "Education_Components");

    // 6. Settlement Split
    const ruralData = dbData.filter(d => d.settlement_group === 'Rural');
    const urbanData = dbData.filter(d => d.settlement_group === 'Urban');
    const settlementSeries = [
        { label: "Rural", color: CONFIG.colors.rural, data: ruralData },
        { label: "Urban", color: CONFIG.colors.urban, data: urbanData }
    ];
    drawMultiMatrix("#chart-settlement-matrix", settlementSeries);
    drawMultiBreakdown("#chart-settlement-breakdown", settlementSeries);
    addDownloadButton("#chart-settlement-matrix", "Settlement_Net_Position");
    addDownloadButton("#chart-settlement-breakdown", "Settlement_Components");

    // 7. Drone Familiarity Split (New)
    const moreFamiliar = dbData.filter(d => d.drone_familiarity_group === 'More');
    const lessFamiliar = dbData.filter(d => d.drone_familiarity_group === 'Less');
    const familiaritySeries = [
        { label: "More Familiar", color: CONFIG.colors.moreFamiliar, data: moreFamiliar },
        { label: "Less Familiar", color: CONFIG.colors.lessFamiliar, data: lessFamiliar }
    ];
    drawMultiMatrix("#chart-familiarity-matrix", familiaritySeries);
    drawMultiBreakdown("#chart-familiarity-breakdown", familiaritySeries);
    addDownloadButton("#chart-familiarity-matrix", "Familiarity_Net_Position");
    addDownloadButton("#chart-familiarity-breakdown", "Familiarity_Components");


    // --- 8. Profession Split ---
    const profGroups = {};
    
    dbData.forEach(d => {
        // Map raw DB string to clean Group
        const group = getProfessionGroup(d.profession); 
        
        if (!profGroups[group]) profGroups[group] = [];
        profGroups[group].push(d);
    });

    const profSeries = Object.keys(profGroups).map((key, index) => {
        return {
            label: key,
            color: CONFIG.colors.profession[index % CONFIG.colors.profession.length], 
            data: profGroups[key]
        };
    });

    // Optional: Sort so "Student" and "Retired" are usually first or consistent
    profSeries.sort((a, b) => a.label.localeCompare(b.label));

    drawMultiMatrix("#chart-profession-matrix", profSeries);
    drawMultiBreakdown("#chart-profession-breakdown", profSeries);
    addDownloadButton("#chart-profession-matrix", "Profession_Net_Position");
    addDownloadButton("#chart-profession-breakdown", "Profession_Components");



    // We categorize each respondent based on their own scores
    const optimists = [];
    const skeptics = [];
    const conflicted = [];
    const indifferent = [];

    // Calculate Global Average O and T to determine the "cut-off" point
    let sumO = 0, sumT = 0, validCount = 0;
    dbData.forEach(d => {
        const o = (Number(d.O1)+Number(d.O2)+Number(d.O3)+Number(d.O4))/4;
        const t = (Number(d.T1)+Number(d.T2)+Number(d.T3)+Number(d.T4))/4;
        if(!isNaN(o) && !isNaN(t)) { sumO += o; sumT += t; validCount++; }
    });
    const avgO = sumO / validCount;
    const avgT = sumT / validCount;

    dbData.forEach(d => {
        const o = (Number(d.O1)+Number(d.O2)+Number(d.O3)+Number(d.O4))/4;
        const t = (Number(d.T1)+Number(d.T2)+Number(d.T3)+Number(d.T4))/4;
        
        if (isNaN(o) || isNaN(t)) return;

        // Logic: 
        // High O + Low T = Optimist
        // Low O + High T = Skeptic
        // High O + High T = Conflicted
        // Low O + Low T  = Indifferent
        
        if (o >= avgO && t < avgT)  optimists.push(d);
        else if (o < avgO && t >= avgT) skeptics.push(d);
        else if (o >= avgO && t >= avgT) conflicted.push(d);
        else indifferent.push(d);
    });

    const clusterSeries = [
        { label: "Optimists - High O + Low T",   color: CONFIG.colors.clusters.optimist,    data: optimists },
        { label: "Skeptics - Low O + High T",    color: CONFIG.colors.clusters.skeptic,     data: skeptics },
        { label: "Conflicted - High O + High T",  color: CONFIG.colors.clusters.conflicted,  data: conflicted },
        { label: "Indifferent - Low O + Low T", color: CONFIG.colors.clusters.indifferent, data: indifferent }
    ];

    drawMultiMatrix("#chart-cluster-matrix", clusterSeries);
    drawMultiBreakdown("#chart-cluster-breakdown", clusterSeries);
    addDownloadButton("#chart-cluster-matrix", "Clusters_Net_Position");
    addDownloadButton("#chart-cluster-breakdown", "Clusters_Components");


    // --- 10. GENERATION x GENDER (Interaction) ---
    // Using your Age Cutoff
    const CUTOFF_GEN = 76.64 / 2; // ~38 years old

    const youngMales = dbData.filter(d => parseFloat(d.age) < CUTOFF_GEN && d.gender === 'Male');
    const youngFemales = dbData.filter(d => parseFloat(d.age) < CUTOFF_GEN && d.gender === 'Female');
    const oldMales = dbData.filter(d => parseFloat(d.age) >= CUTOFF_GEN && d.gender === 'Male');
    const oldFemales = dbData.filter(d => parseFloat(d.age) >= CUTOFF_GEN && d.gender === 'Female');

    const genGenderSeries = [
        { label: "Young Male",   color: CONFIG.colors.gengender[0], data: youngMales },
        { label: "Young Female", color: CONFIG.colors.gengender[1], data: youngFemales },
        { label: "Older Male",   color: CONFIG.colors.gengender[2], data: oldMales },
        { label: "Older Female", color: CONFIG.colors.gengender[3], data: oldFemales }
    ];

    drawMultiMatrix("#chart-gengender-matrix", genGenderSeries);
    drawMultiBreakdown("#chart-gengender-breakdown", genGenderSeries);
    addDownloadButton("#chart-gengender-matrix", "GenGender_Net_Position");
    addDownloadButton("#chart-gengender-breakdown", "GenGender_Components");




} else {
    console.error("No data found.");
}





// ==========================================================
// 2. HELPER: PROFESSION CLEANER (Hungarian)
// ==========================================================
function getProfessionGroup(raw) {
    if (!raw) return "Other";
    const p = raw.toLowerCase().trim();
    
    // 1. Student (Diák, Hallgató, Tanuló, Egyetemista)
    if (p.includes("tanuló") || p.includes("hallgató") || p.includes("diák") || p.includes("egyetemista") || p.includes("pti") || p.includes("b1")) {
        return "Student";
    }

    // 2. Retired (Nyugdíjas, Gyes - inactive)
    if (p.includes("nyugdíj") || p.includes("gyes") || p.includes("álláskereső")) {
        return "Retired/Inactive";
    }

    // 3. Military / Law Enforcement (Katona, Rendőr, Tűzoltó, Honvéd)
    if (p.includes("katona") || p.includes("rendőr") || p.includes("tűzoltó") || p.includes("hivatásos") || p.includes("tiszt") || p.includes("szolgálati")) {
        return "Military/Uniformed";
    }

    // 4. IT / Tech / Engineering (Informatikus, Programozó, Mérnök, Drone, UAV)
    if (p.includes("it") || p.includes("informatikus") || p.includes("programozó") || p.includes("mérnök") || p.includes("fejlesztő") || p.includes("rendszergazda") || p.includes("uav") || p.includes("drón") || p.includes("analyst") || p.includes("digitalizáció")) {
        return "IT/Tech/Eng";
    }

    // 5. Healthcare (Orvos, Ápoló, Mentő, Gyógyszerész)
    if (p.includes("orvos") || p.includes("ápoló") || p.includes("mentő") || p.includes("gyógyszer") || p.includes("optometrista") || p.includes("biológus") || p.includes("pszichológus")) {
        return "Healthcare";
    }

    // 6. Business / Admin / White Collar (Könyvelő, Menedzser, Ügyintéző)
    if (p.includes("könyvelő") || p.includes("menedzser") || p.includes("manager") || p.includes("ügyintéző") || p.includes("vezető") || p.includes("iroda") || p.includes("admin") || p.includes("referens") || p.includes("vállalkozó") || p.includes("keresked")) {
        return "Business/Admin";
    }

    // Default to Other (includes trades, retail, services, etc.)
    return "Other/Services";
}





function addDownloadButton(containerId, fileName) {
    const container = d3.select(containerId);
    const button = container.append("div").style("text-align", "center")
        .append("button")
        .text("📷 Download PNG")
        .style("margin-top", "5px")
        .style("padding", "5px 10px")
        .style("cursor", "pointer");

    button.on("click", function() {
        const svgElement = container.select("svg").node();
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const scale = 2; 
        const width = +svgElement.getAttribute("width");
        const height = +svgElement.getAttribute("height");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(svgBlob);
        img.onload = function() {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width * scale, height * scale);
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = fileName + ".png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
}