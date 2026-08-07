// Cyclone Harold, April 2020 -- the before/after anchor used by
// ComparisonView and RippleChain's comparative insights.
export const EVENT_YEAR = 2020

// Metric definitions used by RippleChain and ComparisonView.
// Filenames match data-pipeline/clean_data.py's DATASETS dict.
//
// chartType: 'bar' for metrics with gaps in the year range (a line
// would imply a trend across years never measured), 'line' for
// continuous yearly data, 'area' when the drop in volume itself is
// the point (tourist arrivals).
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
