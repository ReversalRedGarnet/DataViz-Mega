// Oxford-comma list grammar, e.g. "A, B, and C" -- shared by every
// "regional snapshot" chart, since more than 2 nations can be missing
// data for the same moment simultaneously (unlike the 2-nation-max
// comparison views elsewhere on the site, which never needed proper
// list grammar for more than "A and B").
export function formatNationList(names) {
  if (names.length <= 1) return names.join('')
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}
