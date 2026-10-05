import React from 'react';

interface DhruvUrjaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const DhruvUrjaLogo: React.FC<DhruvUrjaLogoProps> = ({
  className = '',
  size = 40,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Circular Snowflake Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        role="img"
        aria-label="Dhruv Urja Emblem"
      >
        {/* Top Saffron / Orange Arc */}
        <path
          d="M 23 68 A 62 62 0 0 1 137 68"
          stroke="#F97316"
          strokeWidth="8.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bottom Green Arc */}
        <path
          d="M 23 92 A 62 62 0 0 0 137 92"
          stroke="#16A34A"
          strokeWidth="8.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Deep Navy Blue Center Circle */}
        <circle cx="80" cy="80" r="51" fill="#1E3A68" />

        {/* Snowflake / Polar Star Symmetrical Structure (White) */}
        <g stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round">
          {/* Vertical Arm (0° / 180°) */}
          <line x1="80" y1="42" x2="80" y2="118" />
          <path d="M 70 54 L 80 46 L 90 54" fill="none" />
          <path d="M 70 106 L 80 114 L 90 106" fill="none" />

          {/* 60° / 240° Arm */}
          <line x1="47.1" y1="61" x2="112.9" y2="99" />
          <path d="M 53 50 L 49 61 L 60 66" fill="none" />
          <path d="M 100 94 L 111 99 L 107 110" fill="none" />

          {/* 120° / 300° Arm */}
          <line x1="47.1" y1="99" x2="112.9" y2="61" />
          <path d="M 60 94 L 49 99 L 53 110" fill="none" />
          <path d="M 107 50 L 111 61 L 100 66" fill="none" />

          {/* Tips Rounded Dots */}
          <circle cx="80" cy="39" r="2.8" fill="#FFFFFF" />
          <circle cx="80" cy="121" r="2.8" fill="#FFFFFF" />
          <circle cx="44.5" cy="59.5" r="2.8" fill="#FFFFFF" />
          <circle cx="115.5" cy="100.5" r="2.8" fill="#FFFFFF" />
          <circle cx="44.5" cy="100.5" r="2.8" fill="#FFFFFF" />
          <circle cx="115.5" cy="59.5" r="2.8" fill="#FFFFFF" />
        </g>

        {/* Central Golden-Orange 4-Pointed Star Core */}
        <path
          d="M 80 65 Q 80 80 65 80 Q 80 80 80 95 Q 80 80 95 80 Q 80 80 80 65 Z"
          fill="#F59E0B"
        />
        <circle cx="80" cy="80" r="2.5" fill="#FEF3C7" />
      </svg>

      {/* Reduced Proportional Typography Lockup */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="font-extrabold text-base sm:text-lg text-[#1E3A68] dark:text-blue-100 tracking-wider font-sans">
            DHRUV URJA
          </div>
          <div className="font-bold text-xs text-[#C2410C] dark:text-amber-400 mt-0.5">
            ध्रुव ऊर्जा
          </div>
        </div>
      )}
    </div>
  );
};
