import * as d3 from 'd3'
import { SELECTION_COLORS } from './theme.js'
import { motionDuration } from './motion.js'

// Shared chart geometry -- every metric chart in RippleChain draws at
// this size inside this margin, so which chartType a metric uses
// (see metrics.js) doesn't also shift the layout of the grid it sits
// in. Sized to sit comfortably two-per-row (see RippleChain.jsx) --
// smaller than a single full-width chart used to be, so more of the
// chain is visible at once without scrolling through five large
// charts stacked in a single column.
export const CHART_WIDTH = 260
export const CHART_HEIGHT = 148
export const CHART_MARGIN = { top: 10, right: 10, bottom: 20, left: 40 }

// A gentle overshoot easing -- entrances "pop" into place with a
// slight bounce rather than just easing to a stop, matching the same
// feel as the CSS .animate-pop-in used everywhere else on the page.
const POP_EASE = d3.easeBackOut.overshoot(1.4)

function slug(nation) {
  return nation.replace(/\s+/g, '')
}

function pointTooltip(nation, year, value, format) {
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {year}: {format(value)}
      </p>
    </>
  )
}

function stormPointTooltip(row) {
  return (
    <>
      <p className="font-semibold">{row.name}</p>
      <p className="opacity-80">{row.categoryLabel}</p>
      <p className="opacity-80">
        {row.deaths} {row.deaths === 1 ? 'death' : 'deaths'}
      </p>
      <p className="mt-1 opacity-70">{row.fact}</p>
    </>
  )
}

function snapshotTooltip(row, format) {
  return (
    <>
      <p className="font-semibold">{row.nation}</p>
      <p className="opacity-80">{format(row.value)}</p>
    </>
  )
}

