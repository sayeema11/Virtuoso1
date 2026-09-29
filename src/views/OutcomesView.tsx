import React, { useState } from 'react';
import { TrendingUp, CheckCircle2, Award, ArrowRight, DollarSign, Calendar, Edit3 } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';
import { OutcomeFollowup } from '../types';

interface OutcomesViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenOutcomeModal: (milestone: '30_day' | '60_day' | '90_day') => void;
}

export const OutcomesView: React.FC<OutcomesViewProps> = ({
  database,
  onNavigate,
  onOpenOutcomeModal,
}) => {
  const { outcomeFollowups, currentUser } = database;
  const [activeMilestone, setActiveMilestone] = useState<'30_day' | '60_day' | '90_day'>('90_day');

  const selectedRecord = outcomeFollowups.find((o) => o.milestone === activeMilestone);

  const completedCount = outcomeFollowups.filter((o) => o.status === 'completed').length;
  const totalWagesProgression = outcomeFollowups.reduce((acc, o) => Math.max(acc, o.wageProgressionPercentage || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            LONGITUDINAL IMPACT TRACKER
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Career Progression & Wage Outcomes
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Live 30, 60, and 90-day verification milestones proving tangible employment outcomes, wage gains, and expanded operational responsibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenOutcomeModal(activeMilestone)}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update {activeMilestone.replace('_', '-')} Review</span>
          </button>
        </div>
      </div>

      {/* Aggregate Outcome KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
            Milestones Completed
          </span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {completedCount} <span className="text-xs font-normal opacity-60">/ {outcomeFollowups.length}</span>
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Audit checks logged</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
            Cumulative Wage Growth
          </span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            +{totalWagesProgression}%
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Verified progression lift</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
            Current Title
          </span>
          <div className="text-sm font-extrabold text-[#111111] truncate mt-1">
            {currentUser.currentJobTitle}
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Updated upon milestone sign-off</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
            Employment Status
          </span>
          <div className="text-sm font-extrabold text-[#111111] truncate mt-1 capitalize">
            {selectedRecord?.employmentStatus.replace(/_/g, ' ') || 'Employed Full-Time'}
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">90-Day verified retention</span>
        </div>
      </div>

      {/* 30 / 60 / 90 Days Timeline Navigator */}
      <div className="p-1.5 rounded-2xl virt-glass flex items-center gap-1">
        {(['30_day', '60_day', '90_day'] as const).map((ms) => {
          const rec = outcomeFollowups.find((o) => o.milestone === ms);
          const isSelected = activeMilestone === ms;
          const isDone = rec?.status === 'completed';

          return (
            <button
              key={ms}
              onClick={() => setActiveMilestone(ms)}
              className={`flex-1 py-3 px-4 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-md'
                  : 'bg-[#F1E9DD] text-[#111111] hover:bg-[#DED0BD]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold font-['Cabinet_Grotesk'] text-sm">
                  {ms.replace('_', '-').toUpperCase()} Check-in
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-sm ${
                    isDone
                      ? isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white'
                      : 'bg-[#DED0BD] text-[#111111]'
                  }`}
                >
                  {isDone ? 'COMPLETED' : 'DUE CHECKPOINT'}
                </span>
              </div>
              <span className={`text-[11px] block mt-0.5 ${isSelected ? 'opacity-85 text-white' : 'text-[#111111]/60'}`}>
                Due: {rec?.dueDate}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Outcome Active Card */}
      {selectedRecord && (
        <div className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#111111]/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                Verification Details
              </span>
              <h3 className="font-extrabold text-base text-[#111111]">
                {activeMilestone.replace('_', '-').toUpperCase()} Career Progression Review
              </h3>
            </div>
            <div className="text-xs text-[#111111]/70">
              Completed on: <strong>{selectedRecord.completedDate || 'Pending Submission'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Skill Application</span>
              <div className="text-xl font-black text-[#111111] tabular-nums mt-1 font-mono">
                {selectedRecord.skillApplicationScore}/5
              </div>
              <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Frequency of practice</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Autonomy & Confidence</span>
              <div className="text-xl font-black text-[#111111] tabular-nums mt-1 font-mono">
                {selectedRecord.confidenceScore}/5
              </div>
              <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Independent judgment</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Wage Adjustment</span>
              <div className="text-xl font-black text-[#111111] tabular-nums mt-1 font-mono">
                +{selectedRecord.wageProgressionPercentage || 0}%
              </div>
              <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Comp increase verified</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Responsibility Scope</span>
              <div className="text-sm font-bold text-[#111111] mt-1">
                {selectedRecord.responsibilityExpanded ? 'Expanded Scope' : 'Standard Baseline'}
              </div>
              <span className="text-[11px] text-[#111111]/70 mt-0.5 block">Authorized delegation</span>
            </div>
          </div>

          {/* Qualitative Reflection */}
          <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 space-y-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
              Candidate Qualitative Statement
            </span>
            <p className="text-[#111111] leading-relaxed">
              "{selectedRecord.reflectionNotes}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#111111]/08 text-xs text-[#111111]/70">
            <span>
              Employer Verification: <strong>Verified on record</strong>
            </span>
            <button
              onClick={() => onOpenOutcomeModal(activeMilestone)}
              className="virt-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg"
            >
              Update Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
