import PageHero from '../components/PageHero.jsx'
import Section from '../components/Section.jsx'
import PacificBorder from '../components/PacificBorder.jsx'
import MapView from '../components/MapView.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import { useSelection } from '../hooks/useSelection.js'
import { SECTION_COLORS } from '../utils/theme.js'

// El Niño reaches every Pacific nation on roughly the same 2-7 year
// cycle; which nations have water security when it arrives is a
// separate question from the cycle itself. Same "shared phenomenon,
// unequal outcome" structure as CyclonesPage/Hero.jsx, deliberately --
// see the note in src/content/hazards.js.
//
// Shell page: real hero, real explainer, a real interactive map with
// this hazard's actual nation set -- but the numeric sections
// honestly show "waiting on data" rather than invented figures, since
// the drought/water-security data pipeline hasn't been built yet
// (see README.md). Per the "approach B" decision, once real data
// lands here it'll be shown as raw per-nation indicators side by
// side, not collapsed into a single invented index.
const NATIONS = [
  {
    name: 'Kiribati',
    lat: 1.45,
    lon: 173.02,
    blurb: 'Low-lying and equatorial; among the most exposed nations to El Niño-driven drought.',
  },
  {
    name: 'Papua New Guinea',
    lat: -9.44,
    lon: 147.18,
    blurb: 'Highland communities faced severe frost and crop failure during the 2015–16 El Niño.',
  },
  {
    name: 'Marshall Islands',
    lat: 7.09,
    lon: 171.38,
    blurb: 'Declared a state of emergency during the 2016 El Niño drought.',
  },
  {
    name: 'Federated States of Micronesia',
    lat: 6.92,
    lon: 158.16,
    blurb: 'Also declared a drought emergency in 2016, alongside the Marshall Islands.',
  },
  {
    name: 'Fiji',
    lat: -18.14,
    lon: 178.44,
    blurb: 'Higher terrain and greater water storage capacity than the atoll nations in this set.',
  },
]

const SOURCES = [
  {
    label: 'Island Climate Update — ENSO, Rain & Drought Watch, COSPPac / Pacific Meteorological Desk',
    url: 'https://www.pacificmet.net/rcc/climate-monitoring',
  },
  {
    label: 'Pacific Observatory climate database (SPEI drought index by country), World Bank',
    url: 'https://worldbank.github.io/pacific-observatory/climate/climate_db.html',
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
  if (selected.length === 0) return 'Select a nation on the map above to see its indicators once they\u2019re live.'
  if (selected.length === 1) return `${selected[0]} selected. Select a second nation to compare, once indicators are live.`
  return `${selected[0]} and ${selected[1]} selected. Indicators for both will appear here once the drought/water-security pipeline is built.`
}

export default function ElNinoDroughtPage() {
  const { selected, toggle, clear } = useSelection()
  const [heroTone, glanceTone, snapshotTone, mapTone, compareTone] = SECTION_TONES

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected)}
      </div>

      <PageHero
        kicker="Recurring, roughly every 2–7 years · one oscillation, uneven readiness."
        headline="El Niño reaches every Pacific nation on the same rough cycle. Water security does not."
        body="El Niño and La Niña are opposite phases of the El Niño–Southern Oscillation (ENSO), a natural, recurring shift in Pacific Ocean temperatures and winds. During El Niño, rainfall that would normally fall over the western Pacific shifts east, leaving many Pacific Island nations drier than usual for months at a time. The oscillation itself is natural and shared. What a nation has to draw on when it arrives — water storage, groundwater access, how many other stresses it's already carrying — is not."
        cta="Scroll to explore the nations being tracked here."
        style={delayStyle(0)}
      />

      <PacificBorder colorAbove={SECTION_COLORS[heroTone]} colorBelow={SECTION_COLORS[glanceTone]} />

      <Section style={delayStyle(1)}>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-xl font-semibold">El Niño & Drought at a Glance</h2>
          <div className="max-w-2xl space-y-3 text-sm opacity-80">
            <p>
              ENSO cycles between El Niño and La Niña roughly every two to seven years, and has done so for as long
              as it's been observed — it isn't itself a product of a warming climate. What ties it to this site's
              broader thesis is the same pattern as Cyclone Harold: one shared physical driver, unevenly distributed
              consequences.
            </p>
            <p>
              Nations with more water storage infrastructure, more diversified agriculture, and more fiscal room to
              respond quickly tend to weather an El Niño drought differently than nations without those things —
              regardless of how strong that particular El Niño is.
            </p>
            <p className="italic opacity-70">
              This page is a shell: the sections below are structured to hold real drought and water-security
              indicators once that data pipeline is built. What's live already is the map — explore which nations
              are being tracked here and why.
            </p>
          </div>
        </div>
      </Section>

      <PacificBorder colorAbove={SECTION_COLORS[glanceTone]} colorBelow={SECTION_COLORS[snapshotTone]} />

      <EmptyState tone={snapshotTone} style={delayStyle(2)}>
        Regional snapshot — rainfall anomaly, reported drought impact, and water storage indicators for these five
        nations are next in the pipeline.
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
          listed above are the official, publicly reviewed sources this page's eventual drought and water-security
          indicators will be drawn from — not sources for numbers currently shown, since none are shown yet.
        </p>
        <p className="text-sand/85 mt-3">
          This site is illustrative and isn't intended to inform policy, funding, or financial decisions.
        </p>
      </CitationPanel>
    </>
  )
}
