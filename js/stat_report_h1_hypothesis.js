/**
 * THESIS MAP: H1 HYPOTHESIS TEST
 * Hypothesis: "Knowledge (Familiarity) -> Positive Perception (SO Score)"
 */

let map;

function initializeMap(rawData) {

    // ============================================================
    // 1. DATA PROCESSING & STATS PREP
    // ============================================================
    
    let locData = {};
    
    // Arrays to hold the raw scores for the t-test
    let groupMoreScores = [];
    let groupLessScores = [];

    rawData.forEach(item => {
        const key = `${item.geo_responder_settlement_latitude}_${item.geo_responder_settlement_longitude}`;
        const group = item.drone_familiarity_group; // 'More' or 'Less'
        
        // --- 1. CALCULATE SO ATTITUDE (AVERAGE) ---
        // Match JASP: (Sum of Items) / 8
        const v = (val) => parseInt(val) || 3;
        let sum = 
            v(item.S1) + v(item.S2) + v(item.S3) + v(item.S4) +
            v(item.O1) + v(item.O2) + v(item.O3) + v(item.O4);
        
        let avgScore = sum / 8.0; 

        // Add to global lists for Statistics
        if (group === 'More') {
            groupMoreScores.push(avgScore);
        } else if (group === 'Less') {
            groupLessScores.push(avgScore);
        }

        // --- 2. AGGREGATE FOR MAP ---
        if (!locData[key]) {
            locData[key] = {
                lat: parseFloat(item.geo_responder_settlement_latitude),
                lng: parseFloat(item.geo_responder_settlement_longitude),
                postal: item.responder_postal_code,
                moreSum: 0, moreCount: 0,
                lessSum: 0, lessCount: 0
            };
        }

        if (group === 'More') {
            locData[key].moreSum += avgScore;
            locData[key].moreCount++;
        } else {
            locData[key].lessSum += avgScore;
            locData[key].lessCount++;
        }
    });

    // Calculate Map Averages
    let plotData = Object.values(locData).map(d => {
        return {
            lat: d.lat, lng: d.lng, postal: d.postal,
            avgMore: d.moreCount > 0 ? (d.moreSum / d.moreCount) : null,
            avgLess: d.lessCount > 0 ? (d.lessSum / d.lessCount) : null,
            countMore: d.moreCount, countLess: d.lessCount
        };
    });

    // ============================================================
    // 2. DISPLAY STATISTICS (Student's t-Test)
    // ============================================================
    
    calculateAndDisplayStats(groupMoreScores, groupLessScores);


    // ============================================================
    // 3. MAP SETUP
    // ============================================================
    
    L.Browser.any3d = false; 
    map = L.map('map_full', { center: [47.165, 19.509], zoom: 7, preferCanvas: true });

    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO', subdomains: 'abcd'
    }).addTo(map);

    map.createPane('voronoiPane');
    map.getPane('voronoiPane').style.zIndex = 200;


    // ============================================================
    // 4. MAP LAYERS
    // ============================================================

    // Scale: 1.0 (Low) -> 5.0 (High)
    function getOptimismColor(score) {
        if (score === null) return 'transparent';
        if (score >= 4.0) return '#bd0026'; // Very High
        if (score >= 3.5) return '#f03b20'; 
        if (score >= 3.0) return '#fd8d3c'; // Neutral/Good
        return '#ffffb2';                  // Low
    }

    const voronoiMore = L.layerGroup();
    const voronoiLess = L.layerGroup();

    function drawVoronoi(dataSet, targetLayer, scoreKey) {
        targetLayer.clearLayers();
        const validPoints = dataSet.filter(d => d[scoreKey] !== null).map(d => {
            const p = map.latLngToLayerPoint([d.lat, d.lng]);
            p.data = d; return p;
        });
        if (validPoints.length === 0) return;

        // Fixed Bounds (Hungary)
        let minLat = 34, minLng = -13, maxLat = 75, maxLng = 64;
        const p1 = map.latLngToLayerPoint([maxLat, minLng]);
        const p2 = map.latLngToLayerPoint([minLat, maxLng]);
        
        const delaunay = d3.Delaunay.from(validPoints, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.max(p1.x, p2.x), Math.max(p1.y, p2.y)]);

        for (let i = 0; i < validPoints.length; i++) {
            const cell = voronoi.cellPolygon(i);
            if (cell) {
                const latLngs = cell.map(p => map.layerPointToLatLng([p[0], p[1]]));
                const score = validPoints[i].data[scoreKey];
                targetLayer.addLayer(L.polygon(latLngs, {
                    pane: 'voronoiPane', fillColor: getOptimismColor(score),
                    fillOpacity: 0.5, weight: 1, color: 'white', opacity: 0.3
                }).bindTooltip(`Optimism: ${score.toFixed(2)}`, { sticky: true }));
            }
        }
    }

    drawVoronoi(plotData, voronoiMore, 'avgMore');
    drawVoronoi(plotData, voronoiLess, 'avgLess');
    map.on('zoomend', () => {
        drawVoronoi(plotData, voronoiMore, 'avgMore');
        drawVoronoi(plotData, voronoiLess, 'avgLess');
    });

    // Comparison Bars
    const comparisonLayer = L.layerGroup();
    plotData.forEach(d => {
        if (d.avgMore !== null && d.avgLess !== null) {
            let diff = d.avgMore - d.avgLess;
            let hMore = (d.avgMore / 5) * 40; // Scale to 5
            let hLess = (d.avgLess / 5) * 40;
            const icon = L.divIcon({
                className: 'h1-compare-icon',
                html: `<div style="display:flex; align-items:flex-end; height:50px; background:rgba(255,255,255,0.7); padding:2px; border:1px solid #ccc;">
                        <div style="width:10px; height:${hLess}px; background:#4e79a7;"></div>
                        <div style="width:10px; height:${hMore}px; background:#f28e2b;"></div>
                    </div><div style="text-align:center; font-size:10px; color:${diff > 0 ? 'green' : 'red'}">${diff > 0 ? '+' : ''}${diff.toFixed(2)}</div>`,
                iconSize: [30, 60], iconAnchor: [15, 60]
            });
            comparisonLayer.addLayer(L.marker([d.lat, d.lng], { icon: icon }));
        }
    });

    L.control.layers({ "Base Map": baseLayer }, {
        "Experts (More)": voronoiMore,
        "Novices (Less)": voronoiLess,
        "Comparison Bars": comparisonLayer
    }, { collapsed: false }).addTo(map);
    
    voronoiMore.addTo(map);
}