// Renders one metric's chart into an already-sized `svg` selection
// (see resetSvg in d3helpers.js). All three chart types share the same
// y scale/axis and the same hover/tap tooltip wiring; only how the
// marks themselves are drawn differs:
//
//   'bar'  -- grouped bars, one per year actually on record. Used for
//             the disaster metrics, which only have a handful of
//             irregularly-spaced years -- see metrics.js for why a
//             connected line would misrepresent those gaps.
//   'line' -- classic line + point markers, for metrics reported every
//             year.
//   'area' -- line + a soft fill under it, for metrics where the size
//             of a rise or drop is the point.
//
// Every mark responds to hover, tap (click), AND the shared tooltip's
// own "tap outside to dismiss" -- see useTooltip.js, and grows
// slightly on hover for a bit of direct visual feedback. Individual
// marks are deliberately not keyboard-tabbable: with up to ~18 points
// across two nations per chart, tabbing through each one would be
// tedious, and the sr-only data table alongside each chart already
// gives keyboard/screen-reader users the same numbers directly.
export function renderMetricChart(
  svg,
  { allRows, nations, valueField, chartType, format, showTooltip, hideTooltip }
) {
  const width = CHART_WIDTH
  const height = CHART_HEIGHT
  const margin = CHART_MARGIN

  // Colour is assigned by SELECTION ORDER (nations[0], nations[1]), not
  // by data-encounter order, so it always matches the map's 1 / 2
  // badges regardless of which JSON row happens to come first.
  const color = d3.scaleOrdinal(nations, SELECTION_COLORS)

  const isBand = chartType === 'bar'
  const years = Array.from(new Set(allRows.map((d) => d.year))).sort((a, b) => a - b)

  const x = isBand ? d3.scaleBand() : d3.scaleLinear()
  if (isBand) {
    x.domain(years).range([margin.left, width - margin.right]).padding(0.3)
  } else {
    x.domain(d3.extent(allRows, (d) => d.year)).range([margin.left, width - margin.right])
  }
  const x1 = isBand
    ? d3.scaleBand().domain(nations).range([0, x.bandwidth()]).padding(0.15)
    : null

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(allRows, (d) => d[valueField]) * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  // Professional/"detailed" axis treatment: soft horizontal gridlines
  // spanning the plot instead of d3's harsh default black axis lines,
  // and no left-hand domain line at all -- the gridlines already imply
  // it, so a second solid line alongside them just adds visual noise.
  const yAxisG = svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat(d3.format('~s'))
        .tickSize(-(width - margin.left - margin.right))
    )
  yAxisG.select('.domain').remove()
  yAxisG.selectAll('.tick line').attr('stroke', '#24333A').attr('stroke-opacity', 0.08)
  yAxisG
    .selectAll('.tick text')
    .attr('fill', '#24333A')
    .attr('fill-opacity', 0.65)
    .attr('font-size', 9)
    .attr('dx', -2)

  const xAxisG = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(isBand ? d3.axisBottom(x).tickSizeOuter(0) : d3.axisBottom(x).ticks(4).tickFormat(d3.format('d')))
  xAxisG.select('.domain').attr('stroke', '#24333A').attr('stroke-opacity', 0.25)
  xAxisG.selectAll('.tick line').attr('stroke', '#24333A').attr('stroke-opacity', 0.25)
  xAxisG.selectAll('.tick text').attr('fill', '#24333A').attr('fill-opacity', 0.7).attr('font-size', 9)

  function wireMarkInteractions(selection, nation, growTo) {
    selection
      .style('cursor', 'pointer')
      .on('pointerenter pointermove', function (event, d) {
        showTooltip(event, pointTooltip(nation, d.year, d[valueField], format))
        if (growTo) d3.select(this).transition().duration(motionDuration(120)).attr('r', growTo)
      })
      .on('pointerleave', function () {
        hideTooltip()
        if (growTo) d3.select(this).transition().duration(motionDuration(120)).attr('r', 3)
      })
      .on('click', (event, d) => showTooltip(event, pointTooltip(nation, d.year, d[valueField], format)))
  }

  if (chartType === 'bar') {
    for (const nation of nations) {
      const series = allRows.filter((d) => d.nation === nation)
      if (series.length === 0) continue

      const bars = svg
        .selectAll(`rect.bar-${slug(nation)}`)
        .data(series)
        .join('rect')
        .attr('class', `bar-${slug(nation)}`)
        .attr('x', (d) => x(d.year) + x1(nation))
        .attr('width', x1.bandwidth())
        .attr('y', y(0))
        .attr('height', 0)
        .attr('fill', color(nation))
        .attr('fill-opacity', 0.9)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 1.5)

      wireMarkInteractions(bars, nation, null)
      bars
        .on('pointerenter.hl', function () {
          d3.select(this).attr('stroke', color(nation)).attr('stroke-opacity', 0.4)
        })
        .on('pointerleave.hl', function () {
          d3.select(this).attr('stroke', 'transparent')
        })

      // "Pop" up from the axis with a slight bounce -- reads as bars
      // springing into place rather than just growing to a stop.
      bars
        .transition()
        .duration(motionDuration(550))
        .delay((_, i) => motionDuration(i * 45))
        .ease(POP_EASE)
        .attr('y', (d) => y(d[valueField]))
        .attr('height', (d) => Math.max(y(0) - y(d[valueField]), 0))
    }
    return
  }

  // 'line' and 'area' share the same line/point drawing; area adds a
  // fill underneath first so the line and points sit on top of it.
  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d[valueField]))
  const area = d3
    .area()
    .x((d) => x(d.year))
    .y0(y(0))
    .y1((d) => y(d[valueField]))

  for (const nation of nations) {
    const series = allRows.filter((d) => d.nation === nation).sort((a, b) => a.year - b.year)
    if (series.length === 0) continue

    if (chartType === 'area') {
      svg
        .append('path')
        .datum(series)
        .attr('fill', color(nation))
        .attr('fill-opacity', 0)
        .attr('d', area)
        .transition()
        .duration(motionDuration(500))
        .attr('fill-opacity', 0.2)
    }

    const path = svg
      .append('path')
      .datum(series)
      .attr('fill', 'none')
      .attr('stroke', color(nation))
      .attr('stroke-width', 2.25)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line)

    // Draw-in animation: hide the stroke behind its own length, then
    // reveal it -- reads as the line being drawn rather than snapping
    // in all at once. motionDuration collapses this to 0 for anyone
    // with reduced motion set.
    const totalLength = path.node().getTotalLength()
    if (totalLength > 0) {
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(motionDuration(650))
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
    }

    const points = svg
      .selectAll(`circle.point-${slug(nation)}`)
      .data(series)
      .join('circle')
      .attr('class', `point-${slug(nation)}`)
      .attr('cx', (d) => x(d.year))
      .attr('cy', (d) => y(d[valueField]))
      .attr('r', 0)
      .attr('fill', color(nation))
      .attr('stroke', '#FAF7F0')
      .attr('stroke-width', 1.5)

    wireMarkInteractions(points, nation, 5.5)

    points
      .transition()
      .delay(motionDuration(500))
      .duration(motionDuration(400))
      .ease(POP_EASE)
      .attr('r', 3)
  }
}

