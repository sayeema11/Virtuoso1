import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCheck, HelpCircle, XCircle } from 'lucide-react';
import { VerificationRequest } from '../types';
import { dataStore } from '../services/dataStore';

interface VerificationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: VerificationRequest;
  onComplete: () => void;
}

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onComplete,
}) => {
  const [decision, setDecision] = useState<'verified' | 'partially_verified' | 'unable_to_verify'>('verified');
  const [notes, setNotes] = useState('Demonstrated sound technical proficiency in production environment. Full verification endorsed.');

  if (!isOpen) return null;

  const handleDecisionSubmit = () => {
    dataStore.respondToVerification(request.id, decision, notes);
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
          className="w-full max-w-lg max-h-[90vh] virt-glass-strong rounded-2xl border border-[#111111]/18 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                  Employer / Mentor Endorsement
                </span>
                <h3 className="font-extrabold text-base text-[#111111]">
                  Verify Demonstrated Skill
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Request Summary Card */}
            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111111]">{request.userName}</span>
                <span className="text-[#111111]/60">{request.userRole}</span>
              </div>
              <div className="pt-1 border-t border-[#111111]/08">
                <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Skill Under Verification</span>
                <span className="text-xs font-extrabold text-[#111111]">{request.skillName}</span>
              </div>
              <div className="text-xs text-[#111111]/80 leading-relaxed pt-1">
                <strong>Submission Claim:</strong> {request.evidenceSummary}
              </div>
            </div>

            {/* Decision Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111111] block">
                Verification Assessment Decision
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('verified')}
                  className={`p-3 text-center rounded-xl border text-xs transition-all flex flex-col items-center gap-1.5 ${
                    decision === 'verified'
                      ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent font-bold shadow-xs'
                      : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Verify Full</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('partially_verified')}
                  className={`p-3 text-center rounded-xl border text-xs transition-all flex flex-col items-center gap-1.5 ${
                    decision === 'partially_verified'
                      ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent font-bold shadow-xs'
                      : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Partial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('unable_to_verify')}
                  className={`p-3 text-center rounded-xl border text-xs transition-all flex flex-col items-center gap-1.5 ${
                    decision === 'unable_to_verify'
                      ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent font-bold shadow-xs'
                      : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Unable</span>
                </button>
              </div>
            </div>

            {/* Notes / Feedback */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#111111]">
                Endorsement Notes & Feedback
              </label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="State your technical review feedback, observations, and recommendations..."
                className="w-full p-3 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111] leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDecisionSubmit}
              className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl"
            >
              Record Official Verification
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
