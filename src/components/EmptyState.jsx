import Section from './Section.jsx'

// Shared "nothing to show yet" message -- used by RippleChain and
// ComparisonView instead of each repeating their own Section + <p>.
// `tone` must match whatever tone the real content in the same slot
// uses (e.g. ComparisonView passes 'panel' since its filled-in state
// does) -- otherwise the PacificBorder divider immediately above,
// which is told a fixed tone per section in App.jsx, would mismatch
// the background actually rendered while this placeholder is showing.
// `style` is forwarded straight through to Section, which is where the
// entrance stagger and pop-in animation live.
export default function EmptyState({ tone, style, children }) {
  return (
    <Section tone={tone} style={style}>
      <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">{children}</p>
    </Section>
  )
}
