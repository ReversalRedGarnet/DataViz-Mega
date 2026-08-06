import Section from './Section.jsx'

export default function Hero({ style }) {
  return (
    <Section className="text-center" style={style}>
      <p className="mx-auto max-w-2xl text-sm font-semibold uppercase tracking-wide opacity-70">
        April 2020 · One cyclone. Four nations. Four different outcomes.
      </p>
      <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
        Cyclone Harold followed one path across the Pacific. Recovery did not.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg opacity-80">
        When Tropical Cyclone Harold swept across the South Pacific in April 2020, it affected Solomon Islands, Vanuatu, Fiji, and Tonga within a matter of days. Although these nations experienced the same storm, the consequences varied significantly.
Differences in population, geography, infrastructure, economic resilience, and emergency preparedness shaped how communities responded and recovered. Some countries faced widespread infrastructure damage, while others experienced greater economic disruption or longer recovery periods.
This data story explores how a single natural hazard produced very different outcomes, using interactive visualizations to compare impact, recovery, and resilience across the region.
      </p>
      <p className="mx-auto mt-4 max-w-2xl text-lg font-medium opacity-80">
        Scroll to follow the storm's journey.
      </p>
    </Section>
  )
}
