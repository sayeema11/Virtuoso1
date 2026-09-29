import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  User,
  Briefcase,
  Target,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  GraduationCap,
  TrendingUp,
  FileText,
  Lock,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { dataStore } from '../services/dataStore';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'apprentice');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(currentUser.consentAccepted ?? true);
  const [telemetryAccepted, setTelemetryAccepted] = useState<boolean>(true);
  const [ledgerConsent, setLedgerConsent] = useState<boolean>(true);

  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [currentJobTitle, setCurrentJobTitle] = useState(currentUser.currentJobTitle || 'Junior Cloud Practitioner');
  const [targetJobTitle, setTargetJobTitle] = useState(currentUser.targetJobTitle || 'Senior Cloud & DevOps Architect');
  const [district, setDistrict] = useState(currentUser.district || 'North West Tech Corridor');
  const [yearsOfExperience, setYearsOfExperience] = useState(currentUser.yearsOfExperience || 2);
  const [industry, setIndustry] = useState(currentUser.industry || 'Cloud & Enterprise Infrastructure');

  if (!isOpen) return null;

  const personas: Array<{
    role: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
  }> = [
    {
      role: 'employee',
      title: 'Employee',
      subtitle: 'Current Workforce',
      description: 'Internal mobility, benchmark alignment, promotion readiness, and on-the-job mastery.',
      icon: <Briefcase className="w-5 h-5 text-indigo-700" />,
      badge: 'Workforce',
    },
    {
      role: 'job_seeker',
      title: 'Job Seeker',
      subtitle: 'Employment Ready',
      description: 'Close critical skill gaps, build verified evidence, and showcase production-ready capabilities to employers.',
      icon: <Target className="w-5 h-5 text-sky-700" />,
      badge: 'Placement',
    },
    {
      role: 'trainee',
      title: 'Trainee',
      subtitle: 'Skill Development',
      description: 'Structured technical training, cohort micro-missions, and diagnostic milestone evaluations.',
      icon: <GraduationCap className="w-5 h-5 text-emerald-700" />,
      badge: 'Academy',
    },
    {
      role: 'apprentice',
      title: 'Apprentice',
      subtitle: 'Practical Exposure',
      description: 'Workplace training, mentor sign-offs, production sandboxes, and longitudinal 30/60/90 progression.',
      icon: <Award className="w-5 h-5 text-amber-700" />,
      badge: 'Industry Placement',
    },
    {
      role: 'self_employed',
      title: 'Self-Employed',
      subtitle: 'Business Growth',
      description: 'Independent consultants, contractors, and agency founders verifying cutting-edge skills for client mandates.',
      icon: <TrendingUp className="w-5 h-5 text-violet-700" />,
      badge: 'Enterprise',
    },
  ];

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted) return;

    dataStore.updateProfile({
      role: selectedRole,
      roleCategory: ['training_provider', 'employer_mentor', 'programme_admin'].includes(selectedRole)
        ? 'organization'
        : 'individual',
      fullName,
      currentJobTitle,
      targetJobTitle,
      district,
      yearsOfExperience: Number(yearsOfExperience),
      industry,
      consentAccepted: true,
      onboardingCompleted: true,
    });

    dataStore.addNotification({
      title: 'Official Onboarding Initialized',
      message: `Welcome ${fullName}! Your ${personas.find((p) => p.role === selectedRole)?.title} profile and consent permissions are active. Follow the 12-stage progression to verify your skills.`,
      type: 'system',
    });

    onClose();
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#F5EEE4] border border-[#111111]/20 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-[#111111]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#111111]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/60">
                WELCOME TO VIRTUOSO · PROFILE SETUP
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
                {step === 1 && 'Select Your Role Type'}
                {step === 2 && 'Privacy & Skill Data Consent'}
                {step === 3 && 'Career Baseline & Target Role'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#111111]/70 font-mono">Step {step} of 3</span>
            <div className="w-20 h-1.5 bg-[#111111]/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* STEP 1: USER TYPE SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-[#111111]/80 leading-relaxed">
              VIRTUOSO supports 5 core user personas. Your selected user type configures tailored assessment benchmarks, workplace verification flows, and longitudinal tracking.
            </p>

            <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {personas.map((p) => {
                const isSelected = selectedRole === p.role;

                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => setSelectedRole(p.role)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#4F46E5] shadow-md ring-2 ring-[#4F46E5]/20'
                        : 'bg-[#E8DDCC]/60 border-[#111111]/10 hover:bg-[#E8DDCC]'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-white/80 border border-[#111111]/10 shrink-0">
                      {p.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#111111]">{p.title}</h4>
                          <span className="text-[11px] font-semibold text-[#111111]/60">({p.subtitle})</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#111111]/08 text-[#111111]/80">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#111111]/75 mt-1 leading-normal">{p.description}</p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#4F46E5] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="virt-btn-primary px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Consent & Privacy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONSENT & PRIVACY */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-[#111111]/80 leading-relaxed">
              VIRTUOSO operates on a Zero-Trust skill verification framework. Please review and accept the data processing, diagnostic assessment, and employer verification consents.
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-white border border-[#111111]/10 text-xs">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
                  required
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#111111]">Primary Data Usage & Skill Tracking Consent (Mandatory)</span>
                  <p className="text-[11px] text-[#111111]/70 leading-normal">
                    I agree to store and process my work history, assessments, practical challenges, and workplace application evidence within the VIRTUOSO cloud repository.
                  </p>
                </div>
              </label>

              <div className="h-px bg-[#111111]/10" />

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ledgerConsent}
                  onChange={(e) => setLedgerConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#111111]">Evidence Ledger & Supervisor Endorsements</span>
                  <p className="text-[11px] text-[#111111]/70 leading-normal">
                    Allow designated supervisors, accredited training providers, and internal mentors to review and verify practical lab submissions and workplace execution records.
                  </p>
                </div>
              </label>

              <div className="h-px bg-[#111111]/10" />

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={telemetryAccepted}
                  onChange={(e) => setTelemetryAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#111111]">Longitudinal 30/60/90 Day Outcome Telemetry</span>
                  <p className="text-[11px] text-[#111111]/70 leading-normal">
                    Participate in longitudinal career retention, wage growth, and competency progression analytics aggregated for regional workforce intelligence.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="virt-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                disabled={!consentAccepted}
                onClick={() => setStep(3)}
                className="virt-btn-primary px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Profile Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROFILE SETUP & TARGET DIRECTION */}
        {step === 3 && (
          <form onSubmit={handleFinishOnboarding} className="space-y-4">
            <p className="text-xs text-[#111111]/80 leading-relaxed">
              Confirm your baseline information. This feeds directly into the AI Analysis and Skill-Gap Differential Engine.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#111111]/60" />
                  <span>Full Legal Name</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#111111]/60" />
                  <span>District / Region</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. North West Tech Corridor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#111111]/60" />
                  <span>Current Role / Baseline Title</span>
                </label>
                <input
                  type="text"
                  value={currentJobTitle}
                  onChange={(e) => setCurrentJobTitle(e.target.value)}
                  placeholder="e.g. Junior Cloud Practitioner"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#111111]/60" />
                  <span>Desired Target Career Role</span>
                </label>
                <input
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g. Senior Cloud & DevOps Architect"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">
                  Years of Relevant Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">
                  Industry / Technical Domain
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Cloud & Enterprise Infrastructure"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#111111]/15 text-xs text-[#111111] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="virt-btn-secondary px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="virt-btn-primary px-7 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Onboarding & Enter Ecosystem</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
