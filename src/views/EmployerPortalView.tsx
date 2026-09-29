import React from 'react';
import { Building2, ShieldCheck, CheckCheck, Clock, Award, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';
import { VerificationRequest } from '../types';

interface EmployerPortalViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenVerificationReview: (request: VerificationRequest) => void;
}

export const EmployerPortalView: React.FC<EmployerPortalViewProps> = ({
  database,
  onNavigate,
  onOpenVerificationReview,
}) => {
  const { verificationRequests, currentUser } = database;

  const pendingRequests = verificationRequests.filter((r) => r.status === 'pending');
  const resolvedRequests = verificationRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            SUPERVISOR & MENTOR ENDORSEMENT
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Employer & Mentor Verification Inbox
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Review live workplace evidence and authenticate demonstrated engineering capabilities for apprentices and junior employees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-xl tabular-nums shadow-2xs">
            {pendingRequests.length} Pending Review
          </span>
        </div>
      </div>

      {/* Pending Verifications Queue */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-[#111111]">
          Pending Apprentice Verification Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#111111]/50 virt-surface rounded-2xl border border-[#111111]/10">
            All apprentice verification requests have been addressed and confirmed.
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-2xl virt-surface border border-[#111111]/15 space-y-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                      Apprentice Request · {req.skillName}
                    </span>
                    <h4 className="font-extrabold text-base text-[#111111]">
                      {req.userName} — {req.evidenceTitle}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => onOpenVerificationReview(req)}
                  className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Review & Endorse</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 text-xs text-[#111111] leading-relaxed">
                <strong>Demonstration Summary:</strong> {req.evidenceSummary}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-[#111111]/60">
                <span>Supervisor Contact: {req.supervisorEmail}</span>
                <span>Submitted: {new Date(req.requestedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historical Resolved Verifications */}
      <div className="rounded-2xl virt-surface border border-[#111111]/12 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#111111]/10 bg-[#DED0BD]/60 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#111111]">
            Historical Supervisor Endorsement Decisions
          </h3>
          <span className="text-xs text-[#111111]/60 tabular-nums">
            {resolvedRequests.length} Resolved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#DED0BD]/40 border-b border-[#111111]/10 text-[#111111] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate & Role</th>
                <th className="py-3 px-4">Skill Verified</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Endorsement Feedback</th>
                <th className="py-3 px-4">Date Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/08">
              {resolvedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F5EEE4]/60">
                  <td className="py-3.5 px-4 font-bold text-[#111111]">
                    {req.userName}
                    <span className="text-[10px] text-[#111111]/60 block font-normal">{req.userRole}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#111111]">
                    {req.skillName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm uppercase shadow-2xs">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#111111]/85 max-w-xs truncate">
                    {req.decisionNotes || 'Verified without conditions.'}
                  </td>
                  <td className="py-3.5 px-4 text-[#111111]/70 tabular-nums">
                    {req.decidedAt ? new Date(req.decidedAt).toLocaleDateString() : 'N/A'}
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
