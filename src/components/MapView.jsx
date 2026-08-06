import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MapControlIcon from './MapControlIcon.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { SELECTION_COLORS } from '../utils/theme.js'
import { resetSvg } from '../utils/d3helpers.js'
import { motionDuration } from '../utils/motion.js'

// Illustrative Pacific map: real coastlines with fixed markers on top,
// pan + zoom via d3-zoom, click to select up to two nations. No tile
// server, no API key -- the coastline file at public/land-50m.json is a
// static export from the 'world-atlas' npm package (50m resolution;
// re-copy node_modules/world-atlas/land-50m.json there if it's ever
// missing), fetched once at runtime rather than bundled into the JS so
// it doesn't bloat the main bundle or block the initial page render.
//
// Locked nation set -- the four countries Cyclone Harold hit in April
// 2020, see README.md -> "Scope (locked)". Coordinates are approximate
// (capital city), fine for an illustrative map, not for navigation.
// `blurb` feeds the marker tooltip -- one line of real context per
// nation instead of just the bare name a native <title> gave before.
export const NATIONS = [
  { name: 'Fiji', lat: -18.14, lon: 178.44, blurb: 'Struck by the same cyclone; moderate, uneven impact.' },
  {
    name: 'Solomon Islands',
    lat: -9.43,
    lon: 159.95,
    blurb: 'A different kind of impact that same week: a ferry capsize, not storm strength.',
  },
  { name: 'Vanuatu', lat: -17.73, lon: 168.32, blurb: 'Hit hardest by Cyclone Harold, April 2020.' },
  { name: 'Tonga', lat: -21.14, lon: -175.2, blurb: 'The lightest direct impact of the four.' },
]

const WIDTH = 700
const HEIGHT = 460

// Builds the tooltip content for a marker from current selection state,
// so the same "tap to select / tap to compare / tap to deselect" hint
// stays accurate no matter when the hover/focus/tap happens.
function markerTooltipContent(nation, selected) {
  const i = selected.indexOf(nation.name)
  let status
  if (i !== -1) status = 'Selected -- tap again to deselect.'
  else if (selected.length >= 2) status = 'Tap to swap into the comparison.'
  else if (selected.length === 1) status = 'Tap to compare with your first pick.'
  else status = 'Tap to select.'

  return (
    <>
      <p className="font-semibold">{nation.name}</p>
      <p className="opacity-80">{nation.blurb}</p>
      <p className="mt-1 opacity-70">{status}</p>
    </>
  )
}

