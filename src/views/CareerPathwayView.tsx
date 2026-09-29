import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { GapSeverityBadge } from '../components/GapSeverityBadge';
import { CapabilityBadge } from '../components/CapabilityBadge';

interface CareerPathwayViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
  onOpenChallenge: (challengeId: string) => void;
}

export const CareerPathwayView: React.FC<CareerPathwayViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
  onOpenChallenge,
}) => {
  const { currentUser } = database;
  const adaptedMissions = dataStore.getAdaptedPathway();

  // Full progression chain steps
  const progressionChain = [
    { id: 'exp', label: 'Experience Intake', desc: 'Resume & History', status: database.experiences.length > 0 ? 'completed' : 'pending', tab: 'experience' },
    { id: 'cap', label: 'Capability Profile', desc: 'Skills Matrix', status: database.userCapabilities.length > 0 ? 'completed' : 'pending', tab: 'capability' },
    { id: 'gap', label: 'Skill Gap Analysis', desc: 'Differential Diagnostic', status: database.userCapabilities.length > 0 ? 'completed' : 'pending', tab: 'skill-gaps' },
    { id: 'learn', label: 'Adaptive Learning', desc: 'Micro-Learning Missions', status: database.learningProgress.some((p) => p.status === 'completed') ? 'completed' : 'active', tab: 'learning' },
    { id: 'assess', label: 'Assessment', desc: 'Scenario & Diagnostic Checks', status: database.assessmentAttempts.length > 0 ? 'completed' : 'active', tab: 'assessments' },
    { id: 'demo', label: 'Practical Demonstration', desc: 'Hands-on Labs', status: database.challengeSubmissions.some((s) => s.demonstrationVerified) ? 'completed' : 'pending', tab: 'challenges' },
    { id: 'evid', label: 'Evidence Wallet', desc: 'Verified Evidence Trail', status: database.evidenceItems.length > 0 ? 'completed' : 'pending', tab: 'evidence' },
    { id: 'app', label: 'Workplace Practice', desc: 'Production Execution', status: database.workplaceApplications.length > 0 ? 'completed' : 'pending', tab: 'workplace' },
    { id: 'out', label: 'Career Outcome', desc: 'Retention & Growth', status: database.outcomeFollowups.some((o) => o.status === 'completed') ? 'completed' : 'pending', tab: 'outcomes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            DYNAMIC PROGRESSION ROADMAP
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Career Pathway: {currentUser.targetJobTitle || 'Select Your Target Career Goal'}
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Continuously recalibrated based on your verified assessment attempts, practical challenges, and real skill gap differential.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('learning')}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Learning Modules</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS 9-STAGE PROGRESSION CHAIN (Section 48 requirement) */}
      <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#111111]">
            VIRTUOSO Closed-Loop Progression Pipeline
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50">
            From Experience to Outcomes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-2">
          {progressionChain.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';

            return (
              <button
                key={step.id}
                onClick={() => onNavigate(step.tab)}
                className={`p-3 text-left rounded-xl border text-xs transition-all relative flex flex-col justify-between h-24 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-md scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#DED0BD] text-[#111111] border-[#111111]/20 hover:bg-[#DED0BD]/90'
                    : 'bg-[#F5EEE4] text-[#111111]/70 border-[#111111]/10 hover:bg-[#DED0BD]/60'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold block ${isActive ? 'text-white/80' : 'text-[#111111]/50'}`}>
                    {step.label.split(' ')[0]}
                  </span>
                  <span className="font-extrabold text-xs block leading-tight mt-0.5">
                    {step.label.split(' ').slice(1).join(' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-current/15">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">
                    {step.status}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC PATHWAY MISSIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#111111]">
              Sequenced Adaptive Milestone Queue
            </h3>
            <p className="text-xs text-[#111111]/60">
              Ordered dynamically by gap criticality and prerequisite dependencies.
            </p>
          </div>
          <span className="text-xs text-[#111111]/70 font-semibold tabular-nums">
            {adaptedMissions.length} Missions Scheduled
          </span>
        </div>

        <div className="space-y-3">
          {adaptedMissions.map((mission, idx) => {
            const isCompleted = mission.userStatus === 'completed';
            const isInProgress = mission.userStatus === 'in_progress';

            return (
              <div
                key={mission.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isInProgress
                    ? 'bg-[#F1E9DD] border-[#111111] shadow-md'
                    : isCompleted
                    ? 'bg-[#F5EEE4] border-[#111111]/15 opacity-85'
                    : 'bg-[#F5EEE4] border-[#111111]/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">
                        {mission.title}
                      </h4>
                      <span className="text-[11px] text-[#111111]/60">
                        {mission.skillName} · ~{mission.durationMinutes} Minutes · {mission.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <GapSeverityBadge severity={mission.gapSeverity} />
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${
                        isCompleted
                          ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                          : isInProgress
                          ? 'bg-[#DED0BD] text-[#111111] border border-[#111111]'
                          : 'bg-[#E8DDCC] text-[#111111]/60'
                      }`}
                    >
                      {mission.userStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#111111]/80 leading-relaxed">
                  {mission.summary}
                </p>

                {/* Practical Scenario Preview */}
                <div className="p-3 rounded-xl bg-[#E8DDCC]/60 border border-[#111111]/10 text-xs text-[#111111] leading-snug">
                  <strong>Production Context:</strong> {mission.practicalScenario}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#111111]/08 text-xs">
                  <span className="text-[11px] text-[#111111]/60">
                    Target Capability: <strong>{mission.targetCapabilityLevel}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('learning')}
                      className="virt-btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Review Mission' : isInProgress ? 'Resume Mission' : 'Start Mission'}</span>
                    </button>
                    <button
                      onClick={() => onOpenAssessment(mission.skillId, mission.skillName)}
                      className="virt-btn-secondary px-3.5 py-1.5 text-xs font-semibold rounded-lg"
                    >
                      Verify via Assessment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
