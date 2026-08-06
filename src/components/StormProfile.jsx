import { useEffect, useRef } from 'react'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderStormProfileChart, STORM_CHART_WIDTH, STORM_CHART_HEIGHT } from '../utils/chartRenderers.jsx'

export const STORM_PROFILE = [
  {
    name: 'Solomon Islands',
    category: 1,
    categoryLabel: 'Tropical low / Category 1 at time of impact',
    deaths: 27,
    dodge: 0,
    fact: "The passenger ferry MV Taimareho was overwhelmed by Harold's swell in Ironbottom Sound, Malaita Province -- the deadliest single event of the whole cyclone, at its weakest documented phase.",
  },
  {
    name: 'Vanuatu',
    category: 5,
    categoryLabel: 'Category 5 (landfall, Espiritu Santo)',
    deaths: 2,
    dodge: 0,
    fact: '230 km/h sustained winds, gusts to 325 km/h -- the strongest storm to hit Vanuatu since Cyclone Pam in 2015. Up to 90% of homes lost in the worst-hit areas.',
  },
  {
    name: 'Fiji',
    category: 4,
    categoryLabel: 'Category 4 (landfall, Kadavu)',
    deaths: 1,
    dodge: -0.35,
    fact: '1,919 buildings damaged; 103mm of rain recorded at Sigatoka in a single day.',
  },
  {
    name: 'Tonga',
    category: 4,
    categoryLabel: 'Category 4 (passed offshore, no landfall)',
    deaths: 0,
    dodge: 0.35,
    fact: '428 homes damaged or destroyed by flooding and storm surge, without a direct hit.',
  },
]

// Props:
//   style -- forwarded to the underlying Section, used by App.jsx to
//     stagger each section's entrance on first load
export default function StormProfile({ style }) {
  const ref = useRef(null)
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  useEffect(() => {
    if (!ref.current) return
    const svg = resetSvg(ref, STORM_CHART_WIDTH, STORM_CHART_HEIGHT)
    renderStormProfileChart(svg, { rows: STORM_PROFILE, showTooltip, hideTooltip })
  }, [showTooltip, hideTooltip])

  return (
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 text-xl font-semibold">Cyclone Harold at a Glance</h2>

<div className="max-w-2xl space-y-3 text-sm opacity-80">
  <p>
    Tropical Cyclone Harold was one of the strongest storms of the 2020 South Pacific
    cyclone season. Between 2 and 10 April 2020, it tracked across Solomon Islands,
    Vanuatu, Fiji, and Tonga, bringing destructive winds, heavy rainfall, storm surges,
    and widespread flooding.
  </p>

  <p>
    Although Harold was the same weather system throughout its journey, its intensity
    changed over time. Some countries experienced a direct Category 5 landfall, while
    others encountered a weaker system or were affected primarily by rough seas and
    coastal flooding.
  </p>

  <p>
    The chart below compares Cyclone Harold's strength at its closest approach to each
    nation against the reported loss of life. It introduces an important observation:
    stronger storms do not always produce the greatest human impact.
  </p>
</div>

        <svg
          ref={ref}
          role="img"
          aria-label="Scatter chart comparing cyclone category at closest approach against deaths, for each of the four nations"
          className="mt-4 h-auto w-full"
        />

        <p className="mt-3 max-w-2xl text-sm font-medium">
  One of the most striking findings is that the cyclone's deadliest single event occurred
  while Harold was at its weakest documented phase. Twenty-seven people lost their lives
  when the passenger ferry <em>MV Taimareho</em> was overwhelmed off Solomon Islands—
  more than the combined death toll recorded in Vanuatu, Fiji, and Tonga.
</p>

        {/* Screen-reader-only data table -- same pattern as RippleChain:
            the chart above conveys the shape, this gives the same
            numbers as text.

            whitespace-normal overrides the nowrap that .sr-only sets
            (and which inherits down into every cell): the "Local
            detail" column below holds full prose sentences, and
            table layout doesn't let a table's rendered width shrink
            below its content's min-content width -- with nowrap
            inherited, that min-content width was the length of the
            single longest unbroken sentence, which stretched this
            table (and, since it's position:absolute, the whole page)
            to roughly 2000px wide on every screen size, invisibly.
            Letting the text wrap keeps min-content down to the
            longest unbreakable *word* instead. */}
        <table className="sr-only whitespace-normal">
          <caption>Cyclone Harold: category at closest approach and deaths, by nation</caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Category at closest approach</th>
              <th scope="col">Deaths</th>
              <th scope="col">Local detail</th>
            </tr>
          </thead>
          <tbody>
            {STORM_PROFILE.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.categoryLabel}</td>
                <td>{row.deaths}</td>
                <td>{row.fact}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
