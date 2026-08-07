"""
Ripple -- Sea Level Rise data cleaning pipeline
-------------------------------------------------
One-time, offline script. Not run in the browser (see README.md -> stack).
Sibling to clean_data.py and clean_drought_data.py.

Source
------
Australian Bureau of Meteorology, Pacific Sea Level Monitoring Project
(SEAFRAME tide gauge network): https://www.bom.gov.au/oceanography/projects/spslcmp/
Each station's "Monthly sea levels for <COUNTRY>" page is robots-
blocked from automated fetching, so -- same manual-export pattern as
clean_data.py's CSVs -- these are saved by hand (Ctrl+S, "Webpage,
HTML only") into data-pipeline/raw/ as
`Monthly_sea_levels_for_<COUNTRY>.html`, one per station.

IMPORTANT -- why this script reports ANOMALIES, not raw metres
-----------------------------------------------------------------
Each SEAFRAME station's "Mean"/"Minimum"/"Maximum" readings are
relative to that station's OWN local tide gauge benchmark, not a
shared regional or global datum. Tuvalu's published mean (~2.0m) and
Fiji's (~1.3m) are not telling you Tuvalu's ocean sits higher than
Fiji's -- they're just different arbitrary zero-points. Presenting the
raw metre values side by side would be a real, easy-to-make honesty
mistake (see README.md -> "Honest about what's real"), not the kind of
gap this project's "no invented composite" rule is meant to guard
against -- it's the same category of error the rule exists to prevent.

The fix is standard practice in climate reporting, not something
invented for this site: express each station's series as an ANOMALY
relative to that station's own full-record mean (the same idea behind
every global temperature-anomaly chart). Centering at zero is what
makes the resulting numbers safe to compare across stations -- what's
being compared is how far each station has moved from its OWN
baseline, not whose absolute number is bigger.

What this script does
----------------------
For each station:
  1. Parse every monthly row (month, year, gaps, good, min, max, mean,
     st.devn) out of the fixed table markup BOM's page generator uses.
  2. Drop months where fewer than half the expected 6-minute readings
     are present (Good / (Good+Gaps) < 0.5) -- a partially-recorded
     month shouldn't count the same as a complete one.
  3. Drop calendar years with fewer than 9 of 12 months surviving that
     filter -- mainly the first and most recent partial years (e.g. a
     station whose record starts in October only has 3 months in its
     first year; the most recent year is often mid-year at export
     time), so a partial year doesn't get averaged as if it were a
     full one.
  4. Average the surviving months to one mean-sea-level-in-metres
     figure per year, then subtract that station's own all-years
     average to get the anomaly.
  5. Fit a straight line (ordinary least squares) through the
     station's own annual means vs. year to get a trend in mm/year --
     the standard way a linear sea-level trend is computed and
     reported, not a new metric invented for this site. Reported in
     millimetres because a single-digit mm/year is the unit these
     trends are conventionally discussed in; the underlying data is
     still in metres throughout.

Usage
-----
    python clean_sea_level_data.py

Cleaned JSON lands in ../public/data/, ready for
src/hooks/useSeaLevelData.js to fetch.
"""

import json
import re
from pathlib import Path
from typing import Optional

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

# file-name suffix -> nation name as SeaLevelRisePage.jsx's map spells it.
STATIONS = {
    "COOK_ISLANDS": "Cook Islands",
    "FIJI": "Fiji",
    "KIRIBATI": "Kiribati",
    "MARSHALL_ISLANDS": "Marshall Islands",
    "TONGA": "Tonga",
    "TUVALU": "Tuvalu",
}

# Nation display order, matching SeaLevelRisePage.jsx's NATIONS array --
# used only to keep the JSON's row order stable/readable, not for any
# computation.
NATION_ORDER = ["Tuvalu", "Kiribati", "Marshall Islands", "Tonga", "Fiji", "Cook Islands"]

MIN_GOOD_FRACTION = 0.5  # a month needs at least half its readings to count
MIN_MONTHS_PER_YEAR = 9  # a year needs at least 3/4 of its months to count
MIN_YEARS_FOR_TREND = 15  # minimum years of annual data before trusting a trend line

ROW_RE = re.compile(
    r'<tr align="center">\s*'
    r"<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>\s*(\d+)</td>\s*<td>\s*(\d+)</td>\s*"
    r"<td>([-\d.]+)</td>\s*<td>([-\d.]+)</td>\s*<td>([-\d.]+)</td>\s*<td>([-\d.]+)</td>\s*</tr>",
    re.S,
)


def parse_station(html_path: Path) -> pd.DataFrame:
    html = html_path.read_text(encoding="utf-8", errors="replace")
    matches = ROW_RE.findall(html)
    if not matches:
        raise ValueError(
            f"No monthly rows matched in {html_path.name} -- BOM's table markup may have "
            "changed; check the ROW_RE pattern against a fresh save of the page."
        )
    df = pd.DataFrame(
        matches, columns=["month", "year", "gaps", "good", "minimum", "maximum", "mean", "stdevn"]
    )
    for col in df.columns:
        df[col] = pd.to_numeric(df[col])
    return df


def annual_series(monthly: pd.DataFrame) -> pd.DataFrame:
    good_fraction = monthly["good"] / (monthly["good"] + monthly["gaps"])
    reliable = monthly[good_fraction >= MIN_GOOD_FRACTION]

    by_year = reliable.groupby("year").agg(mean_sea_level_m=("mean", "mean"), months=("mean", "count"))
    complete_years = by_year[by_year["months"] >= MIN_MONTHS_PER_YEAR].copy()
    return complete_years


def linear_trend_mm_per_year(annual: pd.DataFrame) -> Optional[float]:
    if len(annual) < MIN_YEARS_FOR_TREND:
        return None
    years = annual.index.to_numpy(dtype=float)
    values_m = annual["mean_sea_level_m"].to_numpy(dtype=float)
    # Ordinary least squares slope: cov(x,y) / var(x). Equivalent to
    # np.polyfit(years, values_m, 1)[0], written out longhand so this
    # script doesn't need a numpy import just for one line.
    x_mean, y_mean = years.mean(), values_m.mean()
    slope_m_per_year = ((years - x_mean) * (values_m - y_mean)).sum() / ((years - x_mean) ** 2).sum()
    return slope_m_per_year * 1000  # metres/year -> mm/year


def clean() -> None:
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
            f"{nation}: {len(monthly)} monthly readings parsed, {len(annual)} complete years "
            f"({annual.index.min()}-{annual.index.max()}), baseline {baseline:.3f}m, "
            f"trend {f'{trend:+.2f} mm/yr' if trend is not None else 'not enough years'}"
        )

        for year, row in annual.iterrows():
            anomaly_rows.append(
                {
                    "nation": nation,
                    "year": int(year),
                    "sea_level_anomaly_m": round(float(row["mean_sea_level_m"] - baseline), 4),
                }
            )
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
