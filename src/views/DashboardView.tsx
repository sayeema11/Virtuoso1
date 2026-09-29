import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Target,
  Compass,
  GitPullRequest,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Briefcase,
  AlertCircle,
  Activity,
  Sparkles,
  Download,
  FileText,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { CapabilityBadge } from '../components/CapabilityBadge';
import { EvidenceStatusBadge } from '../components/EvidenceStatusBadge';
import { SkillAcquisitionVelocityChart, ChartAnalysisMode } from '../components/SkillAcquisitionVelocityChart';
import { SubtleCanvasConfetti, SubtleCanvasConfettiRef } from '../components/SubtleCanvasConfetti';
import { generateSkillVelocityPdfReport } from '../services/pdfReportGenerator';
import { MentorSuggestion } from '../components/MentorSuggestion';

interface DashboardViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
  onOpenWorkplace: (skillId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
  onOpenWorkplace,
}) => {
  const [chartAnalysisMode, setChartAnalysisMode] = useState<ChartAnalysisMode>('absolute');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const confettiRef = useRef<SubtleCanvasConfettiRef>(null);

  const handleTriggerCelebration = (title: string, subtitle?: string) => {
    confettiRef.current?.trigger({
      title,
      subtitle,
      count: 75,
    });
  };

  const handleDownloadPdfReport = async () => {
    try {
      setIsGeneratingPdf(true);
      await new Promise((resolve) => setTimeout(resolve, 80));

      generateSkillVelocityPdfReport({
        database,
        currentAlignment,
        targetAlignment,
        effectiveVelocity: 1.0,
        thresholdVelocity: 1.5,
      });

      setPdfSuccessMessage('Skill Velocity & Milestone Summary PDF downloaded.');
      handleTriggerCelebration(
        'Report Downloaded!',
        'Your Skill Acquisition Velocity & Milestone Achievement PDF is ready.'
      );
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const { currentUser, userCapabilities, learningMissions, learningProgress, evidenceItems, verificationRequests, experiences } = database;

  // Real calculations
  const totalSkills = userCapabilities.length;
  const verifiedSkillsCount = userCapabilities.filter((c) => c.isVerified).length;
  const activeMissionsCount = learningProgress.filter((p) => p.status === 'in_progress').length;
  const completedMissionsCount = learningProgress.filter((p) => p.status === 'completed').length;
  const pendingVerificationsCount = verificationRequests.filter((r) => r.status === 'pending').length;

  // Current Role Alignment (deterministic)
  const currentReqs = database.roleRequirements.filter((r) => r.roleTitle === currentUser.currentJobTitle);
  const targetReqs = database.roleRequirements.filter((r) => r.roleTitle === currentUser.targetJobTitle);

  let currentAlignment = 0;
  if (currentReqs.length > 0) {
    const matched = currentReqs.filter((req) => {
      const cap = userCapabilities.find((c) => c.skillId === req.skillId);
      return cap && cap.currentLevel !== 'No Evidence' && cap.currentLevel !== 'Limited';
    }).length;
    currentAlignment = Math.round((matched / currentReqs.length) * 100);
  }

  let targetAlignment = 0;
  if (targetReqs.length > 0) {
    const matched = targetReqs.filter((req) => {
      const cap = userCapabilities.find((c) => c.skillId === req.skillId);
      return cap && (cap.currentLevel === 'Proficient' || cap.currentLevel === 'Strong' || cap.currentLevel === 'Advanced');
    }).length;
    targetAlignment = Math.round((matched / targetReqs.length) * 100);
  }

  return (
    <div className="space-y-6 relative">
      {/* Subtle Canvas-Based Confetti Animation Overlay */}
      <SubtleCanvasConfetti ref={confettiRef} />

      {/* Hero Executive Status Banner */}
      <div className="p-6 rounded-2xl virt-surface border border-[#111111]/12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            INDIVIDUAL PROGRESSION PROFILE
          </span>
          <h2 className="text-2xl font-extrabold text-[#111111] font-['Cabinet_Grotesk'] mt-0.5">
            {currentUser.fullName || 'Welcome to VIRTUOSO'}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#111111]/70 mt-1">
            <span>{currentUser.currentJobTitle || 'Role: Not Specified'}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.organizationName || 'Independent Learner'}</span>
            <span aria-hidden="true">·</span>
            <span>Target: <strong className="text-[#111111]">{currentUser.targetJobTitle || 'Set Target Career Goal'}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Velocity & Milestone PDF Report Button */}
          {userCapabilities.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadPdfReport}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-[#F5EEE4] hover:bg-[#DED0BD] border border-[#111111]/15 hover:border-[#111111]/30 text-[#111111] transition-all flex items-center gap-2 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
              title="Generate and download a PDF summary of your current skill acquisition velocity and milestone achievements"
            >
              <Download className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate(userCapabilities.length > 0 ? 'pathway' : 'experience')}
            className="virt-btn-primary px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <span>{userCapabilities.length > 0 ? 'Resume Career Pathway' : 'Add Experience & Resume'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New User Welcome / Empty State Guide */}
      {(!currentUser.fullName || (experiences.length === 0 && userCapabilities.length === 0)) && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F5EEE4] to-[#E8DDCC] border border-[#111111]/15 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/60">
                Personalized Career Discovery
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#111111] font-['Cabinet_Grotesk']">
                {currentUser.fullName ? `Welcome, ${currentUser.fullName}!` : "Let's Build Your Career Profile"}
              </h3>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed max-w-2xl">
            VIRTUOSO analyzes your real-world work experience, maps your existing competencies against industry benchmarks, and builds a personalized progression plan with adaptive micro-learning and practical demonstrations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onNavigate('experience')}
              className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-[#111111]/12 hover:border-[#111111]/30 text-left space-y-1 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#111111]">
                <FileText className="w-4 h-4 text-[#4F46E5]" />
                <span>1. Provide Experience</span>
              </div>
              <p className="text-[11px] text-[#111111]/70">
                Upload your CV or add past roles, tools, and projects.
              </p>
            </button>
            <button
              onClick={() => onNavigate('current-role')}
              className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-[#111111]/12 hover:border-[#111111]/30 text-left space-y-1 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#111111]">
                <Target className="w-4 h-4 text-[#4F46E5]" />
                <span>2. Set Career Goal</span>
              </div>
              <p className="text-[11px] text-[#111111]/70">
                Define your target role to unlock customized gap analysis.
              </p>
            </button>
            <button
              onClick={() => onNavigate('learning')}
              className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-[#111111]/12 hover:border-[#111111]/30 text-left space-y-1 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#111111]">
                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                <span>3. Learn & Validate</span>
              </div>
              <p className="text-[11px] text-[#111111]/70">
                Complete bite-sized missions and practical challenges.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Optional PDF Generation Feedback Banner */}
      {pdfSuccessMessage && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{pdfSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setPdfSuccessMessage(null)}
            className="text-white/70 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Numerical Grid (Tabular Figures, Solid Beige Surfaces) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <div className="flex items-center justify-between text-xs text-[#111111]/60">
            <span>Current Role Fit</span>
            <Target className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {currentAlignment}%
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">
            Based on {currentReqs.length} required competencies
          </span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <div className="flex items-center justify-between text-xs text-[#111111]/60">
            <span>Target Role Readiness</span>
            <Compass className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {targetAlignment}%
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">
            {targetReqs.length} target role benchmarks
          </span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <div className="flex items-center justify-between text-xs text-[#111111]/60">
            <span>Verified Mastery</span>
            <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {verifiedSkillsCount} <span className="text-sm font-normal opacity-60">/ {totalSkills}</span>
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">
            Full employer sign-offs completed
          </span>
        </div>

        <div className="p-4 rounded-xl virt-surface border border-[#111111]/10">
          <div className="flex items-center justify-between text-xs text-[#111111]/60">
            <span>Learning Velocity</span>
            <BookOpen className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="text-2xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
            {completedMissionsCount} <span className="text-sm font-normal opacity-60">completed</span>
          </div>
          <span className="text-[11px] text-[#111111]/70 mt-0.5 block">
            {activeMissionsCount} active in flight
          </span>
        </div>
      </div>

      {/* 6-Month Skill Acquisition Progress & Growth Velocity Chart (Recharts) */}
      <div className="space-y-3">
        {/* Recharts Analytics Header & Mode Toggle Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#E8DDCC]/50 border border-[#111111]/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-xs">
              {chartAnalysisMode === 'absolute' ? (
                <Award className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
                  GROWTH TREND TELEMETRY
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm font-bold bg-[#111111]/10 text-[#111111]">
                  {chartAnalysisMode === 'absolute' ? 'Cumulative Volume' : 'Pacing & Threshold'}
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-[#111111] font-['Cabinet_Grotesk']">
                {chartAnalysisMode === 'absolute'
                  ? 'Absolute Skill Level Progression'
                  : 'Growth Velocity Dynamics & Threshold Monitoring'}
              </h3>
            </div>
          </div>

          {/* Controls: Mode Switcher + Milestone Celebration Trigger + Report Download */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Download Report Button */}
            <button
              type="button"
              onClick={handleDownloadPdfReport}
              disabled={isGeneratingPdf}
              className="px-2.5 py-1.5 rounded-xl border border-[#111111]/15 hover:border-transparent bg-[#F5EEE4] hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] text-[#111111] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
              title="Download PDF report summary of skill acquisition velocity and milestone achievements"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Exporting...' : 'Download Report'}</span>
            </button>

            {/* Quick Celebrate Milestone Button */}
            <button
              type="button"
              onClick={() =>
                handleTriggerCelebration(
                  'Senior Benchmark Milestone Achieved!',
                  'Senior Platform Engineer benchmark reached with 10 validated competencies at current velocity.'
                )
              }
              className="px-2.5 py-1.5 rounded-xl border border-[#111111]/15 hover:border-transparent bg-[#F5EEE4] hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] text-[#111111] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title="Trigger subtle confetti to celebrate reaching a major skill milestone or projected goal date"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Celebrate Goal Date</span>
            </button>

            <span className="text-xs font-semibold text-[#111111]/70">Analysis Mode:</span>
            <div className="inline-flex p-1 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 shadow-inner">
              <button
                type="button"
                onClick={() => setChartAnalysisMode('absolute')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chartAnalysisMode === 'absolute'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
                title="Switch chart to Absolute Skill Level (cumulative acquired competencies & benchmark progression)"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Absolute Skill Level</span>
              </button>

              <button
                type="button"
                onClick={() => setChartAnalysisMode('velocity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chartAnalysisMode === 'velocity'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
                title="Switch chart to Growth Velocity (monthly acquisition velocity vs target threshold)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Growth Velocity</span>
              </button>
            </div>
          </div>
        </div>

        <SkillAcquisitionVelocityChart
          database={database}
          analysisMode={chartAnalysisMode}
          onAnalysisModeChange={setChartAnalysisMode}
          onTriggerCelebration={handleTriggerCelebration}
        />
      </div>

      {/* Main Split: Immediate Actions & Priority Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Progression Journey & Active Missions (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Recommended Actions */}
          <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Next Immediate Career Progression Actions
                </h3>
                <p className="text-xs text-[#111111]/60">
                  Priority milestones to convert unverified claims into certified capabilities.
                </p>
              </div>
              <button
                onClick={() => onNavigate('skill-gaps')}
                className="text-xs font-semibold text-[#111111] hover:underline"
              >
                View all gaps →
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Action 1: Assessment */}
              <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#E8DDCC] text-[#111111]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#111111] block">
                      Validate Terraform Knowledge via Diagnostic Assessment
                    </span>
                    <span className="text-[11px] text-[#111111]/70">
                      Infrastructure as Code (Terraform) is currently Claimed on resume only.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenAssessment('sk-terraform', 'Infrastructure as Code (Terraform)')}
                  className="virt-btn-primary px-3 py-1.5 text-xs font-semibold rounded-lg"
                >
                  Take Assessment
                </button>
              </div>

              {/* Action 2: Workplace Practice */}
              <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#E8DDCC] text-[#111111]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#111111] block">
                      Record On-the-Job Application for CI/CD Automation
                    </span>
                    <span className="text-[11px] text-[#111111]/70">
                      Demonstrated in lab. Record production usage to request employer verification.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenWorkplace('sk-cicd')}
                  className="virt-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg"
                >
                  Log Workplace Usage
                </button>
              </div>

              {/* Action 3: Ingress Mission */}
              <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#E8DDCC] text-[#111111]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#111111] block">
                      Continue Learning: Kubernetes Ingress Controllers & Zero-Downtime Rollouts
                    </span>
                    <span className="text-[11px] text-[#111111]/70">
                      45% completed. Finish reflection notes to unlock challenge.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('learning')}
                  className="virt-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg"
                >
                  Resume Mission
                </button>
              </div>
            </div>
          </div>

          {/* Capability Matrix Preview */}
          <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Current Capability Profile Overview
                </h3>
                <p className="text-xs text-[#111111]/60">
                  Real evidence-backed ratings across your technical skill spectrum.
                </p>
              </div>
              <button
                onClick={() => onNavigate('capability')}
                className="text-xs font-semibold text-[#111111] hover:underline"
              >
                Inspect detailed matrix →
              </button>
            </div>

            <div className="divide-y divide-[#111111]/08">
              {userCapabilities.slice(0, 5).map((cap) => (
                <div key={cap.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#111111] block">{cap.skillName}</span>
                    <span className="text-[10px] text-[#111111]/60">
                      {cap.category} · {cap.evidenceCount} piece(s) of evidence
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CapabilityBadge level={cap.currentLevel} showScore />
                    <EvidenceStatusBadge status={cap.evidenceStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Verification Feed & Progression (1 Col) */}
        <div className="space-y-6">
          {/* Verification Requests Card */}
          <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#111111]">
                Verification Feed
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm shadow-2xs">
                {pendingVerificationsCount} Pending
              </span>
            </div>

            <div className="space-y-2">
              {verificationRequests.slice(0, 2).map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-[#111111]">
                    <span>{req.skillName}</span>
                    <span className="text-[10px] font-semibold text-[#111111]/60 capitalize">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#111111]/80 leading-snug">
                    {req.evidenceSummary}
                  </p>
                  <div className="text-[10px] text-[#111111]/50 pt-1 border-t border-[#111111]/06">
                    Assigned supervisor: {req.supervisorName}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('evidence')}
              className="w-full py-2 text-xs font-bold rounded-xl virt-btn-secondary text-center block mt-2"
            >
              Open Evidence Wallet
            </button>
          </div>

          {/* Outcome Milestones Card */}
          <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-3">
            <h3 className="font-extrabold text-sm text-[#111111]">
              Outcome Milestones
            </h3>
            <p className="text-xs text-[#111111]/60">
              Long-term progression checkpoints (30/60/90 days).
            </p>

            <div className="space-y-2">
              {database.outcomeFollowups.map((of) => (
                <div
                  key={of.id}
                  onClick={() => {
                    if (of.status !== 'completed') {
                      dataStore.submitOutcomeFollowup(of.milestone, {
                        skillApplicationScore: 88,
                        confidenceScore: 90,
                        responsibilityExpanded: true,
                        roleChanged: false,
                        promotionGranted: false,
                        wageProgressionPercentage: 12,
                        employmentStatus: 'employed_full_time',
                        reflectionNotes: 'Verified hands-on competency progression and milestone sign-off.',
                      });
                    }
                    handleTriggerCelebration(
                      `${of.milestone.replace('_', '-').toUpperCase()} Review Completed!`,
                      'Progression review successfully signed off with verified career advancement.'
                    );
                  }}
                  title="Click to complete or celebrate this outcome milestone"
                  className="p-2.5 rounded-xl bg-[#F5EEE4] hover:bg-[#E8DDCC] border border-[#111111]/10 flex items-center justify-between text-xs cursor-pointer transition-all hover:scale-[1.01] active:scale-98 select-none"
                >
                  <div>
                    <span className="font-bold text-[#111111] block flex items-center gap-1.5">
                      {of.milestone.replace('_', '-').toUpperCase()} Review
                      {of.status === 'completed' && <Sparkles className="w-3 h-3 text-[#111111]/60" />}
                    </span>
                    <span className="text-[10px] text-[#111111]/60">
                      Due: {of.dueDate}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-all ${
                      of.status === 'completed'
                        ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                        : 'bg-[#DED0BD] hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] text-[#111111] hover:text-white border border-[#111111]/30'
                    }`}
                  >
                    {of.status === 'completed' ? 'COMPLETED (🎉)' : 'COMPLETE NOW'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('outcomes')}
              className="w-full py-2 text-xs font-bold rounded-xl virt-btn-secondary text-center block"
            >
              View Outcomes & Wages
            </button>
          </div>
        </div>
      </div>

      {/* Internal Mentor Suggestions based on Identified Skill Gaps & Organizational Expertise */}
      <MentorSuggestion
        database={database}
        onNavigate={onNavigate}
        onTriggerCelebration={handleTriggerCelebration}
      />
    </div>
  );
};
