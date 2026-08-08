import * as d3 from 'd3'

// Clears an SVG ref for a fresh D3 draw and returns the selection, viewBox set.
export function resetSvg(ref, width, height) {
  const svg = d3.select(ref.current)
  svg.selectAll('*').remove()
  svg.attr('viewBox', `0 0 ${width} ${height}`)
  return svg
}
