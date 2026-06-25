export default function EmptyWishlistIllustration() {
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" aria-hidden="true">
      <circle cx="45" cy="60" r="14" fill="#606C38" opacity="0.12" />
      <circle cx="235" cy="190" r="20" fill="#283618" opacity="0.08" />
      <circle cx="225" cy="55" r="7" fill="#606C38" opacity="0.25" />
      <circle cx="50" cy="220" r="9" fill="#283618" opacity="0.18" />

      {/* Wand body */}
      <line x1="62" y1="232" x2="168" y2="118" stroke="#606C38" strokeWidth="5.5" strokeLinecap="round" />

      {/* Grip bands */}
      <line x1="83" y1="198" x2="94" y2="211" stroke="#606C38" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <line x1="91" y1="191" x2="102" y2="204" stroke="#606C38" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />

      {/* Pommel */}
      <circle cx="62" cy="232" r="6.5" fill="#FFFFFF" stroke="#606C38" strokeWidth="2.5" />

      {/* Main star at wand tip — center (178,92) outer r=22 inner r=9 */}
      <path
        d="M178,70 L183,85 L199,85 L187,95 L191,110 L178,101 L165,110 L169,95 L157,85 L173,85 Z"
        fill="#FFFFFF"
        stroke="#606C38"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Shimmer trails from star */}
      <path d="M182,70 Q210,47 236,35" fill="none" stroke="#D6CEB8" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" />
      <path d="M200,87 Q222,74 242,67" fill="none" stroke="#D6CEB8" strokeWidth="1" strokeDasharray="2 4" strokeLinecap="round" />

      {/* 4-pointed sparkle — upper mid-right */}
      <path d="M225,59 L227,66 L234,68 L227,70 L225,77 L223,70 L216,68 L223,66 Z" fill="#606C38" opacity="0.22" />

      {/* 4-pointed sparkle — upper left */}
      <path d="M100,61 L101.5,66.5 L107,68 L101.5,69.5 L100,75 L98.5,69.5 L93,68 L98.5,66.5 Z" fill="#606C38" opacity="0.20" />

      {/* 4-pointed sparkle — right lower, small */}
      <path d="M248,173 L249,177 L253,178 L249,179 L248,183 L247,179 L243,178 L247,177 Z" fill="#606C38" opacity="0.18" />

      {/* 4-pointed sparkle — left mid, small */}
      <path d="M55,148 L55.8,151.2 L59,152 L55.8,152.8 L55,156 L54.2,152.8 L51,152 L54.2,151.2 Z" fill="#283618" opacity="0.20" />

      {/* Floating 5-pointed star outline — lower left of wand */}
      <path
        d="M115,139 L117,145 L124,145 L118,149 L120,155 L115,152 L110,155 L112,149 L106,145 L113,145 Z"
        fill="none"
        stroke="#606C38"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.38"
      />

      {/* Tiny solid 5-pointed star — right side */}
      <path
        d="M230,129 L231,133 L236,133 L232,136 L234,140 L230,138 L226,140 L228,136 L224,133 L229,133 Z"
        fill="#606C38"
        opacity="0.18"
      />

      {/* Dot particles */}
      <circle cx="205" cy="162" r="2.5" fill="#606C38" opacity="0.20" />
      <circle cx="140" cy="85" r="2" fill="#606C38" opacity="0.28" />
      <circle cx="147" cy="108" r="1.5" fill="#606C38" opacity="0.18" />
      <circle cx="90" cy="130" r="2" fill="#283618" opacity="0.15" />
    </svg>
  )
}
