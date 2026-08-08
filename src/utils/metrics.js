// Cyclone Harold, April 2020: the before/after anchor for this page.
export const EVENT_YEAR = 2020

// Filenames match data-pipeline/clean_data.py's DATASETS dict.
//
// chartType: 'bar' where the year range has gaps, since a line would imply a
// trend across years never measured; 'line' for continuous data; 'area' where
// the drop in volume is itself the point.
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
