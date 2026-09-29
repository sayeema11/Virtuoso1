import React, { useState } from 'react';
import { GitPullRequest, ArrowRight, BookOpen, CheckSquare, Briefcase, Filter } from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { CapabilityBadge } from '../components/CapabilityBadge';
import { EvidenceStatusBadge } from '../components/EvidenceStatusBadge';
import { GapSeverityBadge } from '../components/GapSeverityBadge';
import { SkillGap, GapSeverity } from '../types';

interface SkillGapsViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
  onOpenWorkplace: (skillId?: string) => void;
}

export const SkillGapsView: React.FC<SkillGapsViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
  onOpenWorkplace,
}) => {
  const [filterMode, setFilterMode] = useState<
    'all' | 'current_role' | 'future_role' | 'critical' | 'no_evidence' | 'workplace_practice'
  >('all');

  const { currentUser } = database;

  const currentGaps = dataStore.getSkillGaps('current_role');
  const futureGaps = dataStore.getSkillGaps('future_role');

  const allGaps = dataStore.getSkillGaps('all');

  const filteredGaps = allGaps.filter((gap) => {
    if (filterMode === 'current_role') return gap.targetContext === 'current_role' && gap.gapDiff > 0;
    if (filterMode === 'future_role') return gap.targetContext === 'future_role' && gap.gapDiff > 0;
    if (filterMode === 'critical') return gap.severity === 'CRITICAL';
    if (filterMode === 'no_evidence') return gap.evidenceState === 'Claimed' || gap.currentLevel === 'No Evidence';
    if (filterMode === 'workplace_practice') return gap.requiresWorkplacePractice;
    return true;
  });

  const criticalCount = allGaps.filter((g) => g.severity === 'CRITICAL').length;
  const highCount = allGaps.filter((g) => g.severity === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            DIAGNOSTIC GAP ENGINE
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Target Competency Gap Intelligence
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Real-time differential analysis between your demonstrated evidence and required capability standards for target role: <strong>{currentUser.targetJobTitle}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('pathway')}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <span>View Personalized Pathway</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Critical Core Gaps</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {criticalCount}
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">High urgency blockers</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">High Priority Gaps</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {highCount}
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Intermediate prerequisites</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Requires Workplace Practice</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {allGaps.filter((g) => g.requiresWorkplacePractice).length}
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Requires on-job application</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Est. Elevation Effort</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {allGaps.reduce((acc, g) => acc + g.estimatedEffortHours, 0)} <span className="text-xs font-normal opacity-70">hrs</span>
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Targeted learning hours</span>
        </div>
      </div>

      {/* Filter Tabs (Interactive Segmented Bar) */}
      <div className="p-1.5 rounded-2xl virt-glass flex flex-wrap items-center gap-1 overflow-x-auto">
        {[
          { id: 'all', label: `All Gaps (${allGaps.length})` },
          { id: 'current_role', label: 'Current Role Gaps' },
          { id: 'future_role', label: 'Future Role Gaps' },
          { id: 'critical', label: `Critical Gaps (${criticalCount})` },
          { id: 'no_evidence', label: 'Skills Without Evidence' },
          { id: 'workplace_practice', label: 'Workplace Practice Needed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filterMode === tab.id
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm'
                : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#DED0BD]/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gaps List / Cards */}
      <div className="space-y-3">
        {allGaps.length === 0 ? (
          <div className="p-8 text-center virt-surface rounded-2xl border border-dashed border-[#111111]/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EEE4] border border-[#111111]/10 flex items-center justify-center mx-auto text-[#4F46E5]">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#111111]">
                {!currentUser.targetJobTitle ? 'Target Career Role Needed' : 'No Skill Gaps Identified'}
              </h4>
              <p className="text-xs text-[#111111]/70 max-w-md mx-auto">
                {!currentUser.targetJobTitle
                  ? 'Define your target career role to calculate specific competency gaps and benchmark your skills against industry standards.'
                  : 'Add your past experience, resume, or current role responsibilities to discover targeted skill opportunities.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onNavigate(!currentUser.targetJobTitle ? 'current-role' : 'experience')}
                className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>{!currentUser.targetJobTitle ? 'Set Target Role' : 'Add Experience & Skills'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : filteredGaps.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#111111]/60 virt-surface rounded-2xl border border-[#111111]/10">
            No skill gaps match the selected filter.
          </div>
        ) : (
          filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className="p-5 rounded-2xl virt-surface border border-[#111111]/12 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-sm text-[#111111]">
                    {gap.skillName}
                  </h3>
                  <GapSeverityBadge severity={gap.severity} />
                  <span className="text-[10px] text-[#111111]/50 uppercase font-semibold">
                    Priority {gap.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#111111]/60 font-medium">Current:</span>
                  <CapabilityBadge level={gap.currentLevel} />
                  <span className="text-xs text-[#111111]/40">→</span>
                  <span className="text-xs text-[#111111]/60 font-medium">Target:</span>
                  <CapabilityBadge level={gap.requiredLevel} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Diagnostic Rationale</span>
                  <p className="text-[#111111]/80 mt-1 leading-snug">{gap.reason}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Recommended Action</span>
                  <p className="text-[#111111] font-semibold mt-1 leading-snug">{gap.recommendedAction}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Effort & Practice</span>
                    <span className="text-xs text-[#111111] font-bold mt-1 block tabular-nums">
                      ~{gap.estimatedEffortHours} Hours Estimated
                    </span>
                  </div>
                  <span className="text-[11px] text-[#111111]/70 mt-1">
                    {gap.requiresWorkplacePractice ? '★ Requires Workplace Application' : '✓ Micro-learning & Lab Assessment'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#111111]/08 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#111111]/60">Evidence State:</span>
                  <EvidenceStatusBadge status={gap.evidenceState} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAssessment(gap.skillId, gap.skillName)}
                    className="virt-btn-primary px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Launch Assessment</span>
                  </button>
                  <button
                    onClick={() => onOpenWorkplace(gap.skillId)}
                    className="virt-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Log Workplace Practice</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
