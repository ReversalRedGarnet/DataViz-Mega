"""
Ripple -- data cleaning pipeline
---------------------------------
One-time, offline script. Not run in the browser (see README.md -> stack).

Usage:
    1. Export each dataset below as CSV from https://stats.pacificdata.org/
       into data-pipeline/raw/, renamed exactly as the keys in DATASETS
       below. Download the UNFILTERED table -- this script filters by
       country, year, AND indicator itself.
    2. Run:  python clean_data.py
    3. Cleaned JSON lands in ../public/data/, ready for the frontend to
       fetch via src/utils/loadData.js

IMPORTANT: some raw exports from this portal are whole-dataflow dumps
containing MANY indicators bundled together -- e.g. crop_yield.csv,
power_generation.csv and tourist_arrivals.csv are literally the same
file (the full "Climate Change Indicators" dataflow), and
disaster_affected_persons.csv / disaster_economic_loss.csv are the same
"SDG 11" dataflow dump. That's normal for this portal, not a mistake --
this script filters each one down to the single indicator code it
actually needs.
"""

import json
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

# Locked scope -- see README.md -> "Scope (locked)"
NATIONS = ["Solomon Islands", "Vanuatu", "Fiji", "Tonga"]

NATION_CODES = {
    "Solomon Islands": ["SB", "SLB"],
    "Vanuatu": ["VU", "VUT"],
    "Fiji": ["FJ", "FJI"],
    "Tonga": ["TO", "TON"],
}

# A few years of baseline before Cyclone Harold (April 2020) and a few of
# recovery after. Widen later by just changing these two numbers.
YEAR_MIN = 2016
YEAR_MAX = 2024

# raw filename in data-pipeline/raw/ -> config for that file.
# indicator_col/indicator_code select the ONE indicator this dataset
# needs out of what may be a shared, multi-indicator dataflow dump.
# field_name must match src/utils/metrics.js.
DATASETS = {
    "disaster_affected_persons.csv": {
        "json_name": "disaster_affected_persons.json",
        "field_name": "affected_persons",
        "indicator_col": "INDICATOR",
        "indicator_code": "VC_DSR_AFFCT",
    },
    "disaster_economic_loss.csv": {
        "json_name": "disaster_economic_loss.json",
        "field_name": "economic_loss_usd",
        "indicator_col": "INDICATOR",
        "indicator_code": "VC_DSR_AALT",
        # a handful of rows are reported in USD_MILLIONS instead of USD --
        # excluded rather than guess-converted, since it's only ~4 rows
        # region-wide and not worth the risk of a silent unit error.
        "unit_col": "UNIT_MEASURE",
        "unit_value": "USD",
    },
    "crop_yield.csv": {
        "json_name": "crop_yield.json",
        "field_name": "crop_yield_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "CROP_YIELD",
    },
    "tourist_arrivals.csv": {
        "json_name": "tourist_arrivals.json",
        "field_name": "tourist_arrivals_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "TRSM_ARR",
    },
    "power_generation.csv": {
        "json_name": "power_generation.json",
        "field_name": "power_generation_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "POWER_GEN",
    },
}

COUNTRY_COL_CANDIDATES = ["GEO_PICT", "REF_AREA", "Pacific Island Countries and territories", "Country"]
TIME_COL_CANDIDATES = ["TIME_PERIOD", "Year"]
VALUE_COL_CANDIDATES = ["OBS_VALUE", "Value"]


def _find_col(df, candidates, label):
    for c in candidates:
        if c in df.columns:
            return c
    raise KeyError(
        f"Couldn't find a {label} column. Columns in this file are: "
        f"{list(df.columns)} -- add the real name to the candidates list at the top of this file."
    )


def _matches_nation(raw_value, nation) -> bool:
    raw_value = str(raw_value).strip()
    if raw_value.lower() == nation.lower():
        return True
    return raw_value.upper() in NATION_CODES.get(nation, [])


def clean_one(csv_name: str, config: dict) -> None:
    df = pd.read_csv(RAW_DIR / csv_name)
    print(f"\n{csv_name}: columns found -> {list(df.columns)}")

    indicator_col, indicator_code = config["indicator_col"], config["indicator_code"]
    if indicator_col not in df.columns:
        raise KeyError(f"Expected an '{indicator_col}' column to select {indicator_code} -- not found.")
    df = df[df[indicator_col] == indicator_code]
    print(f"  filtered to indicator {indicator_code}: {len(df)} rows")

    if "unit_col" in config:
        df = df[df[config["unit_col"]] == config["unit_value"]]
        print(f"  filtered to unit {config['unit_value']}: {len(df)} rows")

    country_col = _find_col(df, COUNTRY_COL_CANDIDATES, "country")
    time_col = _find_col(df, TIME_COL_CANDIDATES, "year")
    value_col = _find_col(df, VALUE_COL_CANDIDATES, "value")

    rows = []
    for nation in NATIONS:
        mask = df[country_col].apply(lambda v: _matches_nation(v, nation))
        matched = df[mask]
        in_range = matched[matched[time_col].astype(int).between(YEAR_MIN, YEAR_MAX)]
        print(f"  {nation}: {len(matched)} rows matched, {len(in_range)} within {YEAR_MIN}-{YEAR_MAX}")
        for _, r in in_range.iterrows():
            rows.append({"nation": nation, "year": int(r[time_col]), config["field_name"]: r[value_col]})

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT_DIR / config["json_name"], "w") as f:
        json.dump(rows, f, indent=2)
    print(f"  wrote {config['json_name']} ({len(rows)} rows total)")


def main() -> None:
    any_found, problems = False, []
    for csv_name, config in DATASETS.items():
        path = RAW_DIR / csv_name
        if not path.exists():
            print(f"Skipping {csv_name} -- not found in {RAW_DIR}.")
            continue
        any_found = True
        try:
            clean_one(csv_name, config)
        except KeyError as e:
            print(f"  PROBLEM in {csv_name}: {e}")
            problems.append(csv_name)

    if not any_found:
        print("\nNo raw CSVs found yet.")
    elif problems:
        print(f"\n{len(problems)} file(s) need attention: {problems}")
    else:
        print("\nAll datasets cleaned.")


if __name__ == "__main__":
    main()
