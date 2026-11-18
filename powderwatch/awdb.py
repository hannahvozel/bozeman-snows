"""Fetch data from the AWDB Rest API via snotelpy

Docs: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import os
import xarray as xr
import snotelpy as sp
import pandas as pd
import geopandas as gpd
import json
import xarray as xr
from config.station_config import TRIPLETS, ELEMENTS, DURATION, HUC8S
from datetime import date, datetime, timezone

# Get start of this current water year
def get_this_water_year(today=None):
    today = today or date.today()
    year = today.year if today.month >= 10 else today.year - 1
    return date(year, 10, 1).isoformat()


# What do we want?:
# For a list of station triplets, in the format: "929:MT:SNOTEL"

# Get:
# XARRAY for desired stations and elements
def fetch_my_snotels():
    ds = sp.fetch_snotel(
    stations=TRIPLETS,
    elements=ELEMENTS,
    duration=DURATION,
    start_date=get_this_water_year(),
    end_date=date.today().isoformat()
    )
    return ds

# GeoDF of our stations
def get_my_stations():
    gdf = sp.get_stations(
        station_triplets=TRIPLETS,
        elements=ELEMENTS,
        returnType="gpd"
    )
    return gdf

# For converting the xarray to dict --> json
def ds_to_json(ds, path):
    """Save an xarray Dataset as JSON: one record per station per day."""
    ds.to_dataframe().reset_index().to_json(path, orient="records", date_format="iso")

# Save to the latest folder
def write_latest(ds, gdf=None):
    Path("latest").mkdir(exist_ok=True)
    # Handle the core metrics
    ds_to_json(ds, "latest/snotel.json")
    # Save stations for mapping
    if gdf is not None:
        gdf.to_file("latest/stations.geojson", driver="GeoJSON")

if __name__ == "__main__":
    ds = fetch_my_snotels()
    gdf = get_my_stations()
    write_latest(ds, gdf)
    print(f"Wrote {ds.sizes['time']} days for {ds.sizes['station']} stations to latest/")

    # for t in TRIPLETS:
    #     for el in ELEMENTS:
    #         try:
    #             sp.fetch_snotel(
    #                 stations=[t],
    #                 elements=[el],
    #                 duration=DURATION,
    #                 start_date=get_this_water_year(),
    #                 end_date=date.today().isoformat(),
    #             )
    #         except KeyError:
    #             print("FAILED:", t, el)