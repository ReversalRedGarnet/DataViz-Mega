// Filenames match clean_sea_level_data.py's output.
//
// The time series is an ANOMALY, not a raw reading: each gauge's metres are
// relative to its own local benchmark, so raw values don't compare across
// stations. See clean_sea_level_data.py.
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

// One derived number per nation (mm/year via OLS), not a series.
export const TREND_METRIC = {
  file: 'sea_level_trend.json',
  field: 'trend_mm_per_year',
  label: 'Long-term trend (mm/year, each station\u2019s own full record)',
  format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} mm/yr`,
}
