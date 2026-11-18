"""Minimal client for the AWDB Rest API

Docs: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html
"""

import os
import xarray as xr
import snotelpy as sp
import pandas as pd
import geopandas as gpd
import json
import xarray as xr
from config.station_config import TRIPLETS, ELEMENTS, DURATION, START_DATE, HUC8S
from datetime import date


# What do we want?:
# For a list of station triplets, in the format: "929:MT:SNOTEL"

# Get:
# XARRAY for desired stations and elements
def fetch_my_snotels():
    ds = sp.fetch_snotel(
    stations=TRIPLETS,
    elements=ELEMENTS,
    duration=DURATION,
    start_date=START_DATE,
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
