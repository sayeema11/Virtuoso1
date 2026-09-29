import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Sparkles,
  TrendingUp,
  Compass,
  Edit3,
  Save,
  Building2,
  GraduationCap,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { CapabilityBadge } from '../components/CapabilityBadge';
import { EvidenceStatusBadge } from '../components/EvidenceStatusBadge';
import { GapSeverityBadge } from '../components/GapSeverityBadge';
import { CareerGoalType } from '../types';

interface CurrentRoleViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
}

export const CurrentRoleView: React.FC<CurrentRoleViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
}) => {
  const { currentUser } = database;
  const alignmentResult = dataStore.getCurrentRoleAlignment();
  const futureAlignment = dataStore.getTargetRoleAlignment();

  const [isEditingRoleInfo, setIsEditingRoleInfo] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'details'>('matrix');

  // Form states for workplace & goal details
  const [currentJobTitle, setCurrentJobTitle] = useState(currentUser.currentJobTitle);
  const [targetJobTitle, setTargetJobTitle] = useState(currentUser.targetJobTitle);
  const [industry, setIndustry] = useState(currentUser.industry || 'Cloud & Enterprise Infrastructure');
  const [trainingReceived, setTrainingReceived] = useState(
    currentUser.trainingReceived || 'Docker Fundamentals, AWS Practitioner, Linux Administration Level 2'
  );
  const [workplaceChallenges, setWorkplaceChallenges] = useState(
    currentUser.workplaceChallenges ||
      'Production cluster state drifting, manual deployment approvals, limited zero-trust telemetry.'
  );
  const [careerGoalType, setCareerGoalType] = useState<CareerGoalType>(
    currentUser.careerGoalType || 'promotion'
  );
  const [targetTimelineMonths, setTargetTimelineMonths] = useState(
    currentUser.targetTimelineMonths || 6
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveRoleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateProfile({
      currentJobTitle,
      targetJobTitle,
      industry,
      trainingReceived,
      workplaceChallenges,
      careerGoalType,
      targetTimelineMonths: Number(targetTimelineMonths),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditingRoleInfo(false);
    }, 1200);
  };

  const goalOptions: Array<{ value: CareerGoalType; label: string; desc: string }> = [
    { value: 'promotion', label: 'Promotion in Current Organization', desc: 'Climb ladder to senior IC or lead' },
    { value: 'new_role', label: 'New Role / Employment Transition', desc: 'Secure high-demand external position' },
    { value: 'new_technology', label: 'Master New Technology / Domain', desc: 'Specialize in Kubernetes & IaC' },
    { value: 'self_employment', label: 'Self-Employment / Contracting', desc: 'Build independent enterprise client advisory' },
    { value: 'career_transition', label: 'Full Career Transition', desc: 'Shift from legacy IT into Cloud-Native Architecture' },
    { value: 'other', label: 'Other Career Milestone', desc: 'Custom professional progression pathway' },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            STAGE 3 · ROLE CONGRUENCE & CAREER DIRECTION
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Current & Future Role Information
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-2xl">
            Mathematical comparison of verified evidence against current title (<strong>{currentUser.currentJobTitle}</strong>) and target direction (<strong>{currentUser.targetJobTitle}</strong>). Feeds directly into AI Analysis and Skill Gap Diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingRoleInfo(!isEditingRoleInfo)}
            className="virt-btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingRoleInfo ? 'Close Details Editor' : 'Edit Workplace & Goal Details'}</span>
          </button>
          <button
            onClick={() => onNavigate('skill-gaps')}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <span>Analyze Skill Gaps (Stage 5)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dual Alignment KPI Cards: Current Role vs Future Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Role Congruence */}
        <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 flex items-center justify-between col-span-1 md:col-span-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                Current Role Baseline Alignment
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#DED0BD] text-[#111111] rounded-sm">
                Current Role
              </span>
            </div>
            <div className="text-4xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-1">
              {alignmentResult.alignmentPercentage}%
            </div>
            <p className="text-xs text-[#111111]/70 mt-1 leading-snug">
              {alignmentResult.fullyAlignedSkillsCount} of {alignmentResult.totalSkillsRequired} core competencies verified for {currentUser.currentJobTitle}.
            </p>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-[#111111] flex flex-col items-center justify-center bg-[#DED0BD]/50 text-center">
            <span className="font-extrabold text-sm text-[#111111] tabular-nums">
              {alignmentResult.fullyAlignedSkillsCount}/{alignmentResult.totalSkillsRequired}
            </span>
            <span className="text-[8px] uppercase font-bold text-[#111111]/60">Met</span>
          </div>
        </div>

        {/* Future Target Role Readiness */}
        <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                Target Role Readiness
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-[#312E81] to-[#4F46E5] text-white rounded-sm">
                Target Role
              </span>
            </div>
            <div className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-1">
              {futureAlignment.alignmentPercentage}%
            </div>
            <span className="text-xs text-[#111111]/70 mt-1 block">
              Readiness for: <strong>{currentUser.targetJobTitle}</strong>
            </span>
          </div>
          <button
            onClick={() => onNavigate('pathway')}
            className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1 mt-2 cursor-pointer"
          >
            <span>View Pathway Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Critical Elevation Gaps */}
        <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
              Critical Blocker Gaps
            </span>
            <div className="text-2xl font-black text-rose-700 font-['Cabinet_Grotesk'] tabular-nums mt-1">
              {alignmentResult.criticalGapsCount}
            </div>
            <span className="text-xs text-[#111111]/70 mt-1 block">
              Core gaps blocking full proficiency
            </span>
          </div>
          <button
            onClick={() => onNavigate('skill-gaps')}
            className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1 mt-2 cursor-pointer"
          >
            <span>Run Diagnostic Check</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Interactive Workplace & Career Goals Editor Drawer */}
      {isEditingRoleInfo && (
        <form
          onSubmit={handleSaveRoleDetails}
          className="p-6 rounded-3xl bg-white border border-[#4F46E5]/30 shadow-lg space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#4F46E5]" />
              <h3 className="font-extrabold text-sm text-[#111111]">
                Workplace Context & Career Goals Intake
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#111111]/50">
              Flowchart Stage 3 Parameters
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Current Role Details */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F5EEE4]/60 border border-[#111111]/08">
              <h4 className="font-bold text-xs text-[#111111] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#312E81]" />
                <span>Current Role & Workplace Details</span>
              </h4>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Active Job Title</label>
                <input
                  type="text"
                  value={currentJobTitle}
                  onChange={(e) => setCurrentJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Industry / Operating Domain</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Recent Training / Certifications Received</label>
                <input
                  type="text"
                  value={trainingReceived}
                  onChange={(e) => setTrainingReceived(e.target.value)}
                  placeholder="e.g. Docker Fundamentals, AWS Cloud Practitioner"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Current Workplace Challenges Faced</label>
                <textarea
                  rows={2}
                  value={workplaceChallenges}
                  onChange={(e) => setWorkplaceChallenges(e.target.value)}
                  placeholder="Describe operational bottlenecks or technologies you need to master..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            {/* Future Career Direction */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F5EEE4]/60 border border-[#111111]/08">
              <h4 className="font-bold text-xs text-[#111111] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Desired Future Role & Career Direction</span>
              </h4>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Desired Target Role</label>
                <input
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Career Progression Trajectory</label>
                <select
                  value={careerGoalType}
                  onChange={(e) => setCareerGoalType(e.target.value as CareerGoalType)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  {goalOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]/80">Target Milestone Horizon</label>
                <select
                  value={targetTimelineMonths}
                  onChange={(e) => setTargetTimelineMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value={3}>3 Months (Fast-Track Sprint)</option>
                  <option value={6}>6 Months (Standard Progression Horizon)</option>
                  <option value={12}>12 Months (Comprehensive Architecture Trajectory)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#111111]/10 text-[11px] text-[#111111]/70 leading-relaxed">
                Saving these details automatically adjusts the <strong>Diagnostic Gap Engine</strong> and calibrates the <strong>Personalized Progression Pathway</strong>.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Workplace context and career goals updated successfully!</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#111111]/60">All fields are persisted locally and in Firestore.</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingRoleInfo(false)}
                className="virt-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Role Parameters</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Role Requirement Benchmark Matrix Table */}
      <div className="rounded-2xl virt-surface border border-[#111111]/12 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#111111]/10 bg-[#DED0BD]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm text-[#111111]">
              Current Role Competency Benchmark Matrix
            </h3>
            <p className="text-xs text-[#111111]/60">
              Evaluated against role definition: <strong>{currentUser.currentJobTitle}</strong>
            </p>
          </div>
          <span className="text-xs font-semibold text-[#111111] font-mono">
            Deterministic Evaluation Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#DED0BD]/40 border-b border-[#111111]/10 text-[#111111] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Skill / Requirement</th>
                <th className="py-3 px-4">Current Verified Level</th>
                <th className="py-3 px-4">Required Benchmark</th>
                <th className="py-3 px-4">Gap Differential</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/08">
              {alignmentResult.skillDetails.map((item) => {
                const gapSeverity =
                  item.gapScore >= 2 && item.isCore
                    ? 'CRITICAL'
                    : item.gapScore >= 2
                    ? 'HIGH'
                    : item.gapScore === 1
                    ? 'MEDIUM'
                    : 'LOW';

                return (
                  <tr key={item.skillId} className="hover:bg-[#F5EEE4]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111111]">{item.skillName}</span>
                        {item.isCore && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm shadow-2xs">
                            CORE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <CapabilityBadge level={item.currentLevel} showScore />
                    </td>

                    <td className="py-3.5 px-4">
                      <CapabilityBadge level={item.requiredLevel} showScore />
                    </td>

                    <td className="py-3.5 px-4">
                      {item.isAligned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Satisfied</span>
                        </span>
                      ) : (
                        <GapSeverityBadge severity={gapSeverity} />
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <EvidenceStatusBadge status={item.evidenceStatus} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {!item.isAligned ? (
                        <button
                          onClick={() => onOpenAssessment(item.skillId, item.skillName)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white hover:opacity-90 transition-all shadow-2xs cursor-pointer"
                        >
                          Target Gap
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#111111]/50 font-medium">Standard Met</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
