"""
Ripple -- El Nino & Drought data cleaning pipeline
----------------------------------------------------
One-time, offline script. Not run in the browser (see README.md -> stack).
Sibling to clean_data.py (the original Cyclone Harold pipeline) -- kept
as a separate script rather than folded into that one because the
source, shape, and time horizon are all different: this pulls a single
region-wide CSV (not five separate per-indicator exports) and produces
a 64-year annual series (not a handful of years around one event).

Source
------
World Bank Pacific Observatory climate database:
  https://worldbank.github.io/pacific-observatory/climate/climate_db.html
Underlying file is the region's admin-1 (state/province) level monthly
climate indices, CC BY 4.0. Download it as
`pic_adm1_climate_indices_10-11-2022.csv` into data-pipeline/raw/ --
same manual-export step clean_data.py already asks for with its own
sources.

What this script does
----------------------
The raw file is admin-1 (province/state) level, not one row per
country -- e.g. Fiji is four divisions, Papua New Guinea is 22
provinces. This script averages each indicator UNweighted across a
country's own admin-1 regions to get one number per country per year
(the same kind of plain, undisguised aggregation the original
clean_data.py already does implicitly -- combining raw counts into one
per-country total -- just here across geography instead of across
records).

The two indicators kept are SPI-12 and SPEI-12: the 12-month
Standardized Precipitation Index and Standardized Precipitation-
Evapotranspiration Index, both already-standardized drought indices
computed by the World Bank, not anything invented here (see README.md
-> "Ground rules for this expansion" -> "No invented composite
score"). Positive = wetter than the local 1958-2021 baseline, negative
= drier. -1 or below is conventionally "moderate drought"; -2 or below
is "extreme drought".

Only December's SPI-12/SPEI-12 value is kept per country-year, not an
average across all 12 months. A 12-month index is already a trailing
12-month window -- December's reading is the one that covers the
complete calendar year (Jan-Dec); averaging all 12 months' 12-month-
trailing values would overlap-count the same underlying months many
times over and blur the year-to-year signal this page exists to show.

Usage
-----
    python clean_drought_data.py

Cleaned JSON lands in ../public/data/, ready for
src/hooks/useDroughtData.js to fetch.
"""

import json
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

RAW_CSV = "pic_adm1_climate_indices_10-11-2022.csv"

# Locked to the nation set ElNinoDroughtPage.jsx's map actually shows --
# see README.md -> "Nation set varies by hazard". Names must match
# ADM0_NAME exactly as the source CSV spells them.
NATIONS = [
    "Kiribati",
    "Papua New Guinea",
    "Marshall Islands",
    "Federated States of Micronesia",
    "Fiji",
]

# The source covers 1958-2021 -- unlike clean_data.py's YEAR_MIN/MAX
# (a deliberate few-year window around one event), there's no
# curation happening here: this *is* the full record the source
# provides, kept in full because the whole point of this page is a
# multi-decade recurring pattern, not a single before/after window.
YEAR_MIN = 1958
YEAR_MAX = 2021

# indicator field in the source -> (json filename, field name in the
# cleaned rows, human label used only in this script's own logging).
# field names match what src/utils/droughtMetrics.js expects.
INDICATORS = {
    "spi12_median": {"json_name": "spi12.json", "field_name": "spi12", "label": "SPI-12"},
    "spei12_median": {"json_name": "spei12.json", "field_name": "spei12", "label": "SPEI-12"},
}


def clean() -> None:
    path = RAW_DIR / RAW_CSV
    if not path.exists():
        print(f"Skipping -- {RAW_CSV} not found in {RAW_DIR}.")
        return

    # low_memory=False: the source mixes types in a couple of columns
    # this script doesn't use (an 'index' column and ADM1_PCODE), and
    # the file also has one trailing junk row (a stray
    # "System.IO.MemoryStream" line, apparently an artifact of however
    # the portal generated the export) -- dropped by the ADM0_NAME/year
    # filters below rather than special-cased, since it fails both.
    df = pd.read_csv(path, low_memory=False)
    print(f"{RAW_CSV}: {len(df)} rows, columns include {list(df.columns[:8])}...")

    df = df[df["ADM0_NAME"].notna()].copy()
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df["month"] = pd.to_numeric(df["month"], errors="coerce")
    df = df[df["year"].notna() & df["month"].notna()]
    df["year"] = df["year"].astype(int)
    df["month"] = df["month"].astype(int)

    december = df[df["month"] == 12]

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for source_col, config in INDICATORS.items():
        rows = []
        for nation in NATIONS:
            sub = december[(december["ADM0_NAME"] == nation) & december[source_col].notna()]
            sub = sub[sub["year"].between(YEAR_MIN, YEAR_MAX)]
            regions = sorted(sub["ADM1_NAME"].dropna().unique())
            # Unweighted mean across this country's own admin-1
            # regions -- see module docstring.
            by_year = sub.groupby("year")[source_col].mean()
            print(
                f"  {config['label']} / {nation}: {len(regions)} admin-1 regions, "
                f"{len(by_year)} years {by_year.index.min() if len(by_year) else '-'}"
                f"-{by_year.index.max() if len(by_year) else '-'}"
            )
            for year, value in by_year.items():
                rows.append({"nation": nation, "year": int(year), config["field_name"]: round(float(value), 4)})

        rows.sort(key=lambda r: (NATIONS.index(r["nation"]), r["year"]))
        with open(OUT_DIR / config["json_name"], "w") as f:
            json.dump(rows, f, indent=2)
        print(f"  wrote {config['json_name']} ({len(rows)} rows total)\n")


if __name__ == "__main__":
    clean()
