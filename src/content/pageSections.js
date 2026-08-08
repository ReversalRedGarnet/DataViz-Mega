// Per-page in-page section anchors -- read by SectionNav.jsx (the
// hamburger menu in Header.jsx) to build its jump-to-section list.
// Keyed by pathname, same "one registry, read by more than one
// component" pattern as hazards.js.
//
// Each id here must match the id= on the wrapping element around that
// section in the corresponding page file exactly (see each page's own
// <div id="..."> wrappers) -- there's no runtime check tying the two
// together, so a renamed id on one side needs the same rename here.
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
