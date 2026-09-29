import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCheck, Briefcase, Award, FileText, Check, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';
import { EvidenceStatusBadge } from '../components/EvidenceStatusBadge';
import { SkillEvidence, EvidenceStatus } from '../types';

interface EvidenceWalletViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenWorkplace: (skillId?: string) => void;
}

export const EvidenceWalletView: React.FC<EvidenceWalletViewProps> = ({
  database,
  onNavigate,
  onOpenWorkplace,
}) => {
  const { evidenceItems, userCapabilities, verificationRequests } = database;
  const [expandedId, setExpandedId] = useState<string | null>(evidenceItems[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvidence = evidenceItems.filter((ev) => {
    if (statusFilter === 'all') return true;
    return ev.evidenceStatus === statusFilter;
  });

  const verifiedCount = evidenceItems.filter((e) => e.evidenceStatus === 'Verified').length;
  const appliedCount = evidenceItems.filter((e) => e.evidenceStatus === 'Applied').length;
  const demonstratedCount = evidenceItems.filter((e) => e.evidenceStatus === 'Demonstrated').length;
  const assessedCount = evidenceItems.filter((e) => e.evidenceStatus === 'Assessed').length;
  const claimedCount = evidenceItems.filter((e) => e.evidenceStatus === 'Claimed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            VERIFIABLE CREDENTIAL REGISTRY
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Evidence Wallet & Cryptographic Timeline
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Immutable chain of evidence tracking the progression of skills through verified technical artifacts, assessment submissions, and employer endorsements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenWorkplace()}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Add Workplace Evidence</span>
          </button>
        </div>
      </div>

      {/* Evidence Category Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { status: 'Claimed', count: claimedCount, label: 'Self-Reported / CV' },
          { status: 'Assessed', count: assessedCount, label: 'Diagnostic Check' },
          { status: 'Demonstrated', count: demonstratedCount, label: 'Lab Demonstration' },
          { status: 'Applied', count: appliedCount, label: 'Workplace Applied' },
          { status: 'Verified', count: verifiedCount, label: 'Employer Verified' },
        ].map((item) => (
          <button
            key={item.status}
            onClick={() => setStatusFilter(item.status)}
            className={`p-3.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
              statusFilter === item.status
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-md'
                : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/12 hover:bg-[#DED0BD]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold opacity-70 truncate">{item.label}</span>
              <span className="font-mono text-base font-extrabold tabular-nums ml-1">
                {item.count}
              </span>
            </div>
            <span className="font-extrabold text-xs block mt-1">{item.status}</span>
          </button>
        ))}
      </div>

      {/* Filter Reset if active */}
      {statusFilter !== 'all' && (
        <div className="flex items-center justify-between text-xs text-[#111111]/70 px-1">
          <span>Filtering by evidence state: <strong>{statusFilter}</strong></span>
          <button
            onClick={() => setStatusFilter('all')}
            className="font-bold underline hover:text-[#111111]"
          >
            Show All ({evidenceItems.length})
          </button>
        </div>
      )}

      {/* Evidence Timeline List (Smooth Expandable Panels) */}
      <div className="space-y-3">
        {filteredEvidence.map((ev, idx) => {
          const isExpanded = expandedId === ev.id;
          const matchingCap = userCapabilities.find((c) => c.skillId === ev.skillId);

          return (
            <div
              key={ev.id}
              className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-3 hover:shadow-sm transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                className="flex items-start justify-between cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center font-bold text-xs font-mono mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                      {ev.skillName} · {ev.evidenceType}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#111111] mt-0.5">
                      {ev.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <EvidenceStatusBadge status={ev.evidenceStatus} showStepNumber />
                  <span className="text-[11px] text-[#111111]/50 tabular-nums hidden sm:inline">
                    {ev.createdDate}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#111111]/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#111111]/60" />
                  )}
                </div>
              </div>

              {/* Collapsed Brief Preview */}
              {!isExpanded && (
                <p className="text-xs text-[#111111]/75 line-clamp-1 pl-9">
                  {ev.description}
                </p>
              )}

              {/* Smoothly Expanded Detail View */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-9 space-y-4 pt-2 border-t border-[#111111]/08"
                >
                  <p className="text-xs text-[#111111] leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                      <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                        Record Source
                      </span>
                      <span className="font-bold text-[#111111] block mt-0.5">
                        {ev.evidenceType}
                      </span>
                      <span className="text-[10px] text-[#111111]/60 block font-mono">
                        Ref: {ev.sourceRefId || 'DIRECT-VERIFIED'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                      <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                        Demonstration Timestamp
                      </span>
                      <span className="font-bold text-[#111111] block mt-0.5 tabular-nums">
                        {ev.createdDate}
                      </span>
                      <span className="text-[10px] text-[#111111]/60 block">
                        Logged to audit ledger
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                      <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                        Employer Endorsement
                      </span>
                      <span className="font-bold text-[#111111] block mt-0.5">
                        {ev.verifiedBy || 'Pending supervisor sign-off'}
                      </span>
                      {ev.verifiedAt && (
                        <span className="text-[10px] text-[#111111]/60 block tabular-nums">
                          Verified: {new Date(ev.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-[11px] text-[#111111]/60">
                      Current User Capability: <strong>{matchingCap?.currentLevel || 'Developing'}</strong>
                    </span>

                    {ev.evidenceStatus !== 'Verified' && (
                      <button
                        onClick={() => onNavigate('employer-portal')}
                        className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Simulate Employer Sign-off</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
