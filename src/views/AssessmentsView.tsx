import React from 'react';
import { CheckSquare, Award, Clock, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';
import { CapabilityBadge } from '../components/CapabilityBadge';

interface AssessmentsViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
}) => {
  const { assessmentQuestions, assessmentAttempts, userCapabilities } = database;

  const availableAssessmentSkills = Object.keys(assessmentQuestions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            OBJECTIVE EVALUATION ENGINE
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Diagnostic & Scenario Assessments
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Deterministic evaluation engine with scenario analysis, multiple select questions, and automated scoring that promotes capability from Claimed to Assessed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('challenges')}
            className="virt-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <span>View Practical Challenges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Available Exams Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-[#111111]">
          Available Diagnostic Assessments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAssessmentSkills.map((sId) => {
            const questions = assessmentQuestions[sId] || [];
            const cap = userCapabilities.find((c) => c.skillId === sId);
            const skillName = cap ? cap.skillName : sId;
            const pastAttempt = assessmentAttempts.find((a) => a.skillId === sId);

            return (
              <div
                key={sId}
                className="p-5 rounded-2xl virt-surface border border-[#111111]/12 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50">
                      {questions.length} Diagnostic Items
                    </span>
                    {cap && <CapabilityBadge level={cap.currentLevel} />}
                  </div>

                  <h4 className="text-base font-black text-[#111111] font-['Cabinet_Grotesk'] mt-1">
                    {skillName}
                  </h4>
                  <p className="text-xs text-[#111111]/70 mt-1 leading-snug">
                    Evaluates multi-container topology, zero-downtime rollouts, and failure mitigation strategies.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#111111]/10 flex items-center justify-between">
                  {pastAttempt ? (
                    <div className="text-xs text-[#111111]">
                      Last Score: <strong className="tabular-nums">{pastAttempt.score}%</strong>{' '}
                      ({pastAttempt.passed ? 'Passed' : 'Review needed'})
                    </div>
                  ) : (
                    <span className="text-xs text-[#111111]/60">No attempts logged yet</span>
                  )}

                  <button
                    onClick={() => onOpenAssessment(sId, skillName)}
                    className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{pastAttempt ? 'Reattempt Exam' : 'Launch Exam'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Attempts Records Table */}
      <div className="rounded-2xl virt-surface border border-[#111111]/12 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#111111]/10 bg-[#DED0BD]/60 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#111111]">
            Recorded Assessment Attempts & Audit Log
          </h3>
          <span className="text-xs text-[#111111]/60 tabular-nums">
            {assessmentAttempts.length} Attempts Stored
          </span>
        </div>

        {assessmentAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#111111]/50">
            No assessment attempts recorded yet. Launch an exam above to test and score your knowledge.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DED0BD]/40 border-b border-[#111111]/10 text-[#111111] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Skill Assessment</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Achieved Capability</th>
                  <th className="py-3 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/08">
                {assessmentAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#F5EEE4]/60">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">
                      {att.skillName}
                    </td>
                    <td className="py-3.5 px-4 font-bold tabular-nums text-sm text-[#111111]">
                      {att.score}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                          att.passed
                            ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                            : 'bg-[#DED0BD] text-[#111111] border border-[#111111]/30'
                        }`}
                      >
                        {att.passed ? 'PASSED' : 'DID NOT PASS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <CapabilityBadge level={att.capabilityLevelAchieved} />
                    </td>
                    <td className="py-3.5 px-4 text-[#111111]/70 tabular-nums">
                      {new Date(att.completedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
