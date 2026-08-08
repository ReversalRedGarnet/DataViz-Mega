// Filenames match clean_sea_level_exposure_data.py's output.
//
// How many people live within reach of sea level, not how fast it's rising. A
// snapshot rather than a trend: the SPC estimates hold flat for years between
// periodic revisions, so a year-by-year line would present a revised model as a
// continuously measured process.
export const METRICS = [
  {
    key: 'pct_within_10m',
    file: 'sea_level_exposure_10m.json',
    field: 'pct_within_10m',
    label: 'Population within 10m of sea level',
    format: (v) => `${v.toFixed(0)}%`,
  },
  {
    key: 'pct_within_20m',
    file: 'sea_level_exposure_20m.json',
    field: 'pct_within_20m',
    label: 'Population within 20m of sea level',
    format: (v) => `${v.toFixed(0)}%`,
  },
]

// Latest year with full coverage across all 6 nations.
export const REFERENCE_YEAR = 2024

// Per-nation commentary (an unusually large revision, say) rather than per-year
// data points, so its own file rather than a metric.
export const NOTES_FILE = 'sea_level_exposure_notes.json'