// Storm-profile scatter: category-at-closest-approach (x) vs. deaths
// (y), one point per nation -- see StormProfile.jsx. Deliberately a
// single uniform colour/size for every point rather than a new hue per
// nation: SELECTION_COLORS already means "pick 1 / pick 2" everywhere
// else on the page (map, ripple chain), and reusing that vocabulary
// here for an unrelated "which nation is which point" encoding would
// contradict it. Position alone carries the message this chart exists
// to make -- it doesn't need colour to do that job too.
//
// Width is deliberately narrow, same reasoning as CHART_WIDTH above:
// on a phone, an SVG sized wider than its actual on-screen container
// gets scaled DOWN by the browser (viewBox + w-full), which shrinks
// every font-size inside it along with it -- a 520px-wide chart on a
// ~330px-wide phone container renders its 9px labels at under 6px,
// unreadable. Staying at or under a typical narrow-phone content width
// means the chart is never scaled down, only ever scaled *up* on wider
// screens, the same trade CHART_WIDTH already makes.
export const STORM_CHART_WIDTH = 340
export const STORM_CHART_HEIGHT = 210
const STORM_CHART_MARGIN = { top: 16, right: 40, bottom: 34, left: 38 }
const STORM_POINT_COLOR = '#5B8FA3' // same blue as the map's marker dots

