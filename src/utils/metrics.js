// Cyclone Harold, April 2020 -- the shared "before/after" anchor used
// by ComparisonView and the comparative-insights bullets in
// RippleChain. Kept here rather than duplicated in each file.
export const EVENT_YEAR = 2020

// Shared metric definitions used by RippleChain and ComparisonView.
// Filenames match the DATASETS dict in data-pipeline/clean_data.py.
//
// chartType picks the D3 chart best suited to each metric's actual data
// shape (see RippleChain.jsx for the renderers):
//   'bar'  -- disaster-style metrics that only have a handful of
//             irregularly-spaced years on record (e.g. Fiji's economic
//             loss skips 2017). A line connects across that gap and
//             implies a trend that was never measured; a bar per year
//             on record doesn't.
//   'line' -- metrics reported every year for every country, where a
//             continuous trend is the real story.
//   'area' -- also continuous, but the *size* of the drop is the point
//             (tourist arrivals cratering after Harold/COVID) -- a
//             filled area reads that loss of volume more viscerally
//             than a bare line.
//
// format() turns a raw number into the string shown in chart tooltips
// and comparison cards, so a value never appears without its unit.
export const METRICS = [
  {
    key: 'affected_persons',
    file: 'disaster_affected_persons.json',
    field: 'affected_persons',
    label: 'People affected',
    chartType: 'bar',
    format: (v) => `${Math.round(v).toLocaleString()} people`,
  },
  {
    key: 'economic_loss',
    file: 'disaster_economic_loss.json',
    field: 'economic_loss_usd',
    label: 'Economic loss (US$)',
    chartType: 'bar',
    format: (v) => `US$${Math.round(v).toLocaleString()}`,
  },
  {
    key: 'crop_yield',
    file: 'crop_yield.json',
    field: 'crop_yield_index',
    label: 'Crop yield (kg/ha)',
    chartType: 'line',
    format: (v) => `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg/ha`,
  },
  {
    key: 'tourist_arrivals',
    file: 'tourist_arrivals.json',
    field: 'tourist_arrivals_index',
    label: 'Tourist arrivals',
    chartType: 'area',
    format: (v) => `${Math.round(v).toLocaleString()} visitors`,
  },
  {
    key: 'power_generation',
    file: 'power_generation.json',
    field: 'power_generation_index',
    label: 'Power generation (GWh)',
    chartType: 'line',
    format: (v) => `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })} GWh`,
  },
]
