import Hero from '../components/Hero.jsx'
import StormProfile from '../components/StormProfile.jsx'
import BigPicture from '../components/BigPicture.jsx'
import MapView from '../components/MapView.jsx'
import RippleChain from '../components/RippleChain.jsx'
import ComparisonView from '../components/ComparisonView.jsx'
import CitationPanel from '../components/CitationPanel.jsx'
import PageSections from '../components/PageSections.jsx'
import { useSelection, selectionAnnouncement } from '../hooks/useSelection.js'
import { useMetricData } from '../hooks/useMetricData.js'
import { METRICS } from '../utils/metrics.js'

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

export default function CyclonesPage() {
  const data = useMetricData(METRICS)
  const { selected, toggle, clear } = useSelection()

  return (
    <>
      {/* The charts and comparison view below update silently otherwise. */}
      <div aria-live="polite" className="sr-only">
        {selectionAnnouncement(selected, 'Showing its ripple chain below.')}
      </div>

      <PageSections
        sections={[
          { id: 'top', tone: 'plain', element: <Hero /> },
          { id: 'storm-profile', tone: 'plain', element: <StormProfile /> },
          { id: 'big-picture', tone: 'panel', element: <BigPicture data={data} /> },
          {
            id: 'map',
            tone: 'plain',
            element: <MapView selected={selected} onToggle={toggle} onClear={clear} />,
          },
          {
            id: 'ripple-chain',
            tone: 'plain',
            element: <RippleChain data={data} selectedNations={selected} />,
          },
          {
            id: 'compare',
            tone: 'panel',
            element: <ComparisonView data={data} selectedNations={selected} />,
          },
          { id: 'sources', tone: 'ink', element: <CitationPanel sources={DATA_SOURCES} /> },
        ]}
      />
    </>
  )
}
