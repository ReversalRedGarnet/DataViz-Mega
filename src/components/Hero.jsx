import PageHero from './PageHero.jsx'

// Cyclone Harold's hero copy, unchanged from before this became a
// wrapper around the shared PageHero pattern (see PageHero.jsx) --
// CyclonesPage.jsx still just renders <Hero style={...} />.
export default function Hero({ style }) {
  return (
    <PageHero
      kicker="April 2020 · One cyclone. Four nations. Four different outcomes."
      headline="Cyclone Harold followed one path across the Pacific. Recovery did not."
      body="When Tropical Cyclone Harold swept across the South Pacific in April 2020, it affected Solomon Islands, Vanuatu, Fiji, and Tonga within a matter of days. Although these nations experienced the same storm, the consequences varied significantly. Differences in population, geography, infrastructure, economic resilience, and emergency preparedness shaped how communities responded and recovered. Some countries faced widespread infrastructure damage, while others experienced greater economic disruption or longer recovery periods. This data story explores how a single natural hazard produced very different outcomes, using interactive visualizations to compare impact, recovery, and resilience across the region."
      cta="Scroll to follow the storm's journey."
      style={style}
    />
  )
}
