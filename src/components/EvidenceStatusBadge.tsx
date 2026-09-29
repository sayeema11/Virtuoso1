import React from 'react';
import { EvidenceStatus } from '../types';
import { Check, CheckCheck, FileText, Award, Briefcase } from 'lucide-react';

interface EvidenceStatusBadgeProps {
  status: EvidenceStatus;
  showStepNumber?: boolean;
}

export const EvidenceStatusBadge: React.FC<EvidenceStatusBadgeProps> = ({ status }) => {
  const getBadgeDetails = () => {
    switch (status) {
      case 'Verified':
        return {
          icon: <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />,
          classes: 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border border-transparent font-bold shadow-[0_2px_8px_rgba(79,70,229,0.25)]',
          label: 'Employer Verified',
        };
      case 'Applied':
        return {
          icon: <Briefcase className="w-3.5 h-3.5 stroke-[2]" />,
          classes: 'bg-[#4F46E5] text-white border border-[#4F46E5] font-semibold shadow-2xs',
          label: 'Applied in Workplace',
        };
      case 'Demonstrated':
        return {
          icon: <Award className="w-3.5 h-3.5 stroke-[2]" />,
          classes: 'bg-[#DED0BD] text-[#111111] border border-[#111111]/35 font-semibold',
          label: 'Demonstrated in Lab',
        };
      case 'Assessed':
        return {
          icon: <Check className="w-3.5 h-3.5 stroke-[2]" />,
          classes: 'bg-[#F1E9DD] text-[#111111] border border-[#111111]/25 font-medium',
          label: 'Assessed Diagnostic',
        };
      case 'Claimed':
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 stroke-[1.5]" />,
          classes: 'bg-[#F5EEE4] text-[#111111]/80 border border-[#111111]/15 font-normal',
          label: 'Self-Reported / CV',
        };
    }
  };

  const { icon, classes, label } = getBadgeDetails();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm whitespace-nowrap transition-all ${classes}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
