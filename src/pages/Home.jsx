import PageHero from '../components/PageHero.jsx'
import Section from '../components/Section.jsx'
import PacificBorder from '../components/PacificBorder.jsx'
import HazardCard from '../components/HazardCard.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import { HAZARDS } from '../content/hazards.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { sectionColorsFor } from '../utils/theme.js'

// 'ink' for the hero, not 'plain' -- Home is the one deliberate
// exception to the site's otherwise-quiet look (see PageHero.jsx and
// HazardCard.jsx for the other two halves of this same exception),
// per direct feedback that the homepage should feel more "in your
// face" next to the calmer hazard pages it introduces.
const SECTION_TONES = ['ink', 'panel']
const FOOTER_TONE = 'ink'

function delayStyle(index) {
  return { animationDelay: `${index * 90}ms` }
}

// The site's hub: the same thesis Cyclones has always carried, now
// stated once at the top level rather than implied by a single story.
// Everything below is the HAZARDS registry (src/content/hazards.js)
// rendered as cards -- add a hazard there and it appears here and in
// Header's nav automatically, nothing to wire up in this file.
export default function Home() {
  const { theme } = useTheme()
  const colors = sectionColorsFor(theme)
  const [heroTone, gridTone] = SECTION_TONES

  return (
    <>
      <div id="top">
        <PageHero
          tone={heroTone}
          headlineClassName="text-4xl font-black tracking-tight md:text-7xl"
          kicker="Ripple · an ongoing look at climate and inequality across the Pacific"
          headline="Climate doesn't create inequality. It reveals it."
          body="Ripple started with a single storm: Cyclone Harold, which crossed four Pacific borders in one week in April 2020 and left each nation in a different place a year later. The same pattern — one shared physical hazard, unevenly distributed consequences — holds for slower, less dramatic hazards too. This site is expanding to trace that pattern across cyclones, El Niño-driven drought, and sea level rise, drawing only on official, publicly reviewed Pacific data sources. Not every hazard here is fully built yet; each page says plainly what's real and what's still a shell."
          cta="Choose a hazard below to start."
          style={delayStyle(0)}
        />
      </div>

      <PacificBorder colorAbove={colors[heroTone]} colorBelow={colors[gridTone]} />

      <div id="hazards">
        <Section tone={gridTone} style={delayStyle(1)}>
          <h2 className="mb-1 text-xl font-semibold">Hazards</h2>
          <p className="mb-6 text-sm opacity-70">Each one traces the same question against a different physical driver.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {HAZARDS.map((hazard, i) => (
              <HazardCard key={hazard.slug} hazard={hazard} index={i} />
            ))}
          </div>
        </Section>
      </div>

      <PacificBorder colorAbove={colors[gridTone]} colorBelow={colors[FOOTER_TONE]} />

      <div id="sources">
        <CitationPanel
          sources={[
            { label: 'Pacific Data Hub (SPC) — the region-wide starting point for every hazard on this site', url: 'https://pacificdata.org/' },
          ]}
          aboutTitle="About this project"
          style={delayStyle(2)}
        >
          <p className="text-sand/85">
            Each hazard page lists the specific official sources it draws on, or will draw on, in its own footer —
            this is just the shared starting point. No hazard here uses a single blended "risk" or "suffering" score;
            where indicators are shown, they're shown as raw figures side by side, so a nation's numbers speak for
            themselves rather than being folded into one invented number.
          </p>
          <p className="text-sand/85 mt-3">
            This site is illustrative and isn't intended to inform policy, funding, or financial decisions.
          </p>
        </CitationPanel>
      </div>
    </>
  )
}
