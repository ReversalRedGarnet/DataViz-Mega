// Single source of truth for every hazard "story" page on the site --
// both Header.jsx's nav and Home.jsx's card grid read from this list
// rather than each keeping their own copy, so adding a fifth hazard
// later means editing one array, not two.
//
// `status` is deliberately visible on the homepage cards (see
// HazardCard.jsx), not just an internal build flag: a card that says
// "data pipeline in progress" is an honest placeholder, the same way
// NoDataNote/EmptyState are honest about missing data mid-page rather
// than papering over it. 'built' means real data, wired end to end.
// 'shell' means the page, layout, map, and framing are real, but the
// numeric sections are still waiting on their pipeline.
export const HAZARDS = [
  {
    slug: 'cyclones',
    path: '/cyclones',
    navLabel: 'Cyclones',
    title: 'Cyclones',
    timescale: 'Short-term · single events',
    kicker: 'April 2020 · one cyclone. Four nations. Four different outcomes.',
    cardBlurb:
      'Cyclone Harold crossed four borders in the same week. This traces how differently each nation absorbed an identical storm.',
    status: 'built',
  },
  {
    slug: 'el-nino-drought',
    path: '/el-nino-drought',
    navLabel: 'El Niño & Drought',
    title: 'El Niño & Drought',
    timescale: 'Recurring · roughly every 2–7 years',
    kicker: 'Recurring, roughly every 2–7 years · one oscillation, uneven readiness.',
    cardBlurb:
      "El Niño reaches every Pacific nation on the same rough cycle. Which nations have water when it arrives is a separate question.",
    status: 'shell',
  },
  {
    slug: 'sea-level-rise',
    path: '/sea-level-rise',
    navLabel: 'Sea Level Rise',
    title: 'Sea Level Rise',
    timescale: 'Long-term · decades of tide-gauge record',
    kicker: 'Decades of tide-gauge record · one rising ocean, unequal exposure.',
    cardBlurb:
      "The ocean is rising at close to the same rate everywhere it's measured. What's in its way is not the same everywhere.",
    status: 'shell',
  },
]
