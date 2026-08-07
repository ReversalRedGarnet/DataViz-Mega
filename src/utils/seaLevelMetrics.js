// Metric definitions for the Sea Level Rise page. Filenames match
// clean_sea_level_data.py's output.
//
// The time-series metric is an ANOMALY, not a raw reading: each tide
// gauge's raw metres are relative to its own local benchmark, so raw
// values aren't comparable across stations -- see
// clean_sea_level_data.py for the full reasoning.
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

// A single derived number per nation (mm/year via OLS -- see
// clean_sea_level_data.py), not a year-by-year series, so it's kept
// separate from METRICS above.
export const TREND_METRIC = {
  file: 'sea_level_trend.json',
  field: 'trend_mm_per_year',
  label: 'Long-term trend (mm/year, each station\u2019s own full record)',
  format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} mm/yr`,
}
