export function SolCounterLED({ sol }: { sol: number }) {
  return <output className="cabin-sol" aria-label={`Sol ${sol}`}><small>SOL</small>{String(sol).padStart(3, '0')}</output>;
}
