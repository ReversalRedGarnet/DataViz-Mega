// Every hazard "story" page, in nav order. Header's nav, Home's card grid, and
// App's routes all read from here, so adding a hazard means editing one array.
//
// `status` is shown on the homepage cards, not just an internal flag -- a card
// that admits its page is a shell is honest in the same way NoDataNote is.
// 'built' means real data wired end to end; 'shell' means the layout, map and
// framing are real but the numbers are still waiting on a pipeline.
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
    status: 'built',
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
    status: 'built',
  },
]
