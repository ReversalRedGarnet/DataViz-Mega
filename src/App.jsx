import { useState } from 'react'
import Hero from './components/Hero.jsx'
import StormProfile from './components/StormProfile.jsx'
import BigPicture from './components/BigPicture.jsx'
import MapView from './components/MapView.jsx'
import RippleChain from './components/RippleChain.jsx'
import ComparisonView from './components/ComparisonView.jsx'
import CitationPanel from './components/CitationPanel.jsx'
import PacificBorder from './components/PacificBorder.jsx'
import Header from './components/Header.jsx'
import { useSelection } from './hooks/useSelection.js'
import { useRippleData } from './hooks/useRippleData.js'
import { SECTION_COLORS } from './utils/theme.js'

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

// Tone for each major section, top to bottom -- the single source of
// truth for both which background each Section uses AND which two
// colours each PacificBorder divider needs to bound (see
// SECTION_COLORS in theme.js and the two-tone divider in
// PacificBorder.jsx). 'plain' sections are the interactive canvas
// (Hero/Storm profile/Map/RippleChain); 'panel' is reserved for the
// two sections that read as an editorial aside (BigPicture, Compare
// recovery) -- Storm profile stays 'plain' rather than becoming a
// third panel, since it's part of the same opening/framing beat as
// Hero, not a separate editorial aside.
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

export default function App() {
  const data = useRippleData()
  const { selected, toggle, clear } = useSelection()
  const [headerHeight, setHeaderHeight] = useState(0)

  const [heroTone, stormTone, bigPictureTone, mapTone, rippleTone, comparisonTone] = SECTION_TONES

  return (
    <>
      <Header onHeightChange={setHeaderHeight} />

      {/* Visually hidden until focused -- lets keyboard users jump past
          the map straight to the charts without tabbing through every
          marker first. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:rounded-br-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Announces selection changes to screen readers, since the charts
          and comparison view updating below wouldn't otherwise be
          noticed without visually looking at the page. */}
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected)}
      </div>

      <main id="main-content" className="min-h-screen" style={{ paddingTop: headerHeight }}>
        <Hero style={delayStyle(0)} />
        <PacificBorder colorAbove={SECTION_COLORS[heroTone]} colorBelow={SECTION_COLORS[stormTone]} />
        <StormProfile style={delayStyle(1)} />
        <PacificBorder colorAbove={SECTION_COLORS[stormTone]} colorBelow={SECTION_COLORS[bigPictureTone]} />
        <BigPicture data={data} style={delayStyle(2)} />
        <PacificBorder colorAbove={SECTION_COLORS[bigPictureTone]} colorBelow={SECTION_COLORS[mapTone]} />
        <MapView selected={selected} onToggle={toggle} onClear={clear} style={delayStyle(3)} />
        <PacificBorder colorAbove={SECTION_COLORS[mapTone]} colorBelow={SECTION_COLORS[rippleTone]} />
        <RippleChain data={data} selectedNations={selected} style={delayStyle(4)} />
        <PacificBorder colorAbove={SECTION_COLORS[rippleTone]} colorBelow={SECTION_COLORS[comparisonTone]} />
        <ComparisonView data={data} selectedNations={selected} style={delayStyle(5)} />
        <PacificBorder colorAbove={SECTION_COLORS[comparisonTone]} colorBelow={SECTION_COLORS[FOOTER_TONE]} />
        <CitationPanel sources={DATA_SOURCES} style={delayStyle(6)} />
      </main>
    </>
  )
}
