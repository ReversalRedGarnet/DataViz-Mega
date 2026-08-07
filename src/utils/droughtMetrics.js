// Shared metric definitions for the El Nino & Drought page -- same
// role metrics.js plays for Cyclones, kept as its own file rather than
// added to metrics.js because the two hazards don't share a time
// horizon or an "event year" concept (see REFERENCE_YEAR below).
// Filenames match data-pipeline/clean_drought_data.py's INDICATORS
// dict.
//
// SPI-12 and SPEI-12 (Standardized Precipitation Index / Standardized
// Precipitation-Evapotranspiration Index, 12-month) are the World
// Bank Pacific Observatory's own published drought indices -- not
// blended or invented here, see README.md -> "No invented composite
// score". Positive = wetter than that area's own 1958-2021 baseline,
// negative = drier; -1 or below is conventionally read as "moderate
// drought", -2 or below as "extreme drought". SPEI additionally
// accounts for temperature-driven evapotranspiration, so it tends to
// respond a little more sharply than SPI in the same dry spell.
export const METRICS = [
  {
    key: 'spi12',
    file: 'spi12.json',
    field: 'spi12',
    label: 'SPI-12 (12-month Standardized Precipitation Index)',
    chartType: 'line',
    format: (v) => v.toFixed(2),
  },
  {
    key: 'spei12',
    file: 'spei12.json',
    field: 'spei12',
    label: 'SPEI-12 (12-month Standardized Precipitation-Evapotranspiration Index)',
    chartType: 'line',
    format: (v) => v.toFixed(2),
  },
]

// A 12-month index is a trailing window, so a single point already
// stands in for a full year -- unlike Cyclone Harold, there's no
// single "event" here. REFERENCE_YEAR anchors the regional snapshot
// (DroughtSnapshot.jsx) to one comparable moment instead: the 2015-16
// El Nino, among the strongest on record and already named in this
// page's own copy (Marshall Islands and FSM both declared drought
// emergencies during it). Read December of that year, the same way
// the pipeline reads December for every year -- see
// clean_drought_data.py.
export const REFERENCE_YEAR = 2016

// Conventional drought severity threshold (SPI/SPEI <= -1), used only
// to phrase the comparative note in DroughtTrends.jsx -- not a new
// index, just naming an already-standard reading of the real one.
export const DROUGHT_THRESHOLD = -1
