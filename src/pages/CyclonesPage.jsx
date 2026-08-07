import Hero from '../components/Hero.jsx'
import StormProfile from '../components/StormProfile.jsx'
import BigPicture from '../components/BigPicture.jsx'
import MapView from '../components/MapView.jsx'
import RippleChain from '../components/RippleChain.jsx'
import ComparisonView from '../components/ComparisonView.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import PacificBorder from '../components/PacificBorder.jsx'
import { useSelection } from '../hooks/useSelection.js'
import { useRippleData } from '../hooks/useRippleData.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { sectionColorsFor } from '../utils/theme.js'

// The original Ripple site, unchanged in substance -- this is the same
// content that used to live directly in App.jsx before the site grew
// a homepage and sibling hazard pages.
const DATA_SOURCES = [
  {
    label: 'Number of directly affected persons attributed to disasters — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_11&df[ag]=SPC&df[vs]=3.0&dq=A.VC_DSR_AFFCT.........&pd=,&to[TIME_PERIOD]=false&lb=bt',
  },
  {
    label: 'Direct disaster economic loss — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_11&df[ag]=SPC&df[vs]=3.0&dq=A.VC_DSR_AALT...._T.....&pd=,&to[TIME_PERIOD]=false',
  },
  {
    label: 'Crop yield — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.CROP_YIELD.&pd=,&to[TIME_PERIOD]=false',
  },
  {
    label: 'Tourist arrivals — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.TRSM_ARR.&pd=,&to[TIME_PERIOD]=false',
  },
  {
    label: 'Power generation — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.POWER_GEN.&pd=,&to[TIME_PERIOD]=false',
  },
  // Supplementary sources -- not from the official Pacific Data Hub
  // list, used only for the "storm itself" category/deaths comparison
  // (see StormProfile.jsx), not for any ripple-chain metric above.
  {
    label: 'Severe Tropical Cyclone Harold — official cyclone history, Australian Bureau of Meteorology',
    url: 'http://www.bom.gov.au/cyclone/history/Harold.shtml',
  },
  {
    label: 'Tropical Cyclone Harold — humanitarian situation reports, UN OCHA / ReliefWeb',
    url: 'https://reliefweb.int/disaster/tc-2020-000049-vut',
  },
]

// Tone for each major section, top to bottom -- the source of truth
// for both which background each Section uses and which two colors
// each PacificBorder divider bounds (see sectionColorsFor in
// theme.js). 'plain' sections are the interactive canvas (Hero/Storm
// profile/Map/RippleChain); 'panel' is reserved for the two sections
// that read as an editorial aside (BigPicture, Compare recovery).
const SECTION_TONES = ['plain', 'plain', 'panel', 'plain', 'plain', 'panel']
const FOOTER_TONE = 'ink'

function delayStyle(index) {
  return { animationDelay: `${index * 90}ms` }
}

function selectionAnnouncement(selected) {
  if (selected.length === 0) return ''
  if (selected.length === 1) return `${selected[0]} selected. Showing its ripple chain below.`
  return `Comparing ${selected[0]} and ${selected[1]}.`
}

export default function CyclonesPage() {
  const data = useRippleData()
  const { selected, toggle, clear } = useSelection()
  const { theme } = useTheme()
  const colors = sectionColorsFor(theme)

  const [heroTone, stormTone, bigPictureTone, mapTone, rippleTone, comparisonTone] = SECTION_TONES

  return (
    <>
      {/* Announces selection changes to screen readers, since the
          charts/comparison view below otherwise update silently. */}
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected)}
      </div>

      <div id="top">
        <Hero style={delayStyle(0)} />
      </div>
      <PacificBorder colorAbove={colors[heroTone]} colorBelow={colors[stormTone]} />
      <div id="storm-profile">
        <StormProfile style={delayStyle(1)} />
      </div>
      <PacificBorder colorAbove={colors[stormTone]} colorBelow={colors[bigPictureTone]} />
      <div id="big-picture">
        <BigPicture data={data} style={delayStyle(2)} />
      </div>
      <PacificBorder colorAbove={colors[bigPictureTone]} colorBelow={colors[mapTone]} />
      <div id="map">
        <MapView selected={selected} onToggle={toggle} onClear={clear} style={delayStyle(3)} />
      </div>
      <PacificBorder colorAbove={colors[mapTone]} colorBelow={colors[rippleTone]} />
      <div id="ripple-chain">
        <RippleChain data={data} selectedNations={selected} style={delayStyle(4)} />
      </div>
      <PacificBorder colorAbove={colors[rippleTone]} colorBelow={colors[comparisonTone]} />
      <div id="compare">
        <ComparisonView data={data} selectedNations={selected} style={delayStyle(5)} />
      </div>
      <PacificBorder colorAbove={colors[comparisonTone]} colorBelow={colors[FOOTER_TONE]} />
      <div id="sources">
        <CitationPanel sources={DATA_SOURCES} style={delayStyle(6)} />
      </div>
    </>
  )
}
