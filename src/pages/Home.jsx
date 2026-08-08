import PageHero from '../components/PageHero.jsx'
import Section from '../components/Section.jsx'
import PageSections from '../components/PageSections.jsx'
import HazardCard from '../components/HazardCard.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import { HAZARDS } from '../content/hazards.js'

// The site's hub: the same thesis Cyclones has always carried, stated once at
// the top level rather than implied by a single story. The card grid is the
// HAZARDS registry rendered directly -- add a hazard there and it appears here
// and in Header's nav, with nothing to wire up in this file.
//
// The hero is 'ink' rather than 'plain', the one deliberate exception to the
// site's otherwise-quiet look (see PageHero.jsx and HazardCard.jsx for the
// other two halves of it): the homepage should feel louder than the calmer
// hazard pages it introduces.
export default function Home() {
  return (
    <PageSections
      sections={[
        {
          id: 'top',
          tone: 'ink',
          element: (
            <PageHero
              tone="ink"
              headlineClassName="text-4xl font-black tracking-tight md:text-7xl"
              kicker="Ripple · an ongoing look at climate and inequality across the Pacific"
              headline="Climate doesn't create inequality. It reveals it."
              body="Ripple started with a single storm: Cyclone Harold, which crossed four Pacific borders in one week in April 2020 and left each nation in a different place a year later. The same pattern — one shared physical hazard, unevenly distributed consequences — holds for slower, less dramatic hazards too. This site traces that pattern across cyclones, El Niño-driven drought, and sea level rise, drawing only on official, publicly reviewed Pacific data sources. Where an indicator isn't available, each page says so plainly rather than filling the gap with a placeholder number."
              cta="Choose a hazard below to start."
            />
          ),
        },
        {
          id: 'hazards',
          tone: 'panel',
          element: (
            <Section tone="panel">
              <h2 className="mb-1 text-xl font-semibold">Hazards</h2>
              <p className="mb-6 text-sm opacity-70">Each one traces the same question against a different physical driver.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {HAZARDS.map((hazard, i) => (
                  <HazardCard key={hazard.slug} hazard={hazard} index={i} />
                ))}
              </div>
            </Section>
          ),
        },
        {
          id: 'sources',
          tone: 'ink',
          element: (
            <CitationPanel
              sources={[
                { label: 'Pacific Data Hub (SPC) — the region-wide starting point for every hazard on this site', url: 'https://pacificdata.org/' },
              ]}
              aboutTitle="About this project"
            >
              <p className="text-sand/85 dark:text-ink/85">
                Each hazard page lists the specific official sources it draws on, or will draw on, in its own footer &mdash;
                this is just the shared starting point. No hazard here uses a single blended "risk" or "suffering" score;
                where indicators are shown, they're shown as raw figures side by side, so a nation's numbers speak for
                themselves rather than being folded into one invented number.
              </p>
              <p className="text-sand/85 dark:text-ink/85 mt-3">
                This site is illustrative and isn't intended to inform policy, funding, or financial decisions.
              </p>
            </CitationPanel>
          ),
        },
      ]}
    />
  )
}
