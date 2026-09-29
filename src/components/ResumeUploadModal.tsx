import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { dataStore } from '../services/dataStore';
import { aiService } from '../services/aiService';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<'upload' | 'extracted'>('upload');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<
    Array<{
      jobTitle: string;
      organization: string;
      startDate: string;
      endDate?: string;
      description: string;
    }>
  >([]);

  if (!isOpen) return null;

  const handleSimulatedFileUpload = async (name: string) => {
    setFileName(name);
    setIsProcessing(true);

    const parsed = await aiService.parseResume(name);
    setSkills(parsed.data.skills);
    setExperiences(parsed.data.experiences);
    setIsProcessing(false);
    setStep('extracted');
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    dataStore.uploadResume(fileName, skills, experiences);
    dataStore.confirmResumeExtraction();
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
          className="w-full max-w-2xl max-h-[90vh] virt-glass-strong rounded-2xl border border-[#111111]/18 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                  Experience Extraction Engine
                </span>
                <h3 className="font-extrabold text-base text-[#111111]">
                  Resume & Work History Intake
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {step === 'upload' ? (
              <div className="space-y-4">
                <div
                  onClick={() => handleSimulatedFileUpload('Candidate_Technical_Resume_2026.pdf')}
                  className="border-2 border-dashed border-[#111111]/25 hover:border-[#111111] rounded-2xl p-8 text-center cursor-pointer bg-[#F5EEE4] transition-all group"
                >
                  <div className="p-3 rounded-2xl bg-[#E8DDCC] w-12 h-12 mx-auto flex items-center justify-center text-[#111111] group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111] mt-3">
                    Click to Upload Resume (PDF or DOCX)
                  </h4>
                  <p className="text-xs text-[#111111]/60 mt-1 max-w-xs mx-auto">
                    VIRTUOSO will extract work records and claimed skills into an editable review staging area.
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-semibold rounded-lg shadow-2xs">
                    Select File or Load Demo CV
                  </span>
                </div>

                {isProcessing && (
                  <div className="p-4 rounded-xl bg-[#F1E9DD] border border-[#111111]/15 text-center text-xs text-[#111111] animate-pulse">
                    Parsing document structure and classifying technical competencies...
                  </div>
                )}
              </div>
            ) : (
              /* EXTRACTED STAGING REVIEW */
              <div className="space-y-5">
                {/* Notice Banner distinguishing Resume Claim from Verified Evidence */}
                <div className="p-3.5 rounded-xl bg-[#DED0BD]/70 border border-[#111111]/20 flex items-start gap-2.5 text-xs text-[#111111]">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-[#111111]" />
                  <div className="leading-snug">
                    <strong>Resume Evidence Policy:</strong> Extracted competencies are registered as <strong>Claimed</strong> in your capability profile. They do not count as verified mastery until validated through objective assessment, lab demonstration, or supervisor sign-off.
                  </div>
                </div>

                {/* Extracted Skills (Editable) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                      Extracted Competencies ({skills.length})
                    </label>
                    <span className="text-[10px] text-[#111111]/50">Click x to remove</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/12">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-medium shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="hover:text-red-300 opacity-70 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add manual skill */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add an unlisted skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 p-2 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-2 text-xs font-bold rounded-xl bg-[#DED0BD] hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] hover:text-white text-[#111111] transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Extracted Experiences (Editable) */}
                <div className="space-y-2 pt-2 border-t border-[#111111]/12">
                  <label className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                    Extracted Work History ({experiences.length})
                  </label>

                  <div className="space-y-2">
                    {experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 text-xs space-y-1 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="absolute top-3 right-3 text-[#111111]/40 hover:text-[#111111]"
                          title="Remove entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="font-bold text-[#111111]">{exp.jobTitle}</div>
                        <div className="text-[11px] text-[#111111]/70">
                          {exp.organization} · {exp.startDate} – {exp.endDate || 'Present'}
                        </div>
                        <p className="text-[11px] text-[#111111]/80 leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl transition-all"
            >
              Cancel
            </button>
            {step === 'extracted' && (
              <button
                onClick={handleConfirm}
                className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Update Capability Profile</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
