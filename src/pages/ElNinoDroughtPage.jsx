import PageHero from '../components/PageHero.jsx'
import Section from '../components/Section.jsx'
import PageSections from '../components/PageSections.jsx'
import MapView from '../components/MapView.jsx'
import DroughtSnapshot from '../components/DroughtSnapshot.jsx'
import DroughtTrends from '../components/DroughtTrends.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import { useSelection, selectionAnnouncement } from '../hooks/useSelection.js'
import { useMetricData } from '../hooks/useMetricData.js'
import { METRICS } from '../utils/droughtMetrics.js'

// El Niño reaches every Pacific nation on roughly the same 2-7 year cycle;
// which nations have water security when it arrives is a separate question.
// Same "shared phenomenon, unequal outcome" structure as the other two hazard
// pages, deliberately -- see the note in src/content/hazards.js.
//
// SPI-12/SPEI-12 (World Bank Pacific Observatory) is the meteorological signal
// only: how dry a year was relative to that nation's own baseline. Reported
// drought impact and water-storage capacity aren't wired up, and the copy below
// says so rather than implying SPI/SPEI covers the human side too.
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
    label: 'Pacific Observatory climate database (SPI/SPEI drought indices by country), World Bank',
    url: 'https://worldbank.github.io/pacific-observatory/climate/climate_db.html',
  },
  {
    label: 'Pacific Data Hub (SPC) — Climate Change, Disasters and Risks',
    url: 'https://pacificdata.org/',
  },
]

export default function ElNinoDroughtPage() {
  const { selected, toggle, clear } = useSelection()
  const data = useMetricData(METRICS)

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected)}
      </div>

      <PageSections
        sections={[
          {
            id: 'top',
            tone: 'plain',
            element: (
              <PageHero
                kicker="Recurring, roughly every 2–7 years · one oscillation, uneven readiness."
                headline="El Niño reaches every Pacific nation on the same rough cycle. Water security does not."
                body="El Niño and La Niña are opposite phases of the El Niño–Southern Oscillation (ENSO), a natural, recurring shift in Pacific Ocean temperatures and winds. During El Niño, rainfall that would normally fall over the western Pacific shifts east, leaving many Pacific Island nations drier than usual for months at a time. The oscillation itself is natural and shared. What a nation has to draw on when it arrives — water storage, groundwater access, how many other stresses it's already carrying — is not."
                cta="Scroll to explore the nations being tracked here."
              />
            ),
          },
          {
            id: 'glance',
            tone: 'plain',
            element: (
              <Section>
                <div className="mx-auto max-w-3xl">
                  <h2 className="mb-2 text-xl font-semibold">El Niño &amp; Drought at a Glance</h2>
                  <div className="max-w-2xl space-y-3 text-sm opacity-80">
                    <p>
                      ENSO cycles between El Niño and La Niña roughly every two to seven years, and has done so for as
                      long as it's been observed — it isn't itself a product of a warming climate. What ties it to this
                      site's broader thesis is the same pattern as Cyclone Harold: one shared physical driver, unevenly
                      distributed consequences.
                    </p>
                    <p>
                      Nations with more water storage infrastructure, more diversified agriculture, and more fiscal room to
                      respond quickly tend to weather an El Niño drought differently than nations without those things —
                      regardless of how strong that particular El Niño is.
                    </p>
                    <p className="opacity-70">
                      The charts below are real: SPI-12 and SPEI-12, the World Bank Pacific Observatory's own drought
                      indices for these five nations, running from 1958 to 2021 (the source's own record ends there). They
                      show how wet or dry each year was relative to that nation's own long-term baseline — not yet the
                      human side of the story (reported impact, water storage capacity), which remains a "next in the
                      pipeline" item.
                    </p>
                  </div>
                </div>
              </Section>
            ),
          },
          {
            id: 'snapshot',
            tone: 'panel',
            element: <DroughtSnapshot data={data} nations={NATIONS} />,
          },
          {
            id: 'map',
            tone: 'plain',
            element: <MapView nations={NATIONS} selected={selected} onToggle={toggle} onClear={clear} />,
          },
          {
            id: 'trends',
            tone: 'panel',
            element: <DroughtTrends data={data} selectedNations={selected} />,
          },
          {
            id: 'sources',
            tone: 'ink',
            element: (
              <CitationPanel sources={SOURCES} aboutTitle="About this page">
                <p className="text-sand/85 dark:text-ink/85">
                  SPI-12 and SPEI-12 are reported at the admin-1 (state/province) level by the World Bank; the figures
                  shown here are an unweighted average across each nation's own admin-1 regions (e.g. Fiji's four
                  divisions, Papua New Guinea's 22 provinces), not a separate national calculation. Each year's value is
                  December's reading, since a 12-month index already covers the full calendar year ending that month.
                </p>
                <p className="text-sand/85 dark:text-ink/85 mt-3">
                  Reported drought impact and water-storage capacity for these nations aren't wired up yet — the sources
                  listed above are where that indicator, once built, will be drawn from.
                </p>
                <p className="text-sand/85 dark:text-ink/85 mt-3">
                  This site is illustrative and isn't intended to inform policy, funding, or financial decisions.
                </p>
              </CitationPanel>
            ),
          },
        ]}
      />
    </>
  )
}
