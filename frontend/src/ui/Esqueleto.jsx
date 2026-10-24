export default function Esqueleto({ cantidad = 4, className = 'h-80' }) {
  return Array.from({ length: cantidad }, (_, i) => (
    <div key={i} aria-hidden="true" className={`rounded-3xl bg-esqueleto motion-safe:animate-pulse ${className}`} />
  ))
}
