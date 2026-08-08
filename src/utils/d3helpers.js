import * as d3 from 'd3'

// Clears and re-initializes an SVG ref for a fresh D3 draw, returning
// the cleared d3 selection with its viewBox set. Shared by every
// component that owns an SVG (MapView, StormProfile, the two chart
// cards) so this three-line setup isn't repeated in each.
export function resetSvg(ref, width, height) {
  const svg = d3.select(ref.current)
  svg.selectAll('*').remove()
  svg.attr('viewBox', `0 0 ${width} ${height}`)
  return svg
}
