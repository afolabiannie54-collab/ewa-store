function StarIcon({ fill, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <defs>
        <clipPath id={`half-${props.id}`}>
          <rect x="0" y="0" width={fill * 24} height="24" />
        </clipPath>
      </defs>
      <path
        d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7L12 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {fill > 0 && (
        <path
          d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7L12 2.5Z"
          fill="currentColor"
          clipPath={`url(#half-${props.id})`}
        />
      )}
    </svg>
  )
}

export default function StarRating({ rating = 0, size = 18, className = '' }) {
  const stars = [1, 2, 3, 4, 5].map(i => {
    const fillAmount = Math.max(0, Math.min(1, rating - (i - 1)))
    return fillAmount
  })

  return (
    <div className={`flex items-center gap-0.5 text-olive ${className}`}>
      {stars.map((fill, i) => (
        <StarIcon
          key={i}
          id={`star-${i}-${rating}`}
          fill={fill}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )
}