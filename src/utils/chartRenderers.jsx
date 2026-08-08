import * as d3 from 'd3'
import { SELECTION_COLORS, CHART_INK, CHART_SURFACE } from './theme.js'
import { motionDuration } from './motion.js'

export const CHART_WIDTH = 260
export const CHART_HEIGHT = 148
export const CHART_MARGIN = { top: 10, right: 10, bottom: 20, left: 40 }

const POP_EASE = d3.easeBackOut.overshoot(1.4)

function slug(nation) {
  return nation.replace(/\s+/g, '')
}

// Axis labels use only the first word of a nation's name -- "Marshall",
// not "Marshall Islands" -- so six labels fit under a 260px chart.
function firstWord(nation) {
  return nation.split(' ')[0]
}

// Every metric this file originally charted (people affected, USD
// loss, crop yield, tourist arrivals, GWh) is non-negative, so the
// y-domain was always simply [0, max*1.1] -- a bar or line could only
// ever go up from a zero floor. That stopped being true once this
// file started also charting metrics that are signed by definition
// (SPI/SPEI drought indices, sea-level anomaly -- see
// droughtMetrics.js/seaLevelMetrics.js): a value like -1 needs to
// extend the domain *below* zero, or it silently falls outside the
// scale's domain and any bar for it collapses to zero height (a d3
// linear scale still returns a pixel position for an out-of-domain
// input, but the bar-height math below assumes y(0) is always the
// larger of the two pixel values, which is only true when nothing in
// the data is negative).
//
// Keeps the exact original [0, max*1.1] result whenever every value
// really is >= 0 (Math.min(0, ...allValues) is then just 0), so none
// of the existing non-negative charts change by a single pixel.
function zeroAnchoredDomain(values) {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  return [dataMin < 0 ? dataMin * 1.1 : 0, dataMax * 1.1]
}

// A bar's top-left y and its height, for a value that may be above or
// below the zero baseline -- d3's linear scale maps a larger domain
// value to a *smaller* pixel y (SVG y grows downward), so which of
// y(0)/y(value) is the bar's top depends on the value's sign. Used by
// both this file's bar-chart branch and renderSnapshotChart below,
// rather than each duplicating the min/abs logic.
function barTopAndHeight(y, value) {
  const yZero = y(0)
  const yValue = y(value)
  return { top: Math.min(yZero, yValue), height: Math.abs(yZero - yValue) }
}

const INT_FORMAT = d3.format('d')

// The three charts in this file share one axis look: no y-domain line,
// faint full-width gridlines, small ink-coloured tick text tracking the
// current theme. Only the tick generators differ, so callers build the
// axis and these two apply the styling.
function drawYAxis(svg, y, { ink, width, margin, tickFormat }) {
  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat(tickFormat)
        .tickSize(-(width - margin.left - margin.right))
    )
  g.select('.domain').remove()
  g.selectAll('.tick line').attr('stroke', ink).attr('stroke-opacity', 0.08)
  g.selectAll('.tick text')
    .attr('fill', ink)
    .attr('fill-opacity', 0.65)
    .attr('font-size', 9)
    .attr('dx', -2)
  return g
}

