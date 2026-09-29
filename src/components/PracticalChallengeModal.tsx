import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code, Link, FileText, CheckCircle2, Award } from 'lucide-react';
import { PracticalChallenge } from '../types';
import { dataStore } from '../services/dataStore';
import { aiService } from '../services/aiService';

interface PracticalChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: PracticalChallenge;
  onComplete: () => void;
}

export const PracticalChallengeModal: React.FC<PracticalChallengeModalProps> = ({
  isOpen,
  onClose,
  challenge,
  onComplete,
}) => {
  const [submissionType, setSubmissionType] = useState<'text' | 'code' | 'repository_link'>('code');
  const [content, setContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    rubricBreakdown: Record<string, number>;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content && !repoUrl) return;
    setIsSubmitting(true);

    const submissionPayload = submissionType === 'repository_link' ? repoUrl : content;
    const evalResponse = await aiService.evaluatePracticalChallenge(
      challenge.title,
      submissionPayload,
      submissionType
    );

    dataStore.submitChallenge(challenge.id, submissionType, content, repoUrl);

    setResult({
      score: evalResponse.data.score,
      feedback: evalResponse.data.feedback,
      rubricBreakdown: evalResponse.data.rubricBreakdown,
    });
    setIsSubmitting(false);
  };

  const handleFinish = () => {
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
          className="w-full max-w-3xl max-h-[90vh] virt-glass-strong rounded-2xl border border-[#111111]/18 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                Hands-On Practical Demonstration
              </span>
              <h3 className="font-extrabold text-base text-[#111111]">{challenge.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#DED0BD] text-[#111111]/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!result ? (
              <>
                {/* Scenario & Context */}
                <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 block">
                    Engineering Brief
                  </span>
                  <p className="text-xs text-[#111111] leading-relaxed font-normal">
                    {challenge.scenario}
                  </p>
                </div>

                {/* Deliverables and Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F1E9DD]/80 border border-[#111111]/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 block">
                      Required Deliverables
                    </span>
                    <ul className="text-xs text-[#111111]/80 space-y-1.5 list-disc pl-4">
                      {challenge.deliverables.map((item, idx) => (
                        <li key={idx} className="leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F1E9DD]/80 border border-[#111111]/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 block">
                      Evaluation Criteria
                    </span>
                    <ul className="text-xs text-[#111111]/80 space-y-1.5 list-disc pl-4">
                      {challenge.evaluationCriteria.map((item, idx) => (
                        <li key={idx} className="leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Submission Mode Selector */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#111111] block">
                    Select Submission Method
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSubmissionType('code')}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl font-medium border transition-all ${
                        submissionType === 'code'
                          ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-xs'
                          : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Code / Manifest Editor</span>
                    </button>

                    <button
                      onClick={() => setSubmissionType('repository_link')}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl font-medium border transition-all ${
                        submissionType === 'repository_link'
                          ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-xs'
                          : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>GitHub / Git Repository</span>
                    </button>

                    <button
                      onClick={() => setSubmissionType('text')}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl font-medium border transition-all ${
                        submissionType === 'text'
                          ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-xs'
                          : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Technical Architecture Write-up</span>
                    </button>
                  </div>

                  {/* Inputs */}
                  {submissionType === 'repository_link' ? (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-semibold text-[#111111]">
                        Repository URL (GitHub, GitLab, or Bitbucket)
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/my-org/auth-api-manifests"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-semibold text-[#111111]">
                        {submissionType === 'code' ? 'Code / YAML Manifest Contents' : 'Technical Implementation Details'}
                      </label>
                      <textarea
                        rows={8}
                        placeholder={
                          submissionType === 'code'
                            ? `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: auth-api\nspec:\n  replicas: 3\n  ...`
                            : 'Explain your architecture, security mechanisms, rollout safeguards, and test verifications...'
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3.5 text-xs font-mono rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111] leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* RESULTS */
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex p-4 rounded-2xl bg-[#DED0BD] border border-[#111111]/20">
                  <Award className="w-10 h-10 text-[#111111]" />
                </div>

                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#111111]/60 block">
                    Practical Evaluation Result
                  </span>
                  <div className="text-4xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
                    {result.score}/100
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold rounded-sm shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      DEMONSTRATION EVIDENCE CREATED & VERIFIED
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 text-left space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 block">
                    Evaluator Feedback
                  </span>
                  <p className="text-xs text-[#111111] leading-relaxed">
                    {result.feedback}
                  </p>
                </div>

                <div className="text-left space-y-2 pt-2 border-t border-[#111111]/12">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 block">
                    Rubric Breakdown
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(result.rubricBreakdown).map(([criterion, score]) => (
                      <div
                        key={criterion}
                        className="p-3 rounded-xl bg-[#F1E9DD] border border-[#111111]/10 flex items-center justify-between text-xs"
                      >
                        <span className="text-[#111111] font-medium">{criterion}</span>
                        <span className="font-bold text-[#111111] tabular-nums">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            {!result ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting || (!content && !repoUrl)}
                  onClick={handleSubmit}
                  className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  {isSubmitting ? 'Evaluating Submission...' : 'Submit Practical Challenge'}
                </button>
              </>
            ) : (
              <div className="w-full flex justify-end">
                <button
                  onClick={handleFinish}
                  className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl"
                >
                  Done & View in Evidence Wallet
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
