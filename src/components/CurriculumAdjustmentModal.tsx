import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  AlertTriangle,
  Sparkles,
  Sliders,
  Calendar,
  User,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { dataStore } from '../services/dataStore';

interface CurriculumAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVelocity?: number;
  thresholdVelocity?: number;
  onSuccess?: () => void;
}

export const CurriculumAdjustmentModal: React.FC<CurriculumAdjustmentModalProps> = ({
  isOpen,
  onClose,
  currentVelocity = 1.0,
  thresholdVelocity = 1.5,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'rebalance' | 'mentor' | 'threshold'>('rebalance');
  const [selectedStrategy, setSelectedStrategy] = useState<'micro_burst' | 'rebalance' | 'streamline'>('micro_burst');
  const [weeklyHours, setWeeklyHours] = useState<number>(6);
  const [mentorDate, setMentorDate] = useState<string>('2026-10-02');
  const [mentorNotes, setMentorNotes] = useState<string>(
    'Pacing check-in: Unblock workplace evidence for Linux System Internals and calibrate practical assessment timeline.'
  );
  const [adjustedThreshold, setAdjustedThreshold] = useState<number>(thresholdVelocity);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string>('');

  if (!isOpen) return null;

  const deficit = Math.max(
    5,
    Math.round(((thresholdVelocity - currentVelocity) / Math.max(0.1, thresholdVelocity)) * 100)
  );

  const handleApplyRebalance = () => {
    const titles = {
      micro_burst: '15-Minute Bite-Sized Micro-Burst Cadence',
      rebalance: 'Core Cloud Gap Focus (Terraform & IAM)',
      streamline: 'Practical Demonstration Sandbox Fast-Track',
    };

    dataStore.adjustCurriculumForVelocity({
      title: titles[selectedStrategy],
      strategy: selectedStrategy,
      weeklyHours,
      prioritySkills: ['Terraform Infrastructure Automation', 'Kubernetes Cluster Architecture', 'Cloud IAM Security'],
    });

    setSubmissionFeedback('Curriculum rebalanced successfully! Pathway updated to high-yield micro-cadence.');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onSuccess?.();
      onClose();
    }, 1400);
  };

  const handleScheduleMentor = () => {
    dataStore.scheduleMentorVelocityCheckIn('Sarah Jenkins (Apex Cloud Solutions)', mentorDate, [
      'Linux System Internals Workplace Verification',
      'Kubernetes Production Demonstration Sign-off',
      'Pacing & Milestone Alignment',
    ]);

    setSubmissionFeedback('1:1 Mentor check-in invitation dispatched to Sarah Jenkins.');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onSuccess?.();
      onClose();
    }, 1400);
  };

  const handleUpdateThreshold = () => {
    dataStore.triggerVelocityAlert(currentVelocity, adjustedThreshold, true);
    setSubmissionFeedback(`Velocity growth threshold recalibrated to ${adjustedThreshold.toFixed(1)} skills/month.`);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onSuccess?.();
      onClose();
    }, 1400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl virt-surface rounded-2xl border border-[#111111]/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/10 bg-[#E8DDCC]/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-xs">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#111111] font-['Cabinet_Grotesk'] leading-tight">
                  Skill Velocity Recovery & Check-In
                </h3>
                <p className="text-xs text-[#111111]/60">
                  Calibrate your pathway when acquisition pace falls below projected growth threshold.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#DED0BD] text-[#111111]/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Telemetry Deficit Banner */}
            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#111111]/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wide">
                    Velocity Deficit Detected
                  </span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-md tabular-nums shadow-xs self-start sm:self-auto">
                  -{deficit}% Below Projected Pace
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#E8DDCC]/50 border border-[#111111]/08">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Current Velocity</span>
                  <span className="text-lg font-black text-[#111111] font-mono tabular-nums">
                    {currentVelocity.toFixed(1)} / mo
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#E8DDCC]/50 border border-[#111111]/08">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Growth Threshold</span>
                  <span className="text-lg font-black text-[#111111] font-mono tabular-nums">
                    {thresholdVelocity.toFixed(1)} / mo
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#E8DDCC]/50 border border-[#111111]/08">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Milestone Impact</span>
                  <span className="text-sm font-black text-[#111111] font-mono mt-1 block">
                    +3.4 Wks Delay
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#111111]/80 leading-relaxed">
                At your current rate, reaching the <strong>Senior Cloud Platform Engineer (10 Competencies)</strong> milestone will slip into 2027. Selecting an intervention below restores acquisition momentum.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#111111]/12 text-xs font-bold">
              <button
                onClick={() => setActiveTab('rebalance')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'rebalance'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111]/50 hover:text-[#111111]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                1. Curriculum Rebalance
              </button>
              <button
                onClick={() => setActiveTab('mentor')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'mentor'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111]/50 hover:text-[#111111]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                2. Mentor Check-In
              </button>
              <button
                onClick={() => setActiveTab('threshold')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'threshold'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#111111]/50 hover:text-[#111111]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                3. Recalibrate Target
              </button>
            </div>

            {/* Tab 1: Curriculum Rebalancing */}
            {activeTab === 'rebalance' && (
              <div className="space-y-4">
                <div className="text-xs text-[#111111]/70">
                  Select an adaptive curriculum restructuring strategy to bypass learning bottlenecks and regain velocity:
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Strategy 1 */}
                  <label
                    onClick={() => setSelectedStrategy('micro_burst')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      selectedStrategy === 'micro_burst'
                        ? 'bg-[#F5EEE4] border-[#111111] shadow-sm'
                        : 'bg-[#F1E9DD]/40 border-[#111111]/10 hover:border-[#111111]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={selectedStrategy === 'micro_burst'}
                      onChange={() => setSelectedStrategy('micro_burst')}
                      className="mt-1 accent-[#111111]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#111111]">
                          15-Minute Micro-Burst Cadence (Recommended)
                        </span>
                        <span className="text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white px-1.5 py-0.5 rounded-sm shadow-2xs">
                          +0.6 vel lift
                        </span>
                      </div>
                      <p className="text-[#111111]/70 mt-1 leading-snug">
                        Splits 45-minute comprehensive architectural labs into daily, high-intensity 15-minute micro-learning sprints. Maximizes retention without scheduling friction.
                      </p>
                    </div>
                  </label>

                  {/* Strategy 2 */}
                  <label
                    onClick={() => setSelectedStrategy('rebalance')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      selectedStrategy === 'rebalance'
                        ? 'bg-[#F5EEE4] border-[#111111] shadow-sm'
                        : 'bg-[#F1E9DD]/40 border-[#111111]/10 hover:border-[#111111]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={selectedStrategy === 'rebalance'}
                      onChange={() => setSelectedStrategy('rebalance')}
                      className="mt-1 accent-[#111111]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#111111]">
                          High-Yield Core Cloud Focus (Terraform & IAM)
                        </span>
                        <span className="text-[10px] font-bold bg-[#111111]/10 text-[#111111] px-1.5 py-0.5 rounded-sm">
                          Direct Gap Match
                        </span>
                      </div>
                      <p className="text-[#111111]/70 mt-1 leading-snug">
                        Deprioritizes tangential professional electives and focuses 100% of study time on closing the critical Terraform State and IAM Cloud Governance requirements.
                      </p>
                    </div>
                  </label>

                  {/* Strategy 3 */}
                  <label
                    onClick={() => setSelectedStrategy('streamline')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      selectedStrategy === 'streamline'
                        ? 'bg-[#F5EEE4] border-[#111111] shadow-sm'
                        : 'bg-[#F1E9DD]/40 border-[#111111]/10 hover:border-[#111111]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={selectedStrategy === 'streamline'}
                      onChange={() => setSelectedStrategy('streamline')}
                      className="mt-1 accent-[#111111]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#111111]">
                          Workplace Practice & Challenge Fast-Track
                        </span>
                        <span className="text-[10px] font-bold bg-[#111111]/10 text-[#111111] px-1.5 py-0.5 rounded-sm">
                          Evidence Conversion
                        </span>
                      </div>
                      <p className="text-[#111111]/70 mt-1 leading-snug">
                        Converts passive theoretical quiz reading into immediate practical challenges and workplace application logging to accelerate supervisor verification.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Hours Slider */}
                <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111]">Weekly Practice Time Target</span>
                    <span className="font-mono font-bold text-[#111111]">{weeklyHours} Hours / Week</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="14"
                    step="1"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full accent-[#111111]"
                  />
                  <div className="flex justify-between text-[10px] text-[#111111]/50">
                    <span>3 hrs (Light Pacing)</span>
                    <span>6 hrs (Sustainable)</span>
                    <span>14 hrs (Sprint)</span>
                  </div>
                </div>

                <button
                  onClick={handleApplyRebalance}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Curriculum Rebalance & Restore Pacing
                </button>
              </div>
            )}

            {/* Tab 2: Mentor Check-In */}
            {activeTab === 'mentor' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    SJ
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111111]">Sarah Jenkins</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#E8DDCC] text-[#111111] rounded">
                        Employer Mentor
                      </span>
                    </div>
                    <span className="text-[#111111]/70 block">Apex Cloud Solutions • Senior DevOps Lead</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#111111] block mb-1">Requested Check-In Date</label>
                    <input
                      type="date"
                      value={mentorDate}
                      onChange={(e) => setMentorDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/20 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#111111] block mb-1">Check-In Focus & Agenda Notes</label>
                    <textarea
                      rows={3}
                      value={mentorNotes}
                      onChange={(e) => setMentorNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/20 text-xs leading-relaxed focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#E8DDCC]/50 border border-[#111111]/10 text-[11px] text-[#111111]/70 space-y-1">
                    <span className="font-bold text-[#111111] block">Expected Meeting Outcomes:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Review blockers on pending Linux System Internals verification.</li>
                      <li>Assign workplace task suitable for Kubernetes zero-downtime evidence.</li>
                      <li>Establish realistic October milestone targets.</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleScheduleMentor}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Send 1:1 Check-In Invitation to Mentor
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Threshold Calibration */}
            {activeTab === 'threshold' && (
              <div className="space-y-4">
                <div className="text-xs text-[#111111]/70 leading-relaxed">
                  If your workplace demands or study availability have changed, adjust your target velocity threshold to a calibrated baseline. Notifications will only trigger if velocity drops below this new goal.
                </div>

                <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111]">Calibrated Growth Threshold</span>
                    <span className="text-sm font-black text-[#111111] font-mono tabular-nums">
                      {adjustedThreshold.toFixed(1)} Skills / Month
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={adjustedThreshold}
                    onChange={(e) => setAdjustedThreshold(Number(e.target.value))}
                    className="w-full accent-[#4F46E5]"
                  />

                  <div className="flex justify-between text-[10px] text-[#111111]/50 font-mono">
                    <span>0.5/mo (Paced)</span>
                    <span>1.0/mo (Current Rate)</span>
                    <span>1.5/mo (Target)</span>
                    <span>2.5/mo (Aggressive)</span>
                  </div>

                  <div className="pt-2 border-t border-[#111111]/08 text-[11px] text-[#111111]/80">
                    {adjustedThreshold <= currentVelocity ? (
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Current pace ({currentVelocity.toFixed(1)}/mo) satisfies this threshold. Alert will be cleared.
                      </span>
                    ) : (
                      <span className="text-[#111111]/70">
                        Requires a +{(adjustedThreshold - currentVelocity).toFixed(1)} skills/mo boost to avoid notifications.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpdateThreshold}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Save Calibrated Growth Threshold
                </button>
              </div>
            )}

            {/* Success Banner */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{submissionFeedback}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