function drawXAxis(svg, axis, { ink, height, margin }) {
  const g = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(axis)
  g.select('.domain').attr('stroke', ink).attr('stroke-opacity', 0.25)
  g.selectAll('.tick line').attr('stroke', ink).attr('stroke-opacity', 0.25)
  g.selectAll('.tick text').attr('fill', ink).attr('fill-opacity', 0.7).attr('font-size', 9)
  return g
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

export function renderMetricChart(
  svg,
  {
    allRows,
    nations,
    valueField,
    chartType,
    format,
    showTooltip,
    hideTooltip,
    yTickFormat = d3.format('~s'),
    theme = 'light',
  }
) {
  const width = CHART_WIDTH
  const height = CHART_HEIGHT
  const margin = CHART_MARGIN
  // Axis text/gridlines/point-halos are the only marks in this chart
  // that were ever literally ink/sand-coloured -- the bars/lines/
  // points themselves use SELECTION_COLORS, a fixed accent pair
  // that's already legible on both a light and a dark card (see
  // theme.js). Callers pass the current theme (see useTheme.jsx) so
  // these two stay correct without needing a redraw hack beyond the
  // normal "theme is a dependency of the draw effect" each chart-
  // owning component already does.
  const ink = CHART_INK[theme] ?? CHART_INK.light
  const surface = CHART_SURFACE[theme] ?? CHART_SURFACE.light

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
    .domain(zeroAnchoredDomain(allRows.map((d) => d[valueField])))
    .nice()
    .range([height - margin.bottom, margin.top])

  drawYAxis(svg, y, { ink, width, margin, tickFormat: yTickFormat })
  drawXAxis(
    svg,
    isBand ? d3.axisBottom(x).tickSizeOuter(0) : d3.axisBottom(x).ticks(4).tickFormat(INT_FORMAT),
    { ink, height, margin }
  )

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

      bars
        .transition()
        .duration(motionDuration(550))
        .delay((_, i) => motionDuration(i * 45))
        .ease(POP_EASE)
        .attr('y', (d) => barTopAndHeight(y, d[valueField]).top)
        .attr('height', (d) => barTopAndHeight(y, d[valueField]).height)
    }
    return
  }

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
      .attr('stroke', surface)
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

export const STORM_CHART_WIDTH = 340
export const STORM_CHART_HEIGHT = 210
const STORM_CHART_MARGIN = { top: 16, right: 40, bottom: 34, left: 38 }
const STORM_POINT_COLOR = '#5B8FA3'

export function renderStormProfileChart(svg, { rows, showTooltip, hideTooltip, theme = 'light' }) {
  const width = STORM_CHART_WIDTH
  const height = STORM_CHART_HEIGHT
  const margin = STORM_CHART_MARGIN
  const ink = CHART_INK[theme] ?? CHART_INK.light
  const surface = CHART_SURFACE[theme] ?? CHART_SURFACE.light

  const x = d3.scaleLinear().domain([0.5, 5.5]).range([margin.left, width - margin.right])
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(rows, (d) => d.deaths) * 1.2])
    .nice()
    .range([height - margin.bottom, margin.top])

  drawYAxis(svg, y, { ink, width, margin, tickFormat: INT_FORMAT })
  drawXAxis(svg, d3.axisBottom(x).ticks(5).tickFormat(INT_FORMAT), { ink, height, margin })

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', height - 6)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', ink)
    .attr('fill-opacity', 0.6)
    .text('Storm category at closest approach')

  svg
    .append('text')
    .attr('transform', `translate(12, ${height / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', ink)
    .attr('fill-opacity', 0.6)
    .text('Deaths')

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
    .attr('stroke', surface)
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
    .attr('fill', ink)
    .attr('fill-opacity', 0)
    .text((d) => d.name)
    .transition()
    .delay((_, i) => motionDuration(300 + i * 90))
    .duration(motionDuration(300))
    .attr('fill-opacity', 0.75)
}

const SNAPSHOT_BAR_COLOR = '#5B8FA3'

export function renderSnapshotChart(
  svg,
  { rows, format, showTooltip, hideTooltip, yTickFormat = d3.format('~s'), theme = 'light' }
) {
  const width = CHART_WIDTH
  const height = CHART_HEIGHT
  const margin = CHART_MARGIN
  const ink = CHART_INK[theme] ?? CHART_INK.light

  const x = d3
    .scaleBand()
    .domain(rows.map((d) => d.nation))
    .range([margin.left, width - margin.right])
    .padding(0.3)
  const y = d3
    .scaleLinear()
    .domain(zeroAnchoredDomain(rows.map((d) => d.value)))
    .nice()
    .range([height - margin.bottom, margin.top])

  drawYAxis(svg, y, { ink, width, margin, tickFormat: yTickFormat })
  drawXAxis(svg, d3.axisBottom(x).tickSizeOuter(0).tickFormat(firstWord), { ink, height, margin })

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
    .attr('y', (d) => barTopAndHeight(y, d.value).top)
    .attr('height', (d) => barTopAndHeight(y, d.value).height)
}
