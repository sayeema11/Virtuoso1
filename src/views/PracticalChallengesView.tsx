import React from 'react';
import { Sparkles, Code, CheckCircle2, ArrowRight, ShieldCheck, Link } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';

interface PracticalChallengesViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenChallenge: (challengeId: string) => void;
}

export const PracticalChallengesView: React.FC<PracticalChallengesViewProps> = ({
  database,
  onNavigate,
  onOpenChallenge,
}) => {
  const { practicalChallenges, challengeSubmissions } = database;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            DEMONSTRATION & LAB SANDBOX
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Practical Implementation Challenges
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Real-world technical briefs evaluated against production criteria. Completing a challenge promotes your skill evidence from Assessed to <strong>Demonstrated</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('evidence')}
            className="virt-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Evidence Wallet</span>
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="space-y-4">
        {practicalChallenges.map((ch) => {
          const submission = challengeSubmissions.find((s) => s.challengeId === ch.id);
          const isDone = submission?.demonstrationVerified;

          return (
            <div
              key={ch.id}
              className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                      {ch.skillName} · {ch.difficulty} Challenge
                    </span>
                    <h3 className="font-extrabold text-base text-[#111111]">
                      {ch.title}
                    </h3>
                  </div>
                </div>

                <div>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold rounded-sm shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DEMONSTRATION VERIFIED ({submission.score}%)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#111111]/60">
                      Pending Demonstration
                    </span>
                  )}
                </div>
              </div>

              {/* Scenario */}
              <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/08 text-xs text-[#111111] leading-relaxed">
                <strong>Project Brief:</strong> {ch.scenario}
              </div>

              {/* Deliverables preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#DED0BD]/50 border border-[#111111]/10">
                  <span className="font-bold text-[10px] uppercase text-[#111111]/60 block mb-1">
                    Required Deliverables ({ch.deliverables.length})
                  </span>
                  <ul className="space-y-1 list-disc pl-4 text-[#111111]/80">
                    {ch.deliverables.slice(0, 2).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#DED0BD]/50 border border-[#111111]/10">
                  <span className="font-bold text-[10px] uppercase text-[#111111]/60 block mb-1">
                    Evaluation Criteria ({ch.evaluationCriteria.length})
                  </span>
                  <ul className="space-y-1 list-disc pl-4 text-[#111111]/80">
                    {ch.evaluationCriteria.slice(0, 2).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between border-t border-[#111111]/08">
                <span className="text-[11px] text-[#111111]/60">
                  Submissions accept code manifests, YAML configs, or GitHub repo links.
                </span>
                <button
                  onClick={() => onOpenChallenge(ch.id)}
                  className="virt-btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <span>{isDone ? 'Update Lab Submission' : 'Enter Challenge Sandbox'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
