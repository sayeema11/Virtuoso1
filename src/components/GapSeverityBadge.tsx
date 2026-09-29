import React from 'react';
import { GapSeverity } from '../types';
import { AlertCircle, AlertTriangle, ChevronRight, Minus } from 'lucide-react';

interface GapSeverityBadgeProps {
  severity: GapSeverity;
}

export const GapSeverityBadge: React.FC<GapSeverityBadgeProps> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black text-white bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] border border-transparent shadow-[0_2px_8px_rgba(79,70,229,0.25)] rounded-sm tracking-wide">
          <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>CRITICAL GAP</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold text-[#111111] bg-[#DED0BD] border border-[#111111] rounded-sm">
          <AlertTriangle className="w-3.5 h-3.5 stroke-[2]" />
          <span>HIGH GAP</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-[#111111] bg-[#F1E9DD] border border-[#111111]/30 rounded-sm">
          <ChevronRight className="w-3 h-3 stroke-[2]" />
          <span>MEDIUM GAP</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-normal text-[#111111]/70 bg-[#F5EEE4] border border-[#111111]/15 rounded-sm">
          <Minus className="w-3 h-3 stroke-[1.5]" />
          <span>LOW / MINOR</span>
        </span>
      );
  }
};
