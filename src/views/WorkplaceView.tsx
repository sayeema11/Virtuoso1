import React from 'react';
import { Briefcase, Plus, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';

interface WorkplaceViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenWorkplace: (skillId?: string) => void;
}

export const WorkplaceView: React.FC<WorkplaceViewProps> = ({
  database,
  onNavigate,
  onOpenWorkplace,
}) => {
  const { workplaceApplications, verificationRequests } = database;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            PRODUCTION APPLICATION
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Workplace Execution & On-the-Job Practice
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Documenting real production execution. Recording workplace applications creates verified evidence and automatically dispatches endorsement requests to your supervisor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenWorkplace()}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Workplace Usage</span>
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {workplaceApplications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#111111]/50 virt-surface rounded-2xl border border-[#111111]/10">
            No workplace applications recorded yet. Click above to record real-world project usage.
          </div>
        ) : (
          workplaceApplications.map((wp) => {
            const relatedReq = verificationRequests.find((r) => r.skillId === wp.skillId);

            return (
              <div
                key={wp.id}
                className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-3 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                        {wp.skillName} · Applied {wp.dateApplied}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#111111]">
                        {wp.purpose}
                      </h3>
                    </div>
                  </div>

                  <div>
                    {wp.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold rounded-sm shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED BY SUPERVISOR</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DED0BD] text-[#111111] text-xs font-bold border border-[#111111]/30 rounded-sm">
                        <span>AWAITING SUPERVISOR REVIEW</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/08 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                      Operational Problem Solved
                    </span>
                    <p className="text-[#111111] leading-relaxed">
                      {wp.problemSolved}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/08 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                      Direct Technical Contribution
                    </span>
                    <p className="text-[#111111] leading-relaxed">
                      {wp.contribution}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#111111]/08 text-xs text-[#111111]/70">
                  <span>
                    Supervisor: <strong>{wp.supervisorName || 'Sarah Jenkins'}</strong> ({wp.supervisorEmail || 'sarah.jenkins@apexcloud.co.uk'})
                  </span>

                  {!wp.verified && (
                    <button
                      onClick={() => onNavigate('employer-portal')}
                      className="font-bold text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Review as Supervisor</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