// Props:
//   selected -- array of up to two nation names, in the order picked
//   onToggle -- (name) => void, called on marker click / Enter / Space
//   onClear -- () => void, clears the current selection
//   style -- forwarded to the underlying Section, used by App.jsx to
//     stagger each section's entrance on first load
export default function MapView({ selected, onToggle, onClear, style }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  // The marker-setup effect below runs once on mount (see the comment
  // at its end), so its D3 event closures would otherwise capture
  // `selected` at that moment and never see later selections. Reading
  // through a ref keeps the tooltip's "tap to compare / deselect" hint
  // current without rebuilding the whole map -- which would reset the
  // user's pan/zoom position -- on every selection change.
  const selectedRef = useRef(selected)
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  // Build the map once: basemap, projection, markers, zoom behaviour.
  // Selection colour updates happen in the effect below so panning/
  // zooming isn't reset every time a marker is clicked. The coastline
  // fetch is async, so the rest of setup runs inside it once that
  // resolves; `cancelled` guards against touching anything after
  // unmount if that happens before the fetch finishes.
  useEffect(() => {
    let cancelled = false

    async function setup() {
      const land50m = await fetch('/land-50m.json').then((res) => res.json())
      if (cancelled || !svgRef.current) return

      const svg = resetSvg(svgRef, WIDTH, HEIGHT)

      // Rotate so the antimeridian (180 deg) sits at the projection's
      // centre. Without this, nations on opposite sides of 180 deg
      // longitude (e.g. Fiji at +178 vs Samoa at -172) render on
      // opposite edges of the map instead of near each other.
      const projection = d3.geoMercator().rotate([-180, 0])

      const points = {
        type: 'FeatureCollection',
        features: NATIONS.map((n) => ({
          type: 'Feature',
          properties: { name: n.name },
          geometry: { type: 'Point', coordinates: [n.lon, n.lat] },
        })),
      }
      // Fitted to our 4 markers, not the whole world, so the initial
      // view stays zoomed into the Pacific rather than zoomed out to
      // fit every continent. Padding is generous (65px, not the more
      // typical ~40) so labels and the zoom-control buttons in the
      // corner have breathing room and don't crowd markers near the
      // edge (Tonga sits closest to that corner).
      projection.fitExtent(
        [
          [65, 65],
          [WIDTH - 65, HEIGHT - 65],
        ],
        points
      )

      const g = svg.append('g')
      gRef.current = g

      // Ocean background, then real coastlines drawn through the same
      // projection -- anything outside the viewBox is simply cropped,
      // same as any regional map. A stronger, more saturated blue than
      // the decorative ocean-light token so the ocean reads clearly at
      // a glance rather than blending toward white.
      g.append('rect')
        .attr('x', -2000)
        .attr('y', -2000)
        .attr('width', WIDTH + 4000)
        .attr('height', HEIGHT + 4000)
        .attr('fill', '#7FBFD9')

      const geoPath = d3.geoPath(projection)
      const landFeature = feature(land50m, land50m.objects.land)
      g.append('path')
        .datum(landFeature)
        .attr('d', geoPath)
        .attr('fill', '#FAF7F0')
        .attr('stroke', '#C9DCE2')
        .attr('stroke-width', 0.5)

      // Drag-to-pan and touch pinch-to-zoom stay on. Mouse-wheel /
      // trackpad scroll is deliberately excluded from triggering zoom
      // (see the filter below) so scrolling PAST the map on the page
      // doesn't accidentally zoom it -- zooming only ever happens via
      // touch pinch or the +/- buttons below.
      const zoom = d3
        .zoom()
        .scaleExtent([1, 6])
        .filter((event) => event.type !== 'wheel')
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
      zoomRef.current = zoom
      svg.call(zoom)

      const marker = g
        .selectAll('g.marker')
        .data(NATIONS)
        .join('g')
        .attr('class', 'marker')
        .attr('transform', (d) => {
          const [x, y] = projection([d.lon, d.lat])
          return `translate(${x},${y})`
        })
        .attr('role', 'button')
        .attr('tabindex', 0)
        .attr('aria-label', (d) => `Select ${d.name}`)
        .on('click', (event, d) => {
          onToggle(d.name)
          // selectedRef hasn't updated for this toggle yet, but the
          // status line is one beat behind for a single tap at most --
          // the next hover/focus/tap shows the settled state.
          showTooltip(event, markerTooltipContent(d, selectedRef.current))
        })
        .on('keydown', (event, d) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle(d.name)
          }
        })
        .on('pointerenter pointermove', (event, d) => {
          showTooltip(event, markerTooltipContent(d, selectedRef.current))
        })
        .on('pointerleave', hideTooltip)
        .on('focus', (event, d) => {
          showTooltip(event, markerTooltipContent(d, selectedRef.current))
        })
        .on('blur', hideTooltip)

      // Larger invisible circle purely so touch/mouse users get a
      // comfortable tap target -- doesn't change the visible dot size.
      // pointer-events is set explicitly so it's clickable despite
      // being transparent.
      marker
        .append('circle')
        .attr('class', 'marker-hit')
        .attr('r', 18)
        .attr('fill', 'transparent')
        .attr('pointer-events', 'all')

      marker
        .append('circle')
        .attr('class', 'marker-dot')
        .attr('r', 7)
        .attr('fill', '#5B8FA3')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .style('transition', 'r 150ms ease-out')

      marker
        .append('text')
        .attr('class', 'marker-badge')
        .attr('text-anchor', 'middle')
        .attr('y', 4)
        .attr('font-size', 9)
        .attr('font-weight', 700)
        .attr('fill', 'white')
        .style('pointer-events', 'none')

      marker
        .append('text')
        .attr('class', 'marker-label')
        .text((d) => d.name)
        .attr('x', 12)
        .attr('y', 4)
        .attr('font-size', 11)
        .attr('fill', 'currentColor')
        .style('pointer-events', 'none')

      // A little hover/focus "grow" on the dot itself -- cheap visual
      // feedback that something is interactive, on top of the tooltip.
      // Shrinks back to whichever resting size is currently correct
      // (8.5 if selected, 7 if not) via selectedRef, rather than a
      // fixed value, since the selection-driven pop below can leave a
      // marker at either size.
      marker
        .on('pointerenter.grow', function () {
          d3.select(this).select('circle.marker-dot').attr('r', 10)
        })
        .on('pointerleave.grow', function (event, d) {
          const resting = selectedRef.current.includes(d.name) ? 8.5 : 7
          d3.select(this).select('circle.marker-dot').attr('r', resting)
        })
    }

    setup()
    return () => {
      cancelled = true
    }
    // Runs once on mount -- see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recolour markers and show a 1 / 2 badge on selection change, without
  // rebuilding the map (which would reset the user's pan/zoom position).
  // Colour transitions and the dot gives a small bounce (overshoot past
  // its resting size, then settle) rather than snapping instantly, so
  // picking a country reads as a definite "pop" of confirmation.
  useEffect(() => {
    if (!gRef.current) return
    const markers = gRef.current.selectAll('g.marker')
    const duration = motionDuration(200)

    markers
      .select('circle.marker-dot')
      .transition()
      .duration(duration)
      .attr('fill', (d) => {
        const i = selected.indexOf(d.name)
        return i === -1 ? '#5B8FA3' : SELECTION_COLORS[i]
      })
      .transition()
      .duration(motionDuration(180))
      .ease(d3.easeBackOut.overshoot(2.5))
      .attr('r', (d) => (selected.includes(d.name) ? 8.5 : 7))

    markers
      .select('text.marker-badge')
      .text((d) => {
        const i = selected.indexOf(d.name)
        return i === -1 ? '' : String(i + 1)
      })
  }, [selected])

  function zoomBy(factor) {
    if (!zoomRef.current || !svgRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(motionDuration(200))
      .call(zoomRef.current.scaleBy, factor)
  }

  function resetView() {
    if (!zoomRef.current || !svgRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(motionDuration(200))
      .call(zoomRef.current.transform, d3.zoomIdentity)
  }

  return (
    <Section style={style}>
      <h2 className="mb-2 text-xl font-semibold">Explore the Pacific</h2>
      <p className="mb-3 text-sm opacity-70">
        Tap a marker to select it, tap a second one to compare. Drag to pan, pinch to zoom, or use
        the buttons.
      </p>
      <div ref={containerRef} className="relative">
        {/* overflow-hidden is required, not decorative -- the ocean
            background rect below is deliberately drawn far past the
            viewBox (see the +/-2000/4000 rect in the setup effect) so
            panning never reveals empty space. Without an explicit
            clip, that oversized rect's own unclipped layout box was
            what was actually pushing the whole page into horizontal
            overflow on every screen size: an SVG's viewBox scales
            what's drawn, but doesn't by itself guarantee the browser
            clips content past it, and a descendant's laid-out
            dimensions still count toward the page's scrollable area
            even where they're painted over/invisible. This also
            happens to be needed for the rounded-2xl corners below to
            actually round the map's contents, not just its border. */}
        <svg
          ref={svgRef}
          role="img"
          aria-label="Map of the Pacific with four selectable nations"
          className="h-auto w-full overflow-hidden rounded-2xl border-2 border-ink/15 shadow-sm"
        />
        {/* Top-right, not bottom-right: Tonga's marker sits in the
            map's bottom-right quadrant (see NATIONS above), close
            enough to the corner that the taller 44px button column
            (see the touch-target note below) started covering its
            label. Nothing occupies the top-right quadrant, so the
            controls sit there instead rather than shrinking back
            down to reclaim the corner. */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {/* 44px (h-11 w-11), not the 36px these used to be -- the
              commonly-cited comfortable minimum touch target size, and
              the one real ergonomics gap the mobile pass turned up:
              these are the only tap targets on the page smaller than
              that, on the one section where a mis-tap (zooming instead
              of panning) is most disruptive. */}
          <button
            type="button"
            onClick={() => zoomBy(1.5)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-white/70 active:scale-90"
            aria-label="Zoom in"
          >
            <MapControlIcon kind="zoomIn" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.5)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-white/70 active:scale-90"
            aria-label="Zoom out"
          >
            <MapControlIcon kind="zoomOut" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-white/70 active:scale-90"
            aria-label="Reset view"
          >
            <MapControlIcon kind="reset" />
          </button>
        </div>
        <Tooltip tooltip={tooltip} />
      </div>
      <div className="mt-3 min-h-[1.25rem]">
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="animate-pop-in text-sm opacity-70 underline transition-opacity duration-150 hover:opacity-100"
          >
            Clear selection
          </button>
        )}
      </div>
    </Section>
  )
}