export function renderStormProfileChart(svg, { rows, showTooltip, hideTooltip }) {
  const width = STORM_CHART_WIDTH
  const height = STORM_CHART_HEIGHT
  const margin = STORM_CHART_MARGIN

  const x = d3.scaleLinear().domain([0.5, 5.5]).range([margin.left, width - margin.right])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(rows, (d) => d.deaths) * 1.2])
    .nice()
    .range([height - margin.bottom, margin.top])

  const yAxisG = svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat(d3.format('d'))
        .tickSize(-(width - margin.left - margin.right))
    )
  yAxisG.select('.domain').remove()
  yAxisG.selectAll('.tick line').attr('stroke', '#24333A').attr('stroke-opacity', 0.08)
  yAxisG
    .selectAll('.tick text')
    .attr('fill', '#24333A')
    .attr('fill-opacity', 0.65)
    .attr('font-size', 9)
    .attr('dx', -2)

  const xAxisG = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')))
  xAxisG.select('.domain').attr('stroke', '#24333A').attr('stroke-opacity', 0.25)
  xAxisG.selectAll('.tick line').attr('stroke', '#24333A').attr('stroke-opacity', 0.25)
  xAxisG.selectAll('.tick text').attr('fill', '#24333A').attr('fill-opacity', 0.7).attr('font-size', 9)

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', height - 6)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', '#24333A')
    .attr('fill-opacity', 0.6)
    .text('Storm category at closest approach')

  svg
    .append('text')
    .attr('transform', `translate(12, ${height / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', '#24333A')
    .attr('fill-opacity', 0.6)
    .text('Deaths')

  // `dodge` is a rendering-only x nudge for Fiji/Tonga, which were both
  // Category 4 at closest approach -- without it their points and
  // labels would sit on top of each other. The category value in the
  // tooltip and the sr-only table is the real, undodged number.
  const points = svg
    .selectAll('circle.storm-point')
    .data(rows)
    .join('circle')
    .attr('class', 'storm-point')
    .attr('cx', (d) => x(d.category + (d.dodge ?? 0)))
    .attr('cy', (d) => y(d.deaths))
    .attr('r', 0)
    .attr('fill', STORM_POINT_COLOR)
    .attr('fill-opacity', 0.85)
    .attr('stroke', '#FAF7F0')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .on('pointerenter pointermove', function (event, d) {
      showTooltip(event, stormPointTooltip(d))
      d3.select(this).transition().duration(motionDuration(120)).attr('r', 9)
    })
    .on('pointerleave', function () {
      hideTooltip()
      d3.select(this).transition().duration(motionDuration(120)).attr('r', 6)
    })
    .on('click', (event, d) => showTooltip(event, stormPointTooltip(d)))

  points
    .transition()
    .delay((_, i) => motionDuration(i * 90))
    .duration(motionDuration(450))
    .ease(POP_EASE)
    .attr('r', 6)

  svg
    .selectAll('text.storm-label')
    .data(rows)
    .join('text')
    .attr('class', 'storm-label')
    .attr('x', (d) => x(d.category + (d.dodge ?? 0)) + 9)
    .attr('y', (d) => y(d.deaths) - 9)
    .attr('font-size', 9)
    .attr('fill', '#24333A')
    .attr('fill-opacity', 0)
    .text((d) => d.name)
    .transition()
    .delay((_, i) => motionDuration(300 + i * 90))
    .duration(motionDuration(300))
    .attr('fill-opacity', 0.75)
}

// "Every nation, every metric" snapshot bars in BigPicture.jsx: one bar
// per nation, all at the same fixed year (EVENT_YEAR), no time axis at
// all -- the point is the gap between nations *right now*, not a trend.
// Reuses CHART_WIDTH/CHART_HEIGHT/CHART_MARGIN so it sits at the same
// size as the ripple-chain charts below it on the page.
//
// One uniform bar colour rather than a colour per nation, same
// reasoning as the storm-profile chart above: SELECTION_COLORS already
// means "pick 1 / pick 2" everywhere else, and this chart always shows
// all four nations regardless of what's selected, so borrowing that
// colour vocabulary here would contradict it. Nation names live on the
// x-axis instead.
const SNAPSHOT_BAR_COLOR = '#5B8FA3' // same neutral blue as the map's marker dots and the storm-profile points

export function renderSnapshotChart(svg, { rows, format, showTooltip, hideTooltip }) {
  const width = CHART_WIDTH
  const height = CHART_HEIGHT
  const margin = CHART_MARGIN

  const x = d3
    .scaleBand()
    .domain(rows.map((d) => d.nation))
    .range([margin.left, width - margin.right])
    .padding(0.3)
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(rows, (d) => d.value) * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  const yAxisG = svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat(d3.format('~s'))
        .tickSize(-(width - margin.left - margin.right))
    )
  yAxisG.select('.domain').remove()
  yAxisG.selectAll('.tick line').attr('stroke', '#24333A').attr('stroke-opacity', 0.08)
  yAxisG
    .selectAll('.tick text')
    .attr('fill', '#24333A')
    .attr('fill-opacity', 0.65)
    .attr('font-size', 9)
    .attr('dx', -2)

  const xAxisG = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat((d) => d.split(' ')[0]))
  xAxisG.select('.domain').attr('stroke', '#24333A').attr('stroke-opacity', 0.25)
  xAxisG.selectAll('.tick line').attr('stroke', '#24333A').attr('stroke-opacity', 0.25)
  xAxisG.selectAll('.tick text').attr('fill', '#24333A').attr('fill-opacity', 0.7).attr('font-size', 9)

  const bars = svg
    .selectAll('rect.snapshot-bar')
    .data(rows)
    .join('rect')
    .attr('class', 'snapshot-bar')
    .attr('x', (d) => x(d.nation))
    .attr('width', x.bandwidth())
    .attr('y', y(0))
    .attr('height', 0)
    .attr('fill', SNAPSHOT_BAR_COLOR)
    .attr('fill-opacity', 0.9)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .on('pointerenter pointermove', function (event, d) {
      showTooltip(event, snapshotTooltip(d, format))
      d3.select(this).attr('stroke', SNAPSHOT_BAR_COLOR).attr('stroke-opacity', 0.4)
    })
    .on('pointerleave', function () {
      hideTooltip()
      d3.select(this).attr('stroke', 'transparent')
    })
    .on('click', (event, d) => showTooltip(event, snapshotTooltip(d, format)))

  bars
    .transition()
    .duration(motionDuration(550))
    .delay((_, i) => motionDuration(i * 70))
    .ease(POP_EASE)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => Math.max(y(0) - y(d.value), 0))
}
