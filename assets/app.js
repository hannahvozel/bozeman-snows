const snotelReady = fetch("./powderwatch/latest/snotel.json")
  .then(r => r.json())
  .catch(err => { console.error("SNOTEL load failed", err); return []; });


const map = L.map("map").setView([45.4, -111], 14);

const usgs = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 16,
  attribution: 'USGS The National Map'
});

const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
});

const relief = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 16,
  opacity: 0.4,
  attribution: 'USGS Shaded Relief'
});

const shade = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
  className: 'shade-tint',
  attribution: 'Tiles &copy; Esri'
});

shade.addTo(map);

/* Add range names to the tinted map (and a few towns so we can locate ourselves..) */
const ranges = [
  { name: "Bridger Range",      lat: 45.85, lng: -110.93 },
  { name: "Gallatin Range",     lat: 45.30, lng: -110.95 },
  { name: "Madison Range",      lat: 45.15, lng: -111.45 },
  { name: "Spanish Peaks",      lat: 45.42, lng: -111.38 },
  { name: "Tobacco Root Mtns",  lat: 45.55, lng: -111.95 },
  { name: "Absaroka Range",     lat: 45.30, lng: -110.45 },
  { name: "Crazy Mountains",    lat: 46.10, lng: -110.30 },
  { name: "Big Belt Mtns",      lat: 46.40, lng: -111.35 },
];

const towns = [
  { name: "Bozeman",          lat: 45.6770, lng: -111.0429 },
  { name: "Big Sky",          lat: 45.2847, lng: -111.3683 },
  { name: "Cooke City",       lat: 45.0202, lng: -109.9335 },
  { name: "West Yellowstone", lat: 44.6621, lng: -111.1041 }
];

const rangeLabels = L.layerGroup(ranges.map(r =>
  L.marker([r.lat, r.lng], {
    interactive: false,
    icon: L.divIcon({ className: "range-label", html: `<span>${r.name}</span>`, iconSize: null })
  })
)).addTo(map);

const townLabels = L.layerGroup(towns.map(r =>
  L.marker([r.lat, r.lng], {
    interactive: false,
    icon: L.divIcon({ className: "town-label", html: `<span>${r.name}</span>`, iconSize: null })
  })
)).addTo(map)

const places = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
});

/* Layers */ 
L.control.layers(
  { 'Shaded (tinted)': shade, 'USGS topo': usgs, 'Esri topo': esri },
  { 'Mountain ranges': rangeLabels, 'Towns & places': places, 'Extra hillshade': relief }
).addTo(map);

const stationIndex = {};   // triplet -> { props, marker }

const stationsReady = fetch("./powderwatch/latest/stations.geojson")
  .then(response => response.json())
  .then(geojson => {
    const stations = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => L.marker(latlng, {
        icon: L.divIcon({
          className: "station-flake",
          html: "❄\uFE0E",
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
      }),
      onEachFeature: (feature, marker) => {
        stationIndex[feature.properties.stationTriplet] = { props: feature.properties, marker };
        marker.bindTooltip(feature.properties.name);
        marker.on("click", async () => showStation(feature.properties, await snotelReady));
      }
    }).addTo(map);

    map.fitBounds(stations.getBounds());
  });

const DeepestCard = L.Control.extend({
  options: { position: "bottomleft" },
  onAdd() {
    const el = L.DomUtil.create("button", "deepest-card");
    el.type = "button";
    el.hidden = true;
    L.DomEvent.disableClickPropagation(el);
    return el;
  }
});
const deepestCard = new DeepestCard().addTo(map);

Promise.all([snotelReady, stationsReady]).then(([rows]) => {
  // Most recent row with a snow depth reading, per station
  const latest = {};
  for (const row of rows) {
    if (row.SNWD == null || !stationIndex[row.station]) continue;
    if (!latest[row.station] || row.time > latest[row.station].time) latest[row.station] = row;
  }

  const candidates = Object.values(latest);
  if (!candidates.length) return;

  const newestDay = candidates.map(r => r.time.slice(0, 10)).sort().at(-1);
  const deepest = candidates
    .filter(r => r.time.slice(0, 10) === newestDay)
    .reduce((a, b) => (b.SNWD > a.SNWD ? b : a));

  const { props, marker } = stationIndex[deepest.station];
  marker.getElement()?.classList.add("deepest");

  const el = deepestCard.getContainer();
  el.innerHTML = `
    <span class="label">Deepest snow</span>
    <span class="depth">${deepest.SNWD}<small> in</small></span>
    <span class="name">${props.name}</span>
    <span class="date">${props.elevation} ft · as of ${newestDay}</span>`;
  el.hidden = false;

  el.addEventListener("click", () => {
    map.flyTo(marker.getLatLng(), 11);
    showStation(props, rows);
  });
});

function showStation(props, snotelRows) {
  const rows = snotelRows
    .filter(row => row.station === props.stationTriplet)
    .sort((a, b) => a.time.localeCompare(b.time));

  const first = rows[0];                    // Oct 1
  const latest = rows[rows.length - 1];     // most recent day
  const dayBefore = rows[rows.length - 2];

  const precip24 = Math.max(0, latest.PREC - dayBefore.PREC);
  const precipWY = latest.PREC - first.PREC;

  document.getElementById("station-name").textContent =
    `${props.name} (${props.elevation} ft)`;

  document.getElementById("current").innerHTML = `
    <p>As of ${latest.time.slice(0, 10)}</p>
    <ul>
      <li>Snow depth: ${latest.SNWD} in</li>
      <li>SWE: ${latest.WTEQ} in</li>
      <li>Avg temp: ${latest.TAVG ?? "no data"} °F</li>
      <li>Precip, last 24 h: ${precip24.toFixed(1)} in</li>
      <li>Precip since Oct 1: ${precipWY.toFixed(1)} in</li>
    </ul>`;

  const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();

  Plotly.newPlot("precip-chart", [{
    x: rows.map(row => row.time),
    y: rows.map(row => row.SNWD),
    type: "scatter",
    mode: "lines",
    line: { color: ink }
  }], {
    font: { family: "Barlow, sans-serif", color: ink },
    title: {
      text: "Snow Depth, Since October 1st",
      font: { family: "Iceland, sans-serif", size: 24 },
      x: 0.5,
      xanchor: "center"
    },
    yaxis: { title: { text: "inches" } },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  });
}