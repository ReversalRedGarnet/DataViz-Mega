// Shared metric definitions for the Sea Level Rise page. Filenames
// match data-pipeline/clean_sea_level_data.py's output.
//
// The one time-series metric here is an ANOMALY, not a raw sea-level
// reading -- see the long comment at the top of
// clean_sea_level_data.py for why: each tide gauge station's raw
// metres are relative to its own local benchmark, so raw values from
// different stations aren't comparable to each other. Expressing each
// station's own record as metres above/below ITS OWN full-record
// average is what makes the numbers safe to compare across nations.
export const METRICS = [
  {
    key: 'sea_level_anomaly',
    file: 'sea_level_anomaly.json',
    field: 'sea_level_anomaly_m',
    label: 'Sea level, relative to each station\u2019s own long-term average',
    chartType: 'line',
    format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(3)} m`,
  },
]

// Trend is a single derived number per nation (millimetres/year, via
// ordinary least squares over that station's own annual means -- see
// clean_sea_level_data.py), not a year-by-year series, so it doesn't
// fit the METRICS shape above. Kept as its own small config so
// SeaLevelSnapshot.jsx has a format function to match, the same way
// every other metric on the site does.
export const TREND_METRIC = {
  file: 'sea_level_trend.json',
  field: 'trend_mm_per_year',
  label: 'Long-term trend (mm/year, each station\u2019s own full record)',
  format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} mm/yr`,
}
