# ❄ Bozeman Snow Report

A small static site that maps SNOTEL stations around Southwest Montana and highlights which one is currently reading the deepest snow.

**Live site:** https://hannahvozel.github.io/bozeman-snows/

## What it does

- Maps a handful of NRCS SNOTEL stations near Bozeman on a USGS terrain base map
- Flags the station with the deepest snow depth on the most recent day of data (generally 1 day lag given uses daily readings)
- Click any station to see current snow depth, snow water equivalent (SWE), average temperature, recent precipitation (as rain and melted snow...not a snow depth), and a snow depth chart for the current water year (since October 1)

## How it works

The site has two parts:

1. **Data fetch (Python).** A script pulls daily readings from the [NRCS AWDB REST API](https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html) using [`snotelpy`](https://pypi.org/project/snotelpy/), then writes two files to `powderwatch/latest/`:
   - `snotel.json`: one record per station per day for the current water year
   - `stations.geojson`: station locations and metadata for the map
2. **Front end (static HTML/CSS/JS).** The page loads those two files and renders them with [Leaflet](https://leafletjs.com/) (map) and [Plotly](https://plotly.com/javascript/) (chart). There is no server; everything is hosted on GitHub Pages.

## Project structure

```
.
├── index.html                  # Page layout
├── assets/
│   ├── style.css               # Styles
│   └── app.js                  # Map, deepest-snow card, station charts
├── config/
│   └── station_config.py       # Station triplets, elements, duration
└── powderwatch/
    ├── awdb.py       # Pulls SNOTEL data from AWDB
    └── latest/
        ├── snotel.json
        └── stations.geojson
```

## Running it locally (requirements live in the .toml, project initialized with uv)

**1. Fetch the data**

```bash
pip install snotelpy xarray pandas geopandas
python powderwatch/awdb.py
```

**2. Serve the site**

The page loads JSON with `fetch()`, so opening `index.html` directly won't work. Start a local server from the repo root instead:

```bash
python -m http.server
```

Then open http://localhost:8000.

## Adding or changing stations

Edit `TRIPLETS` in `config/station_config.py`. Station triplets use the format `"929:MT:SNOTEL"` (station ID, state, network). You can look up station IDs on the [NRCS SNOTEL map](https://www.nrcs.usda.gov/wps/portal/wcc/home/). Then re-run the fetch script.

## Data and credits

- **Snow data:** USDA NRCS SNOTEL network via the AWDB REST API. Readings are provisional and may be revised.
- **Base maps:** USGS The National Map (Shaded Relief and Topo).
- **Fonts:** [Iceland](https://fonts.google.com/specimen/Iceland) and [Barlow](https://fonts.google.com/specimen/Barlow) via Google Fonts.

## Disclaimer

This is a snow depth general reference tool, not an avalanche forecast. Each station reflects conditions at a single point. 
Therefore, readings may not reflect the status of nearby terrain. This is meant to be used as a simple, general-reference depth-check resource; not a recommendation. Backcountry travel is inherently dangerous. Readings are provisional and can be revised; data may be missing.
Before heading into the backcountry, check the [Gallatin National Forest Avalanche Center](https://www.mtavalanche.com).