import PageHero from '../components/PageHero.jsx'
import Section from '../components/Section.jsx'
import PacificBorder from '../components/PacificBorder.jsx'
import MapView from '../components/MapView.jsx'
import SeaLevelSnapshot from '../components/SeaLevelSnapshot.jsx'
import SeaLevelTrends from '../components/SeaLevelTrends.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import { useSelection } from '../hooks/useSelection.js'
import { useSeaLevelData } from '../hooks/useSeaLevelData.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { sectionColorsFor } from '../utils/theme.js'

// The ocean rises at close to the same rate everywhere it's measured;
// what stands in its way is not the same everywhere. Same "shared
// phenomenon, unequal outcome" structure as CyclonesPage/Hero.jsx and
// ElNinoDroughtPage.jsx, deliberately -- see the note in
// src/content/hazards.js.
//
// Wired to real data as of the "Beyond the Submission" expansion (see
// README.md): monthly tide-gauge readings from BOM's Pacific Sea
// Level Monitoring Project (SEAFRAME network), 1992/93-2025, for all
// six nations -- see data-pipeline/clean_sea_level_data.py. What
// ISN'T built yet is land-area-within-two-metres or coastal
// population exposure -- this page shows the ocean's own measured
// behaviour at each station, not yet what stands in its way on land.
const NATIONS = [
  {
    name: 'Tuvalu',
    lat: -8.52,
    lon: 179.2,
    blurb: 'Average elevation near two metres; among the most exposed nations to sea level rise globally.',
  },
  {
    name: 'Kiribati',
    lat: 1.45,
    lon: 173.02,
    blurb: 'Low-lying atolls with limited higher ground to retreat to.',
  },
  {
    name: 'Marshall Islands',
    lat: 7.09,
    lon: 171.38,
    blurb: "Similarly low-lying; hosts one of the Pacific's longest-running tide gauge records.",
  },
  {
    name: 'Tonga',
    lat: -21.14,
    lon: -175.2,
    blurb: 'Volcanic and higher-lying terrain, though coastal communities remain exposed.',
  },
  {
    name: 'Fiji',
    lat: -18.14,
    lon: 178.44,
    blurb: 'Higher terrain than the atoll nations in this set, with more land available inland.',
  },
  {
    name: 'Cook Islands',
    lat: -21.21,
    lon: -159.78,
    blurb: 'A long-monitored tide gauge site in the eastern Pacific.',
  },
]

const SOURCES = [
  {
    label: 'Pacific Sea Level Monitoring Project / COSPPac Ocean Portal, Australian Bureau of Meteorology',
    url: 'https://www.pacificmet.net/rcc/climate-data',
  },
  {
    label: 'Pacific Climate Change Data Portal, Australian Bureau of Meteorology',
    url: 'https://www.bom.gov.au/climate/pccsp/',
  },
  {
    label: 'Pacific Data Hub (SPC) — Climate Change, Disasters and Risks',
    url: 'https://pacificdata.org/',
  },
]

const SECTION_TONES = ['plain', 'plain', 'panel', 'plain', 'panel']
const FOOTER_TONE = 'ink'

function delayStyle(index) {
  return { animationDelay: `${index * 90}ms` }
}

function selectionAnnouncement(selected) {
  if (selected.length === 0) return ''
  if (selected.length === 1) return `${selected[0]} selected.`
  return `Comparing ${selected[0]} and ${selected[1]}.`
}

