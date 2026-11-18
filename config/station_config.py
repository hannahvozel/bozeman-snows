
# SW MT triplets to scrape data for
TRIPLETS = [
    "929:MT:SNTL",   # Sacajawea (Bridgers)
    "365:MT:SNTL",   # Brackett Creek (Bridgers, east side)
    "578:MT:SNTL",   # Lick Creek (lower Hyalite)
    "754:MT:SNTL",   # Shower Falls (upper Hyalite)
    "590:MT:SNTL",   # Lone Mountain (Big Sky / Beehive)
    "385:MT:SNTL",   # Carrot Basin (S. Madisons)
    "916:MT:SNTL",   # Albro Lake (Tobacco Roots, near Bell Lake)
    "603:MT:SNTL",   # Lower Twin (Tobacco Roots)
    "1322:MT:SNTL",  # Mill Creek (Paradise Valley, new in 2025)
    "635:MT:SNTL",   # Monument Peak
    "480:MT:SNTL",   # Fisher Creek (Cooke City)
    "862:MT:SNTL",   # White Mill (Cooke City)
    "670:MT:SNTL",   # Northeast Entrance (Cooke City)
]

# Common element codes to pull in 
ELEMENTS = [
    'WTEQ', # SWE
    'PREC', # Accumulated Precip
    'SNWD', # Snow Depth
    'TAVG', # Air Temp Avg
    'TMAX', # Air Temp Max
    'TMIN'  # Air Temp Min
 ]

# Desired Duration
DURATION = "DAILY" # Can also be DAILY, HOURLY, SEMIMONTHLY, MONTHLY, CALENDAR_YEAR, WATER_YEAR

# START DATE
START_DATE = "2025-10-01" # Best practice to start at beginning of a water year, but up to the user

# Hydrologic Unit Codes (TBD if needed)
HUC8S = [
    "10020005",  # Jefferson River (Albro Lake, via South Willow Creek)
    "10020007",  # Madison River (Lower Twin, via North Meadow Creek)
    "10020008",  # Gallatin River (Lick Creek, Shower Falls, Lone Mountain, Carrot Basin)
    "10070001",  # Yellowstone River headwaters (Northeast Entrance, via Soda Butte Creek / Lamar)
    "10070002",  # Upper Yellowstone River (Mill Creek; Monument Peak via the Boulder River)
    "10070003",  # Shields River, then the Yellowstone (Sacajawea, Brackett Creek)
    "10070006",  # Clarks Fork Yellowstone River (Fisher Creek, White Mill)
]

# Other potential items to add later
TIMING_CENTRAL_TENDENCIES = [
    'medianPeak', 'medianOnset', 'medianMeltout', 'averagePeak', 'averageOnset', 'averageMeltout'
    ]

VALUES = [
    'date', 'month', 'year', 'average', 'median', 'qcFlag', 'qaFlag'
    ]
