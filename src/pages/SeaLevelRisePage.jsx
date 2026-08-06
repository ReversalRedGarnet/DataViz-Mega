import PageHero from '../components/PageHero.jsx'
import Section from '../components/Section.jsx'
import PacificBorder from '../components/PacificBorder.jsx'
import MapView from '../components/MapView.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import { useSelection } from '../hooks/useSelection.js'
import { SECTION_COLORS } from '../utils/theme.js'

// The ocean rises at close to the same rate everywhere it's measured;
// what stands in its way is not the same everywhere. Same "shared
// phenomenon, unequal outcome" structure as CyclonesPage/Hero.jsx and
// ElNinoDroughtPage.jsx, deliberately -- see the note in
// src/content/hazards.js.
//
// Shell page: real hero, real explainer, a real interactive map with
// this hazard's actual nation set -- but the numeric sections
// honestly show "waiting on data" rather than invented figures, since
// the tide-gauge/elevation-exposure pipeline hasn't been built yet
// (see README.md). Per the "approach B" decision, once real data
// lands here it'll be shown as raw per-nation indicators side by
// side, not collapsed into a single invented index.
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

function compareMessage(selected) {
  if (selected.length === 0) return "Select a nation on the map above to see its indicators once they're live."
  if (selected.length === 1) return `${selected[0]} selected. Select a second nation to compare, once indicators are live.`
  return `${selected[0]} and ${selected[1]} selected. Indicators for both will appear here once the tide-gauge/exposure pipeline is built.`
}

export default function SeaLevelRisePage() {
  const { selected, toggle, clear } = useSelection()
  const [heroTone, glanceTone, snapshotTone, mapTone, compareTone] = SECTION_TONES

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected)}
      </div>

      <PageHero
        kicker="Decades of tide-gauge record · one rising ocean, unequal exposure."
        headline="The ocean is rising at close to the same rate everywhere it's measured. What's in its way is not the same everywhere."
        body="Sea level rise in the Pacific is driven by the same two global mechanisms everywhere: seawater expanding as it warms, and land ice melting into the ocean. Tide gauges and satellite altimetry track the result in millimetres per year, averaged over decades to separate the underlying trend from tides, storms, and shorter cycles like El Niño. The rate itself is close to uniform across the open Pacific. What differs enormously is what stands in its way: high volcanic terrain gives a nation land to retreat to; a coral atoll rarely rises more than a few metres above sea level anywhere within its borders."
        cta="Scroll to explore the nations being tracked here."
        style={delayStyle(0)}
      />

      <PacificBorder colorAbove={SECTION_COLORS[heroTone]} colorBelow={SECTION_COLORS[glanceTone]} />

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
            <p className="italic opacity-70">
              This page is a shell: the sections below are structured to hold real tide-gauge and elevation-exposure
              data once that pipeline is built. What's live already is the map — explore which nations are being
              tracked here and why.
            </p>
          </div>
        </div>
      </Section>

      <PacificBorder colorAbove={SECTION_COLORS[glanceTone]} colorBelow={SECTION_COLORS[snapshotTone]} />

      <EmptyState tone={snapshotTone} style={delayStyle(2)}>
        Regional snapshot — sea level trend, land area within two metres of current sea level, and coastal
        population exposure for these six nations are next in the pipeline.
      </EmptyState>

      <PacificBorder colorAbove={SECTION_COLORS[snapshotTone]} colorBelow={SECTION_COLORS[mapTone]} />

      <MapView nations={NATIONS} selected={selected} onToggle={toggle} onClear={clear} style={delayStyle(3)} />

      <PacificBorder colorAbove={SECTION_COLORS[mapTone]} colorBelow={SECTION_COLORS[compareTone]} />

      <EmptyState tone={compareTone} style={delayStyle(4)}>
        {compareMessage(selected)}
      </EmptyState>

      <PacificBorder colorAbove={SECTION_COLORS[compareTone]} colorBelow={SECTION_COLORS[FOOTER_TONE]} />

      <CitationPanel sources={SOURCES} aboutTitle="About this page" style={delayStyle(5)}>
        <p className="text-sand/85">
          This page's map and framing are real; its indicator sections are not yet wired to data. The sources
          listed above are the official, publicly reviewed sources this page's eventual sea-level and exposure
          indicators will be drawn from — not sources for numbers currently shown, since none are shown yet.
        </p>
        <p className="text-sand/85 mt-3">
          This site is illustrative and isn't intended to inform policy, funding, or financial decisions.
        </p>
      </CitationPanel>
    </>
  )
}
