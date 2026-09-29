import React from 'react';
import { CapabilityLevel, CAPABILITY_LEVEL_SCORES } from '../types';

interface CapabilityBadgeProps {
  level: CapabilityLevel;
  showScore?: boolean;
}

export const CapabilityBadge: React.FC<CapabilityBadgeProps> = ({ level, showScore = false }) => {
  const score = CAPABILITY_LEVEL_SCORES[level] ?? 0;

  // Strict Beige + Black styling based on typography, border weight, and black intensity
  const getStyle = () => {
    switch (level) {
      case 'Advanced':
        return 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border border-transparent font-bold shadow-2xs';
      case 'Strong':
        return 'bg-[#4F46E5] text-white border border-[#4F46E5] font-semibold shadow-2xs';
      case 'Proficient':
        return 'bg-[#DED0BD] text-[#111111] border border-[#111111]/30 font-semibold';
      case 'Developing':
        return 'bg-[#F1E9DD] text-[#111111] border border-[#111111]/20 font-medium';
      case 'Limited':
        return 'bg-[#F5EEE4] text-[#111111]/80 border border-[#111111]/15 font-normal';
      case 'No Evidence':
      default:
        return 'bg-transparent text-[#111111]/50 border border-dashed border-[#111111]/20 font-light';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm whitespace-nowrap transition-colors ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{level}</span>
      {showScore && <span className="text-[10px] opacity-70 tabular-nums">({score}/5)</span>}
    </span>
  );
};
