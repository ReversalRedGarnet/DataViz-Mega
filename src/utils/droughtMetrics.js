// Metric definitions for the El Nino & Drought page. Filenames match
// data-pipeline/clean_drought_data.py's INDICATORS dict.
//
// SPI-12/SPEI-12 (World Bank Pacific Observatory drought indices).
// Positive = wetter than that area's own 1958-2021 baseline, negative
// = drier; -1 or below reads as moderate drought, -2 or below as
// extreme.
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

// Anchors DroughtSnapshot.jsx's regional comparison to one moment:
// December of the 2015-16 El Nino, among the strongest on record.
export const REFERENCE_YEAR = 2016

// Conventional drought threshold (SPI/SPEI <= -1), used to phrase the
// comparative note in DroughtTrends.jsx.
export const DROUGHT_THRESHOLD = -1
