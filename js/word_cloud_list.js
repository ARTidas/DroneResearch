// 5. The Word Cloud Builder (Dual Language Support)
function drawWordCloud(containerId, data, language) {

    // --- A. Configuration ---
    
    // 1. Translation Map (Used only if language === 'en')
    const translationMap = {
        "drón": "drone",
        "drónok": "drones",
        "veszély": "danger",
        "zavaró": "annoying",
        "magánélet": "privacy",
        "megfigyelés": "surveillance",
        "kémkedés": "spying",
        "baleset": "accident",
        "zaj": "noise",
        "szabályozás": "regulation",
        "játék": "toy",
        "repülés": "flight",
        "biztonság": "security",
        "hasznos": "useful",
        "segítség": "help",
        "jövő": "future",
        "semmi": "nothing",
        "nem tudom": "don't know",
        "félelem": "fear",
        "remény": "hope",
        "megfelelő": "appropriate",
        "nincs": "non-existing",
        "használni": "use",
        "rossz": "bad",
        "félelmem": "fear",
        "reményem": "hope",
        "legnagyobb": "biggest",
        "célra": "purpose",
        "remélem": "hope",
        "reményeim": "hope",
        "területen": "field",
        "több": "more",
        "egyre": "increasingly",
        "szerint": "according",
        "emberek": "people",
        "lehetnek": "may",
        "megsértése": "violate",
        "minden": "all",
        "használják": "use",
        "ahol": "where",
        "tudom": "know",
        "jelenleg": "currently",
        "jogi": "legal",
        "dolgokra": "purpose",
        "mindent": "all",
        "sokkal": "increasingly",
        "nagy": "large",
        "használja": "use",
        "emberekben": "people",
        "gyorsabb": "faster",
        "katonai": "military",
        "esetén": "case",
        "munkát": "work",
        "emberi": "human",
        "magánéletem": "privacy",
        "egyáltalán": "ever",
        "drónos": "drone",
        "ember": "people",
        "kiszállítása": "transport",
        "ezzel": "with",
        "elég": "enough",
        "jövőben": "future",
        "létre": "exist",
        "sokan": "lot",
        "repülési": "flight",
        "balesetek": "accident",
        "drónnal": "drone",
        "mindennapokban": "daily",
        "felhasználás": "use",
        "szabályozással": "regulation",
        "emberiség": "humanity",
        "eltűnése": "disappearance",
        "szerintem": "opinion",
        "piac": "market",
        "esetben": "case",
        "használat": "use",
        "olyanok": "such",
        "múlik": "depends",
        "katasztrófa": "disaster",
        "tudok": "can",
        // Add more words as you see them appear in the chart
    };

    // 2. Stop Words (Hungarian)
    const stopWords = new Set([
        "a", "az", "egy", "van", "ez", "hogy", "és", "de", "őket", "való",
        "vagy", "már", "volt", "én", "te", "mi", "ők", "sem", "is", "ilyen",
        "mint", "csak", "nagyon", "sok", "volna", "lehet", "még", "meg",
        "mert", "ha", "pedig", "voltam", "lesz", "lenne", "olyan", "majd",
        "viszont", "lesznek", "ebből", "fogja", "nekem", "azon", 
    ]);

    // --- B. Text Mining ---
    let allText = "";
    data.forEach(d => {
        if (d.biggest_fear_hope) {
            allText += " " + d.biggest_fear_hope.toString();
        }
    });

    const wordCounts = {};
    
    allText
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ") 
        .split(/\s+/) 
        .forEach(word => {
            // Filter junk
            if (word.length > 3 && !stopWords.has(word)) {
                
                let finalWord = word;

                // LOGIC: If English mode is requested, translate it.
                if (language === 'en') {
                    finalWord = translationMap[word] || word;
                }
                
                // Count the final word
                wordCounts[finalWord] = (wordCounts[finalWord] || 0) + 1;
            }
        });

    // Convert to Array
    let entries = Object.entries(wordCounts).map(([text, count]) => ({
        text: text,
        size: count
    }));

    // Sort and slice top 50
    entries.sort((a, b) => b.size - a.size);
    entries = entries.slice(0, 50);

    // --- C. D3 Layout & Draw ---
    const width = 800;
    const height = 400;

    // Check for empty data
    if (entries.length === 0) {
        d3.select(containerId).html("<p>No text data available.</p>");
        return;
    }

    // Scale
    const sizeScale = d3.scaleLinear()
        .domain([d3.min(entries, d => d.size), d3.max(entries, d => d.size)])
        .range([20, 70]); 

    // Clean container
    d3.select(containerId).html("");
    
    const svg = d3.select(containerId).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const layout = d3.layout.cloud()
        .size([width, height])
        .words(entries.map(d => ({ text: d.text, size: sizeScale(d.size) })))
        .padding(5)
        //.rotate(() => (Math.random() > 0.5 ? 90 : 0))
        .rotate(0)
        .font("Impact")
        .fontSize(d => d.size)
        .on("end", draw);

    layout.start();

    function draw(words) {
        const fill = d3.scaleOrdinal(d3.schemeTableau10);

        svg.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => d.size + "px")
            .style("font-family", "Arial")
            .style("fill", (d, i) => fill(i))
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
            .text(d => d.text)
            .style("opacity", 0)
            .transition().duration(1000).style("opacity", 1);
            
        svg.selectAll("text")
            .append("title")
            .text(d => `${d.text}: ${Math.round(sizeScale.invert(d.size))} occurrences`);
    }
}






// 6. Execute
if (typeof dbData !== 'undefined' && dbData.length > 0) {
    // 3. Word Clouds
    // English Version (Translated)
    drawWordCloud("#chart-wordcloud", dbData, 'en');
    addDownloadButton("#chart-wordcloud", "Thesis_WordCloud_English");
    
    // Hungarian Version (Original Reference)
    drawWordCloud("#chart-wordcloud-hun", dbData, 'hu');
    addDownloadButton("#chart-wordcloud-hun", "Thesis_WordCloud_Hungarian");
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