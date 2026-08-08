"""
Convert SPC's Low Elevation Coastal Zone population dataset into the
population-exposure JSON used by the Sea Level Rise page.

Source: Pacific Community (SPC) Statistics for Development Division,
via Pacific Data Hub (SDMX export, DF_POP_LECZ v1.0). Population and
land elevation modelling -- not the tide-gauge data the rest of this
page uses, a different real dataset answering a different real
question: not how fast the ocean is rising, but how many people
already live within reach of it.

Only DF_POP_COAST (the sibling "coastal proximity" dataset) was left
out: its distance-band dimension (1/5/10km) isn't distinguishable in
the export actually available, so what its numbers represent can't be
stated with confidence -- not used, per this project's own rule
against showing anything that can't be precisely sourced.

Usage:
    python clean_sea_level_exposure_data.py

Place the SPC_DF_POP_LECZ_*.csv export in data-pipeline/raw/. Cleaned
JSON is written to ../public/data/.
"""

import json
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

NATIONS = {
    "TV": "Tuvalu",
    "KI": "Kiribati",
    "MH": "Marshall Islands",
    "TO": "Tonga",
    "FJ": "Fiji",
    "CK": "Cook Islands",
}

NATION_ORDER = ["Tuvalu", "Kiribati", "Marshall Islands", "Tonga", "Fiji", "Cook Islands"]

# Two of the dataset's three elevation bands -- 0-5m dropped since it's
# a strict subset of 0-10m and doesn't add a materially different
# comparison for this page's purposes.
BANDS = {"10M": "pct_within_10m", "20M": "pct_within_20m"}

# SPC's estimates are flat year over year until a periodic revision --
# every nation in this dataset holds one constant value for 2010-2021,
# then most shift by a few points for 2022-2024 (a new census or
# updated elevation model, most likely). A revision past this many
# percentage points is far outside what every other nation in the same
# revision shows, and gets surfaced as a note rather than presented at
# face value alongside the rest.
REVISION_FLAG_THRESHOLD = 10
REVISION_YEARS = (2021, 2022)


def find_csv() -> Path:
    matches = list(RAW_DIR.glob("*DF_POP_LECZ*.csv"))
    if not matches:
        raise FileNotFoundError(f"No DF_POP_LECZ CSV found in {RAW_DIR}.")
    return matches[0]


def clean() -> None:
    csv_path = find_csv()
    if not csv_path.exists():
        print(f"Skipping -- no DF_POP_LECZ CSV found in {RAW_DIR}.")
        return

    df = pd.read_csv(csv_path)
    df = df[df["GEO_PICT"].isin(NATIONS) & (df["INDICATOR"] == "LECZPOPRF")].copy()
    df["nation"] = df["GEO_PICT"].map(NATIONS)

    rows_by_band = {band: [] for band in BANDS}
    notes = []

    for code, nation in NATIONS.items():
        for band, field in BANDS.items():
            series = df[(df["GEO_PICT"] == code) & (df["ELEVATION"] == band)].sort_values("TIME_PERIOD")

            for _, row in series.iterrows():
                rows_by_band[band].append(
                    {"nation": nation, "year": int(row["TIME_PERIOD"]), field: round(float(row["OBS_VALUE"]), 1)}
                )

            before_year, after_year = REVISION_YEARS
            before = series.loc[series["TIME_PERIOD"] == before_year, "OBS_VALUE"]
            after = series.loc[series["TIME_PERIOD"] == after_year, "OBS_VALUE"]
            if not before.empty and not after.empty:
                delta = after.iloc[0] - before.iloc[0]
                if abs(delta) > REVISION_FLAG_THRESHOLD:
                    band_label = "10m" if band == "10M" else "20m"
                    notes.append(
                        {
                            "nation": nation,
                            "note": (
                                f"{nation}'s estimated population share within {band_label} of sea level moved "
                                f"from {before.iloc[0]:.0f}% to {after.iloc[0]:.0f}% between {before_year} and "
                                f"{after_year} in SPC's own published data -- a far larger revision than any other "
                                f"nation in this set shows across that same update. Shown as published, worth "
                                f"treating with more caution than the rest."
                            ),
                        }
                    )

    print(f"{csv_path.name}: {len(df)} rows for the 6 sea-level nations")
    for code, nation in NATIONS.items():
        print(f"  {nation}: {sum(1 for r in rows_by_band['10M'] if r['nation'] == nation)} years, 10m band")
    if notes:
        print(f"  {len(notes)} data-quality note(s) flagged:")
        for n in notes:
            print(f"    - {n['nation']}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for band, field in BANDS.items():
        rows = rows_by_band[band]
        rows.sort(key=lambda r: (NATION_ORDER.index(r["nation"]), r["year"]))
        filename = f"sea_level_exposure_{field.split('_')[-1]}.json"
        with open(OUT_DIR / filename, "w") as f:
            json.dump(rows, f, indent=2)
        print(f"wrote {filename} ({len(rows)} rows)")

    with open(OUT_DIR / "sea_level_exposure_notes.json", "w") as f:
        json.dump(notes, f, indent=2)
    print(f"wrote sea_level_exposure_notes.json ({len(notes)} note(s))")


if __name__ == "__main__":
    clean()