export default function SeaLevelRisePage() {
  const { selected, toggle, clear } = useSelection()
  const data = useSeaLevelData()
  const { theme } = useTheme()
  const colors = sectionColorsFor(theme)
  const [heroTone, glanceTone, snapshotTone, mapTone, compareTone] = SECTION_TONES

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected)}
      </div>

      <div id="top">
        <PageHero
          kicker="Decades of tide-gauge record · one rising ocean, unequal exposure."
          headline="The ocean is rising at close to the same rate everywhere it's measured. What's in its way is not the same everywhere."
          body="Sea level rise in the Pacific is driven by the same two global mechanisms everywhere: seawater expanding as it warms, and land ice melting into the ocean. Tide gauges and satellite altimetry track the result in millimetres per year, averaged over decades to separate the underlying trend from tides, storms, and shorter cycles like El Niño. The rate itself is close to uniform across the open Pacific. What differs enormously is what stands in its way: high volcanic terrain gives a nation land to retreat to; a coral atoll rarely rises more than a few metres above sea level anywhere within its borders."
          cta="Scroll to explore the nations being tracked here."
          style={delayStyle(0)}
        />
      </div>

      <PacificBorder colorAbove={colors[heroTone]} colorBelow={colors[glanceTone]} />

      <div id="glance">
        <Section style={delayStyle(1)}>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-xl font-semibold">Sea Level Rise at a Glance</h2>
            <div className="max-w-2xl space-y-3 text-sm opacity-80">
              <p>
                Unlike a cyclone or an El Niño drought, sea level rise has no single event date — it's a continuous
                trend, measured in millimetres per year against a multi-decade baseline. The nations in this set are
                chosen because they're part of long-running, quality-controlled tide gauge networks, not because
                they've all had one dramatic flooding event to point to.
              </p>
              <p>
                Elevation is the variable that changes everything here. A nation whose highest point is a few metres
                above sea level has categorically less room to adapt in place than a nation with interior highlands —
                regardless of how similar the millimetre-per-year trend is between them.
              </p>
              <p className="opacity-70">
                The charts below are real: monthly tide-gauge readings from BOM's Pacific Sea Level Monitoring
                Project, one station per nation, most running from the early-to-mid 1990s to the present. Each
                station's own local benchmark is arbitrary, so raw readings aren't compared directly across nations
                here — see the footer for how that's handled. Land area at risk and coastal population exposure
                remain a "next in the pipeline" item.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <PacificBorder colorAbove={colors[glanceTone]} colorBelow={colors[snapshotTone]} />

      <div id="snapshot">
        <SeaLevelSnapshot data={data} nations={NATIONS} style={delayStyle(2)} />
      </div>

      <PacificBorder colorAbove={colors[snapshotTone]} colorBelow={colors[mapTone]} />

      <div id="map">
        <MapView nations={NATIONS} selected={selected} onToggle={toggle} onClear={clear} style={delayStyle(3)} />
      </div>

      <PacificBorder colorAbove={colors[mapTone]} colorBelow={colors[compareTone]} />

      <div id="trends">
        <SeaLevelTrends data={data} selectedNations={selected} style={delayStyle(4)} />
      </div>

      <PacificBorder colorAbove={colors[compareTone]} colorBelow={colors[FOOTER_TONE]} />

      <div id="sources">
        <CitationPanel sources={SOURCES} aboutTitle="About this page" style={delayStyle(5)}>
          <p className="text-sand/85">
            Each tide-gauge station's raw "mean sea level" reading is relative to that station's own local benchmark,
            not a shared regional or global datum — a station's absolute metre value says nothing about how its
            ocean compares to another station's. To keep nations honestly comparable, the trend chart above shows
            each station's own rate of change (millimetres/year, fitted by ordinary least squares across its full
            record), and the year-by-year chart shows each station's own reading as an anomaly relative to its own
            long-term average, not a raw metre figure.
          </p>
          <p className="text-sand/85 mt-3">
            Months with fewer than half their expected tide-gauge readings, and calendar years with fewer than nine
            reliable months, are excluded from the annual figures so a partially-recorded month or year can't skew
            the average.
          </p>
          <p className="text-sand/85 mt-3">
            Land area within two metres of current sea level and coastal population exposure for these nations
            aren't wired up yet — the sources listed above are where that indicator, once built, will be drawn from.
          </p>
          <p className="text-sand/85 mt-3">
            This site is illustrative and isn't intended to inform policy, funding, or financial decisions.
          </p>
        </CitationPanel>
      </div>
    </>
  )
}
