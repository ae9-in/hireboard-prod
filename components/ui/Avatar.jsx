import React from 'react';
import { getCompanyColor, getCompanyInitials } from '@/utils/constants';
import { cn } from '@/utils/cn';

/**
 * Avatar Component for Companies
 * Renders logo image if available, fallback to stylized initials with deterministic background color.
 */
export default function Avatar({ name, logo, className }) {
  const color = getCompanyColor(name);
  const initials = getCompanyInitials(name);

  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} Logo`}
        className={cn(
          "w-12 h-12 rounded-lg object-contain bg-white border border-border shadow-xs",
          className
        )}
        onError={(e) => {
          // Fallback if logo fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: color }}
      className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shadow-xs select-none",
        className
      )}
    >
      {initials}
    </div>
  );
}
