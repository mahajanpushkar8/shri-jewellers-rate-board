export default function CornerOrnament({ className = '' }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2 L2 16 M2 2 L16 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="2" cy="2" r="3" fill="currentColor" />
      <path
        d="M9 9 L20 20"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx="22" cy="22" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
