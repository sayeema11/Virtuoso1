import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { OutcomeFollowup, AttritionReason } from '../types';
import { dataStore } from '../services/dataStore';

interface OutcomeMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: '30_day' | '60_day' | '90_day';
  existingRecord?: OutcomeFollowup;
  onComplete: () => void;
}

export const OutcomeMilestoneModal: React.FC<OutcomeMilestoneModalProps> = ({
  isOpen,
  onClose,
  milestone,
  existingRecord,
  onComplete,
}) => {
  const [skillScore, setSkillScore] = useState(existingRecord?.skillApplicationScore || 4);
  const [confidence, setConfidence] = useState(existingRecord?.confidenceScore || 4);
  const [responsibilityExpanded, setResponsibilityExpanded] = useState(existingRecord?.responsibilityExpanded ?? true);
  const [roleChanged, setRoleChanged] = useState(existingRecord?.roleChanged ?? false);
  const [newRoleTitle, setNewRoleTitle] = useState(existingRecord?.newRoleTitle || 'Cloud DevOps Associate Engineer');
  const [promotionGranted, setPromotionGranted] = useState(existingRecord?.promotionGranted ?? false);
  const [wageGrowth, setWageGrowth] = useState<number>(existingRecord?.wageProgressionPercentage || 15);
  const [employmentStatus, setEmploymentStatus] = useState<OutcomeFollowup['employmentStatus']>(
    existingRecord?.employmentStatus || 'employed_full_time'
  );
  const [placementStatus, setPlacementStatus] = useState<OutcomeFollowup['placementStatus']>(
    existingRecord?.placementStatus || 'placed'
  );
  const [attritionReason, setAttritionReason] = useState<AttritionReason>(
    existingRecord?.attritionReason || 'skill_gap'
  );
  const [attritionNotes, setAttritionNotes] = useState(existingRecord?.attritionNotes || '');
  const [notes, setNotes] = useState(
    existingRecord?.reflectionNotes || 'Progression verified following multi-stage microservices and containerization implementation.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dataStore.submitOutcomeFollowup(milestone, {
      skillApplicationScore: skillScore,
      confidenceScore: confidence,
      responsibilityExpanded,
      roleChanged,
      newRoleTitle: roleChanged ? newRoleTitle : undefined,
      promotionGranted,
      wageProgressionPercentage: wageGrowth,
      employmentStatus,
      placementStatus,
      attritionReason: placementStatus === 'not_placed' || placementStatus === 'attrition' ? attritionReason : undefined,
      attritionNotes: placementStatus === 'not_placed' || placementStatus === 'attrition' ? attritionNotes : undefined,
      reflectionNotes: notes,
    });

    onComplete();
    onClose();
  };

  const milestoneTitle = milestone.replace('_', '-').toUpperCase();

  const attritionOptions: Array<{ value: AttritionReason; label: string }> = [
    { value: 'skill_gap', label: 'Persistent Skill Gap (Specific technical deficit)' },
    { value: 'insufficient_experience', label: 'Insufficient Practical Work Experience' },
    { value: 'lack_of_vacancies', label: 'Lack of Industry Vacancies / Hiring Freeze' },
    { value: 'location', label: 'Geographic / Commute / Relocation Constraint' },
    { value: 'compensation', label: 'Compensation Below Expectations' },
    { value: 'employer_requirements', label: 'Specific Employer Benchmark Requirements' },
    { value: 'personal_constraints', label: 'Personal / Family / Health Constraints' },
    { value: 'programme_mismatch', label: 'Programme Role Mismatch' },
    { value: 'training_relevance', label: 'Training Curriculum Relevance' },
    { value: 'confidence', label: 'Confidence / Interview Readiness' },
    { value: 'other', label: 'Other Circumstances' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl max-h-[90vh] virt-glass-strong rounded-2xl border border-[#111111]/18 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                  STAGE 11 · OUTCOME FOLLOW-UP
                </span>
                <h3 className="font-extrabold text-base text-[#111111]">
                  Record {milestoneTitle} Outcome Review
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#DED0BD] text-[#111111]/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Status Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="employed_full_time">Employed Full-Time</option>
                  <option value="promoted">Promoted within Organization</option>
                  <option value="in_apprenticeship">Continuing Apprenticeship</option>
                  <option value="self_employed">Self-Employed / Contractor</option>
                  <option value="employed_part_time">Employed Part-Time</option>
                  <option value="further_education">Enrolled in Further Education</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Placement Outcome</label>
                <select
                  value={placementStatus}
                  onChange={(e) => setPlacementStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="placed">Secured Placement / Active</option>
                  <option value="retained">Retained Past Milestone</option>
                  <option value="promoted">Promoted with Wage Increase</option>
                  <option value="in_progress">Progression in Progress</option>
                  <option value="not_placed">Pending Placement (Challenges Faced)</option>
                  <option value="attrition">Programme Attrition / Departure</option>
                </select>
              </div>
            </div>

            {/* Attrition / Non-Placement Reasons (Flowchart Stage 11 Requirement) */}
            {(placementStatus === 'not_placed' || placementStatus === 'attrition') && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-800" />
                  <span className="text-xs font-bold text-amber-950">
                    Reasons for Non-Placement / Attrition Diagnosis
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-950">Primary Barrier Identified</label>
                  <select
                    value={attritionReason}
                    onChange={(e) => setAttritionReason(e.target.value as AttritionReason)}
                    className="w-full p-2 text-xs rounded-lg bg-white border border-amber-300 text-[#111111]"
                  >
                    {attritionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-950">Actionable Feedback & Support Needed</label>
                  <textarea
                    rows={2}
                    value={attritionNotes}
                    onChange={(e) => setAttritionNotes(e.target.value)}
                    placeholder="Specify training adjustments, mentor pairing, or support required..."
                    className="w-full p-2 text-xs rounded-lg bg-white border border-amber-300 text-[#111111]"
                  />
                </div>
              </div>
            )}

            {/* Ratings Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-1.5">
                <label className="text-[11px] font-bold text-[#111111] block">
                  Skill Application at Work (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={skillScore}
                  onChange={(e) => setSkillScore(Number(e.target.value))}
                  className="w-full accent-[#111111]"
                />
                <span className="text-xs font-bold text-[#111111] tabular-nums block text-right">
                  {skillScore}/5 ({skillScore >= 4 ? 'High Frequency' : 'Moderate'})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-1.5">
                <label className="text-[11px] font-bold text-[#111111] block">
                  Autonomy & Confidence (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-[#111111]"
                />
                <span className="text-xs font-bold text-[#111111] tabular-nums block text-right">
                  {confidence}/5 ({confidence >= 4 ? 'Independent Execution' : 'Supervised'})
                </span>
              </div>
            </div>

            {/* Responsibility & Role Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 cursor-pointer">
                <input
                  type="checkbox"
                  checked={responsibilityExpanded}
                  onChange={(e) => setResponsibilityExpanded(e.target.checked)}
                  className="accent-[#111111]"
                />
                <span className="text-xs font-semibold text-[#111111]">
                  My day-to-day scope of responsibility has expanded
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleChanged}
                  onChange={(e) => setRoleChanged(e.target.checked)}
                  className="accent-[#111111]"
                />
                <span className="text-xs font-semibold text-[#111111]">
                  I have transitioned to a new or elevated job title
                </span>
              </label>

              {roleChanged && (
                <div className="pl-6 space-y-1">
                  <label className="text-[11px] font-bold text-[#111111]">New Official Job Title</label>
                  <input
                    type="text"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#111111] block">
                    Wage Progression Growth (%)
                  </span>
                  <span className="text-[10px] text-[#111111]/60">
                    Net salary or hourly rate adjustment since start
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={wageGrowth}
                    onChange={(e) => setWageGrowth(Number(e.target.value))}
                    className="w-16 p-1.5 text-xs text-right font-bold tabular-nums rounded-lg bg-[#E8DDCC] border border-[#111111]/20 text-[#111111]"
                  />
                  <span className="text-xs font-bold text-[#111111]">%</span>
                </div>
              </div>
            </div>

            {/* Reflection Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">
                Qualitative Progression Reflections
              </label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe how your acquired capabilities impacted your workplace standing..."
                className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111] leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#111111]/12 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Outcome Record</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