// ============================================================
// STATISTICAL ENGINE (Student's t-Test)
// ============================================================

function calculateAndDisplayStats(groupMore, groupLess) {
    
    // 1. Descriptive Stats
    const statsMore = getDescriptive(groupMore);
    const statsLess = getDescriptive(groupLess);

    // 2. Student's t-Test (Equal Variances Assumed)
    // Formula: t = (M1 - M2) / (Sp * sqrt(1/n1 + 1/n2))
    
    // Pooled Variance
    const df1 = statsMore.n - 1;
    const df2 = statsLess.n - 1;
    const pooledVariance = ((df1 * statsMore.variance) + (df2 * statsLess.variance)) / (df1 + df2);
    const pooledSD = Math.sqrt(pooledVariance);
    
    // Standard Error of Difference
    const seDiff = pooledSD * Math.sqrt((1/statsMore.n) + (1/statsLess.n));
    
    // T-Value
    const meanDiff = statsMore.mean - statsLess.mean;
    const tVal = meanDiff / seDiff;
    
    // Degrees of Freedom (n1 + n2 - 2)
    const df = statsMore.n + statsLess.n - 2;

    // P-Value (T-Distribution CDF)
    const pVal = getTDistributionProbability(Math.abs(tVal), df);

    // Render HTML to match JASP style
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding:15px; background:white; border:1px solid #ccc;">
            <h3 style="margin-top:0;">H1: Independent Samples T-Test (Student's t)</h3>
            
            <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px;">
                <thead>
                    <tr style="border-bottom:1px solid #000;">
                        <th style="text-align:left; padding:5px;">Variable</th>
                        <th style="text-align:right;">t</th>
                        <th style="text-align:right;">df</th>
                        <th style="text-align:right;">p</th>
                        <th style="text-align:right;">Mean Diff</th>
                        <th style="text-align:right;">SE Diff</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding:5px;">SO_Attitude</td>
                        <td style="text-align:right;">${tVal.toFixed(3)}</td>
                        <td style="text-align:right;">${df}</td>
                        <td style="text-align:right; font-weight:bold; color:${pVal < 0.05 ? 'green' : 'red'}">
                            ${pVal.toFixed(3).replace(/^0+/, '')}
                        </td>
                        <td style="text-align:right;">${meanDiff.toFixed(3)}</td>
                        <td style="text-align:right;">${seDiff.toFixed(3)}</td>
                    </tr>
                </tbody>
            </table>

            <h4 style="margin:0;">Group Descriptives</h4>
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                    <tr style="border-bottom:1px solid #000;">
                        <th style="text-align:left; padding:5px;">Group</th>
                        <th style="text-align:right;">N</th>
                        <th style="text-align:right;">Mean</th>
                        <th style="text-align:right;">SD</th>
                        <th style="text-align:right;">SE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background:#f9f9f9;">
                        <td style="padding:5px;"><strong>Experts (More)</strong></td>
                        <td style="text-align:right;">${statsMore.n}</td>
                        <td style="text-align:right;">${statsMore.mean.toFixed(3)}</td>
                        <td style="text-align:right;">${statsMore.sd.toFixed(3)}</td>
                        <td style="text-align:right;">${statsMore.sem.toFixed(3)}</td>
                    </tr>
                    <tr>
                        <td style="padding:5px;"><strong>Novices (Less)</strong></td>
                        <td style="text-align:right;">${statsLess.n}</td>
                        <td style="text-align:right;">${statsLess.mean.toFixed(3)}</td>
                        <td style="text-align:right;">${statsLess.sd.toFixed(3)}</td>
                        <td style="text-align:right;">${statsLess.sem.toFixed(3)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('stats_content').innerHTML = html;
}

function getDescriptive(arr) {
    const n = arr.length;
    if (n === 0) return { n:0, mean:0, variance:0, sd:0, sem:0 };
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    return { n, mean, variance, sd, sem: sd / Math.sqrt(n) };
}

// Stats Math Helpers (Beta function approximation for Student's T CDF)
function getTDistributionProbability(t, df) {
    if (df > 1000) return 2 * (1 - probabilityNormal(Math.abs(t))); 
    const x = df / (df + t * t);
    return ibeta(0.5 * df, 0.5, x);
}
function probabilityNormal(z) {
    const b1 = 0.319381530, b2 = -0.356563782, b3 = 1.781477937, b4 = -1.821255978, b5 = 1.330274429, p = 0.2316419, c2 = 0.39894228;
    const a = Math.abs(z), t = 1.0 / (1.0 + a * p);
    const b = c2 * Math.exp((-z) * (z / 2.0));
    let n = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
    n = 1.0 - b * n;
    if (z < 0.0) n = 1.0 - n;
    return n;
}
function ibeta(a, b, x) {
    if (x == 0) return 0; if (x == 1) return 1;
    const logGamma = (z) => {
        const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let y = z, tmp = z + 5.5; tmp -= (z + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015; for (let j = 0; j < 6; j++) ser += c[j] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / z);
    };
    const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    let f = 1.0, c = 1.0, d = 0.0, delta, i, m;
    for (i = 0; i <= 500; i++) {
        m = i / 2; let numerator;
        if (i === 0) numerator = 1.0;
        else if (i % 2 === 0) numerator = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
        else numerator = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
        d = 1.0 + numerator * d; if (Math.abs(d) < 1.0e-30) d = 1.0e-30;
        c = 1.0 + numerator / c; if (Math.abs(c) < 1.0e-30) c = 1.0e-30;
        d = 1.0 / d; delta = d * c; f *= delta;
        if (Math.abs(delta - 1.0) < 1.0e-12) break;
    }
    return front * (f - 1.0);
}