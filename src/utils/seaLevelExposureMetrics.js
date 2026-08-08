// Metric definitions for the Sea Level Rise page's population-
// exposure section. Filenames match
// data-pipeline/clean_sea_level_exposure_data.py's output.
//
// Distinct from METRICS in seaLevelMetrics.js -- these describe how
// many people live within reach of sea level, not how fast the ocean
// itself is rising. A snapshot, not a trend: the underlying SPC
// estimates are flat for years at a stretch between periodic
// revisions (see the pipeline script), so a year-by-year line would
// misrepresent a periodically-revised model as a continuously
// measured process.
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

// Data-quality notes (e.g. an unusually large revision -- see the
// pipeline script) as their own file, not folded into METRICS above,
// since it's per-nation commentary rather than a per-year data point.
export const NOTES_FILE = 'sea_level_exposure_notes.json'
