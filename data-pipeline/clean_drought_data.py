"""
Convert the World Bank Pacific Observatory climate dataset into the
annual drought JSON files used by the frontend.

Unlike clean_data.py, this script processes a single regional climate
dataset covering 1958-2021 and outputs annual SPI-12 and SPEI-12
timeseries.

Usage:
    python clean_drought_data.py

Place the source CSV (pic_adm1_climate_indices_10-11-2022.csv) in
data-pipeline/raw/. Cleaned JSON files are written to
../public/data/.
"""

import json
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

RAW_CSV = "pic_adm1_climate_indices_10-11-2022.csv"

# Nations included in the drought visualisation.
NATIONS = [
    "Kiribati",
    "Papua New Guinea",
    "Marshall Islands",
    "Federated States of Micronesia",
    "Fiji",
]

# Full period available from the source dataset.
YEAR_MIN = 1958
YEAR_MAX = 2021

# Source column -> output configuration.
INDICATORS = {
    "spi12_median": {
        "json_name": "spi12.json",
        "field_name": "spi12",
        "label": "SPI-12",
    },
    "spei12_median": {
        "json_name": "spei12.json",
        "field_name": "spei12",
        "label": "SPEI-12",
    },
}


def clean() -> None:
    """Generate annual SPI-12 and SPEI-12 datasets."""

    path = RAW_DIR / RAW_CSV

    if not path.exists():
        print(f"Skipping -- {RAW_CSV} not found in {RAW_DIR}.")
        return

    # Ignore mixed-type warnings from unused columns.
    df = pd.read_csv(path, low_memory=False)

    print(
        f"{RAW_CSV}: {len(df)} rows, "
        f"columns include {list(df.columns[:8])}..."
    )

    df = df[df["ADM0_NAME"].notna()].copy()

    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df["month"] = pd.to_numeric(df["month"], errors="coerce")

    df = df[df["year"].notna() & df["month"].notna()]

    df["year"] = df["year"].astype(int)
    df["month"] = df["month"].astype(int)

    # Use December values to represent each calendar year.
    december = df[df["month"] == 12]

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for source_col, config in INDICATORS.items():
        rows = []

        for nation in NATIONS:
            sub = december[
                (december["ADM0_NAME"] == nation)
                & december[source_col].notna()
            ]

            sub = sub[sub["year"].between(YEAR_MIN, YEAR_MAX)]

            regions = sorted(sub["ADM1_NAME"].dropna().unique())

            # Average across the country's admin-1 regions.
            by_year = sub.groupby("year")[source_col].mean()

            print(
                f"  {config['label']} / {nation}: "
                f"{len(regions)} admin-1 regions, "
                f"{len(by_year)} years "
                f"{by_year.index.min() if len(by_year) else '-'}"
                f"-{by_year.index.max() if len(by_year) else '-'}"
            )

            for year, value in by_year.items():
                rows.append({
                    "nation": nation,
                    "year": int(year),
                    config["field_name"]: round(float(value), 4),
                })

        rows.sort(key=lambda r: (NATIONS.index(r["nation"]), r["year"]))

        with open(OUT_DIR / config["json_name"], "w") as f:
            json.dump(rows, f, indent=2)

        print(
            f"  wrote {config['json_name']} "
            f"({len(rows)} rows total)\n"
        )


if __name__ == "__main__":
    clean()
