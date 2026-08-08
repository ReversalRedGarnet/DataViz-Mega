// In-page section anchors per pathname, read by SectionNav to build its
// jump-to menu. Each id must match the `id` on the matching entry in that
// page's PageSections list -- nothing checks this at runtime, so renaming one
// side means renaming the other.
export const PAGE_SECTIONS = {
  '/': [
    { id: 'top', label: 'Overview' },
    { id: 'hazards', label: 'Hazards' },
    { id: 'sources', label: 'Sources' },
  ],
  '/cyclones': [
    { id: 'top', label: 'Overview' },
    { id: 'storm-profile', label: 'Storm Profile' },
    { id: 'big-picture', label: 'The Bigger Picture' },
    { id: 'map', label: 'Explore the Map' },
    { id: 'ripple-chain', label: 'The Ripple Chain' },
    { id: 'compare', label: 'Compare Recovery' },
    { id: 'sources', label: 'Sources' },
  ],
  '/el-nino-drought': [
    { id: 'top', label: 'Overview' },
    { id: 'glance', label: 'At a Glance' },
    { id: 'snapshot', label: 'Regional Snapshot' },
    { id: 'map', label: 'Explore the Map' },
    { id: 'trends', label: 'Drought Trends' },
    { id: 'sources', label: 'Sources' },
  ],
  '/sea-level-rise': [
    { id: 'top', label: 'Overview' },
    { id: 'glance', label: 'At a Glance' },
    { id: 'snapshot', label: 'Regional Snapshot' },
    { id: 'exposure', label: 'Population Exposure' },
    { id: 'map', label: 'Explore the Map' },
    { id: 'trends', label: 'Sea Level Trends' },
    { id: 'sources', label: 'Sources' },
  ],
}
