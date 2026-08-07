"""
Convert BOM Pacific Sea Level Monitoring Project HTML exports into the
annual sea level JSON files used by the frontend.

Each station's raw mean is relative to its own local benchmark, not a
shared datum, so this outputs each year as an anomaly relative to that
station's own long-term average, plus a separate per-station trend in
mm/year -- both are safe to compare across stations; raw metres are not.

Usage:
    python clean_sea_level_data.py

Place one Monthly_sea_levels_for_<STATION>.html per station in
data-pipeline/raw/. Cleaned JSON files are written to ../public/data/.
"""

import json
import re
from pathlib import Path
from typing import Optional

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

# File-name suffix -> nation name as SeaLevelRisePage.jsx spells it.
STATIONS = {
    "COOK_ISLANDS": "Cook Islands",
    "FIJI": "Fiji",
    "KIRIBATI": "Kiribati",
    "MARSHALL_ISLANDS": "Marshall Islands",
    "TONGA": "Tonga",
    "TUVALU": "Tuvalu",
}

# Output row order, matching SeaLevelRisePage.jsx.
NATION_ORDER = [
    "Tuvalu",
    "Kiribati",
    "Marshall Islands",
    "Tonga",
    "Fiji",
    "Cook Islands",
]

MIN_GOOD_FRACTION = 0.5  # a month needs at least half its readings to count
MIN_MONTHS_PER_YEAR = 9  # a year needs at least 9 of 12 months to count
MIN_YEARS_FOR_TREND = 15  # minimum years before a trend is reported at all

ROW_RE = re.compile(
    r'<tr align="center">\s*'
    r"<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>\s*(\d+)</td>\s*<td>\s*(\d+)</td>\s*"
    r"<td>([-\d.]+)</td>\s*<td>([-\d.]+)</td>\s*<td>([-\d.]+)</td>\s*<td>([-\d.]+)</td>\s*</tr>",
    re.S,
)


def parse_station(html_path: Path) -> pd.DataFrame:
    """Parse monthly rows out of one station's HTML export."""

    html = html_path.read_text(encoding="utf-8", errors="replace")
    matches = ROW_RE.findall(html)

    if not matches:
        raise ValueError(f"No monthly rows matched in {html_path.name}.")

    df = pd.DataFrame(
        matches,
        columns=["month", "year", "gaps", "good", "minimum", "maximum", "mean", "stdevn"],
    )

    for col in df.columns:
        df[col] = pd.to_numeric(df[col])

    return df


def annual_series(monthly: pd.DataFrame) -> pd.DataFrame:
    """Aggregate monthly readings into a quality-filtered annual mean."""

    good_fraction = monthly["good"] / (monthly["good"] + monthly["gaps"])
    reliable = monthly[good_fraction >= MIN_GOOD_FRACTION]

    by_year = reliable.groupby("year").agg(
        mean_sea_level_m=("mean", "mean"), months=("mean", "count")
    )

    return by_year[by_year["months"] >= MIN_MONTHS_PER_YEAR].copy()


def linear_trend_mm_per_year(annual: pd.DataFrame) -> Optional[float]:
    """Fit an OLS trend line through annual means, in mm/year."""

    if len(annual) < MIN_YEARS_FOR_TREND:
        return None

    years = annual.index.to_numpy(dtype=float)
    values_m = annual["mean_sea_level_m"].to_numpy(dtype=float)

    x_mean, y_mean = years.mean(), values_m.mean()
    slope_m_per_year = ((years - x_mean) * (values_m - y_mean)).sum() / ((years - x_mean) ** 2).sum()

    return slope_m_per_year * 1000


def clean() -> None:
    """Generate annual sea level anomaly and trend datasets."""

    anomaly_rows = []
    trend_rows = []

    for suffix, nation in STATIONS.items():
        html_path = RAW_DIR / f"Monthly_sea_levels_for_{suffix}.html"

        if not html_path.exists():
            print(f"Skipping {nation} -- {html_path.name} not found in {RAW_DIR}.")
            continue

        monthly = parse_station(html_path)
        annual = annual_series(monthly)
        baseline = annual["mean_sea_level_m"].mean()
        trend = linear_trend_mm_per_year(annual)

        print(
            f"{nation}: {len(monthly)} monthly readings, {len(annual)} complete years "
            f"({annual.index.min()}-{annual.index.max()}), baseline {baseline:.3f}m, "
            f"trend {f'{trend:+.2f} mm/yr' if trend is not None else 'not enough years'}"
        )

        for year, row in annual.iterrows():
            anomaly_rows.append({
                "nation": nation,
                "year": int(year),
                "sea_level_anomaly_m": round(float(row["mean_sea_level_m"] - baseline), 4),
            })

        if trend is not None:
            trend_rows.append({"nation": nation, "trend_mm_per_year": round(trend, 2)})

    anomaly_rows.sort(key=lambda r: (NATION_ORDER.index(r["nation"]), r["year"]))
    trend_rows.sort(key=lambda r: NATION_ORDER.index(r["nation"]))

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUT_DIR / "sea_level_anomaly.json", "w") as f:
        json.dump(anomaly_rows, f, indent=2)
    print(f"\nwrote sea_level_anomaly.json ({len(anomaly_rows)} rows total)")

    with open(OUT_DIR / "sea_level_trend.json", "w") as f:
        json.dump(trend_rows, f, indent=2)
    print(f"wrote sea_level_trend.json ({len(trend_rows)} rows total)")


if __name__ == "__main__":
    clean()
