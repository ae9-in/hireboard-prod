import React from 'react';
import Link from 'next/link';

/**
 * The brand icon mark (Stylized "H" with list pills and upward-pointing arrow)
 */
export function LogoIcon({ className = "h-8 w-8", ...props }) {
  return (
    <svg 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Left Pillar */}
      <rect x="23" y="23" width="11" height="74" rx="5.5" fill="currentColor" />
      
      {/* Right Pillar (Arrow) */}
      <rect x="86" y="38" width="11" height="59" rx="5.5" fill="currentColor" />
      {/* Upward Arrowhead */}
      <path 
        d="M91.5 11L108 34H75L91.5 11Z" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      
      {/* Center Horizontal Bridge */}
      <rect x="34" y="57" width="52" height="6" fill="currentColor" />
      
      {/* Three Stacked Pills (List/Board) */}
      <rect x="47" y="31" width="26" height="12" rx="6" fill="currentColor" stroke="white" strokeWidth="2.5" />
      <rect x="47" y="54" width="26" height="12" rx="6" fill="currentColor" stroke="white" strokeWidth="2.5" />
      <rect x="47" y="77" width="26" height="12" rx="6" fill="currentColor" stroke="white" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Combined Logo Mark + Text Brand Component
 */
export default function Logo({ 
  className = "", 
  iconClassName = "h-8 w-8 text-accent", 
  textClassName = "text-xl font-extrabold tracking-tight text-ink",
  textColor = "dark" // "dark" (Navbar/Header) or "light" (Footer)
}) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoIcon className={iconClassName} />
      <span className={`font-display ${textClassName}`}>
        {textColor === "light" ? (
          <>
            Hire<span className="text-accent-light">Board</span>
          </>
        ) : (
          <>
            Hire<span className="text-accent">Board</span>
          </>
        )}
      </span>
    </Link>
  );
}
