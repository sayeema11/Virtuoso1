import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, CheckCircle2 } from 'lucide-react';
import { Skill } from '../types';
import { dataStore } from '../services/dataStore';

interface WorkplaceApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  preselectedSkillId?: string;
  onComplete: () => void;
}

export const WorkplaceApplicationModal: React.FC<WorkplaceApplicationModalProps> = ({
  isOpen,
  onClose,
  skills,
  preselectedSkillId,
  onComplete,
}) => {
  const [skillId, setSkillId] = useState(preselectedSkillId || (skills[0]?.id ?? ''));
  const [usageStatus, setUsageStatus] = useState<'used_at_work' | 'partially_used' | 'not_yet' | 'not_relevant'>('used_at_work');
  const [purpose, setPurpose] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [contribution, setContribution] = useState('');
  const [supervisorName, setSupervisorName] = useState('Sarah Jenkins');
  const [supervisorEmail, setSupervisorEmail] = useState('sarah.jenkins@apexcloud.co.uk');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillId) return;

    dataStore.logWorkplaceApplication(
      skillId,
      usageStatus,
      purpose,
      problemSolved,
      contribution,
      supervisorName,
      supervisorEmail
    );

    onComplete();
    onClose();
  };

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
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                  Workplace Practice Engine
                </span>
                <h3 className="font-extrabold text-base text-[#111111]">
                  Record On-the-Job Application
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#DED0BD] text-[#111111]/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Skill Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">Target Capability / Skill</label>
              <select
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Workplace Usage Status Radio Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111] block">Workplace Usage Status</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'used_at_work', label: 'Used at Work', desc: 'Applied in active projects' },
                  { id: 'partially_used', label: 'Partially Used', desc: 'Assisted team or in lab' },
                  { id: 'not_yet', label: 'Not Yet', desc: 'Awaiting rotation assignment' },
                  { id: 'not_relevant', label: 'Not Relevant', desc: 'Not used in current position' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setUsageStatus(item.id as any)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      usageStatus === item.id
                        ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent font-semibold shadow-xs'
                        : 'bg-[#F5EEE4] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contextual Fields when used */}
            {(usageStatus === 'used_at_work' || usageStatus === 'partially_used') && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">
                    Operational Purpose / Project Task
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement blue/green deployment strategy for payment auth API"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">
                    Concrete Problem Solved
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Prevented 502 bad gateway spikes during peak traffic rollouts by configuring connection draining."
                    value={problemSolved}
                    onChange={(e) => setProblemSolved(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">
                    Your Direct Individual Contribution
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Authored YAML manifests, configured preStop lifecycle hooks, and verified rollback behavior."
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#111111]">
                      Supervisor / Mentor Name
                    </label>
                    <input
                      type="text"
                      required
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#111111]">
                      Supervisor Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={supervisorEmail}
                      onChange={(e) => setSupervisorEmail(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#DED0BD]/60 border border-[#111111]/15 flex items-start gap-2 text-xs text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#111111]" />
                  <span>
                    Submitting this record will update your evidence wallet to <strong>Applied</strong> status and create a verification request for your supervisor.
                  </span>
                </div>
              </>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#111111]/12 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl"
              >
                Save Workplace Application
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
