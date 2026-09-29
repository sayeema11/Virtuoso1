import React, { useState } from 'react';
import { GraduationCap, Users, BookOpen, CheckCircle2, TrendingUp, Award, Download } from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';

interface ProviderPortalViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenReportModal: () => void;
}

export const ProviderPortalView: React.FC<ProviderPortalViewProps> = ({
  database,
  onNavigate,
  onOpenReportModal,
}) => {
  const { cohorts, currentUser } = database;
  const funnel = dataStore.getFunnelMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            TRAINING ACCREDITATION & COHORTS
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Training Provider Command Centre
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Live cohort performance metrics, training completion rates, and demonstration outcomes verified across North West Technical Institute cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Provider Data</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Active Cohorts</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {cohorts.length}
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">{funnel.enrolled} Enrolled learners</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Training Completion Rate</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {funnel.completionRate}%
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">{funnel.completed} Passed all units</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Demonstration Pass Rate</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {funnel.demonstrationRate}%
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">{funnel.demonstrated} Lab verified</span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Employment Outcome Rate</span>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {funnel.outcomeProgressionRate}%
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">{funnel.outcomesVerified} Career verified</span>
        </div>
      </div>

      {/* Cohorts Management Table */}
      <div className="rounded-2xl virt-surface border border-[#111111]/12 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#111111]/10 bg-[#DED0BD]/60 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#111111]">
            Active Training Cohorts & Progression Funnel
          </h3>
          <span className="text-xs text-[#111111]/60 tabular-nums">
            {cohorts.length} Cohorts Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#DED0BD]/40 border-b border-[#111111]/10 text-[#111111] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Cohort Name & Programme</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Demonstrated</th>
                <th className="py-3 px-4">Workplace Applied</th>
                <th className="py-3 px-4">Verified Outcomes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/08">
              {cohorts.map((coh) => (
                <tr key={coh.id} className="hover:bg-[#F5EEE4]/60">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#111111] block">{coh.name}</span>
                    <span className="text-[11px] text-[#111111]/60">{coh.programmeName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#111111]/80">
                    {coh.district}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#111111] tabular-nums">
                    {coh.enrolledLearners}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#111111] tabular-nums">
                    {coh.completedLearners} ({Math.round((coh.completedLearners / coh.enrolledLearners) * 100)}%)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#111111] tabular-nums">
                    {coh.demonstratedLearners}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#111111] tabular-nums">
                    {coh.appliedLearners}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#111111] tabular-nums">
                    {coh.outcomesVerified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
