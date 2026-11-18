
import pytest
import snotelpy as sp
import xarray as xr
import geopandas as gpds

STATIONS = ["602:CO:SNTL", "913:CO:SNTL"]


def test_fetch_snotel():
    #Fetch daily SWE and precipitation for two Colorado stations (2020 water year)
    ds = sp.fetch_snotel(
    stations=STATIONS,
    elements=["WTEQ", "PREC"],
    duration="DAILY",
    start_date="2019-10-01",
    end_date="2020-09-30"
    )
    assert isinstance(ds, xr.Dataset)
    stations = ds["station"].values
    assert len(set(stations)) == 2
    assert set(stations) == set(STATIONS) 
    days = ds["time"].dt.floor("D").to_index().unique()
    assert len(days) > 20

def test_get_stations():
    #Make sure geopandas is coming in correctly
    gdf = sp.get_stations(
    station_triplets=STATIONS,
    elements=["WTEQ"],
    returnType="gpd"
    )
    assert isinstance(gdf, gpds.GeoDataFrame)

