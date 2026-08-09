export default function DiamondDivider() {
  return (
    <div className="diamond-divider" role="presentation">
      <span className="diamond-divider__line" />
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="currentColor" />
      </svg>
      <span className="diamond-divider__line" />
    </div>
  )
}
