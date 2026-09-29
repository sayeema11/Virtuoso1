import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  FileText,
  Target,
  Sparkles,
  GitPullRequest,
  Compass,
  BookOpen,
  CheckSquare,
  Code,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { DatabaseState } from '../services/dataStore';

interface WorkflowPipelineBarProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  database: DatabaseState;
  onOpenOnboarding: () => void;
}

export const WorkflowPipelineBar: React.FC<WorkflowPipelineBarProps> = ({
  activeTab,
  onNavigate,
  database,
  onOpenOnboarding,
}) => {
  const { currentUser, experiences, userCapabilities, learningProgress, assessmentAttempts, challengeSubmissions, workplaceApplications, outcomeFollowups } = database;

  // Determine smart next action recommendation based on real progress
  let nextRecommendation = {
    title: 'Complete Your Career Profile',
    description: 'Set your baseline experience, industry, and career aspirations to personalize your learning.',
    tabId: 'profile',
    actionText: 'Update Profile',
    onClick: onOpenOnboarding,
  };

  if (!currentUser.onboardingCompleted) {
    nextRecommendation = {
      title: 'Welcome! Complete Your Profile',
      description: 'Set your learner persona, industry, and career aspirations to unlock personalized guidance.',
      tabId: 'profile',
      actionText: 'Complete Profile',
      onClick: onOpenOnboarding,
    };
  } else if (experiences.length === 0) {
    nextRecommendation = {
      title: 'Add Your Work Experience or Resume',
      description: 'Upload your CV or add past roles so VIRTUOSO can extract and analyze your capabilities.',
      tabId: 'experience',
      actionText: 'Add Experience',
      onClick: () => onNavigate('experience'),
    };
  } else if (!currentUser.targetJobTitle) {
    nextRecommendation = {
      title: 'Define Your Target Career Goal',
      description: 'Select your desired role to generate accurate role-fit and skill gap diagnostics.',
      tabId: 'current-role',
      actionText: 'Set Target Role',
      onClick: () => onNavigate('current-role'),
    };
  } else if (userCapabilities.length === 0) {
    nextRecommendation = {
      title: 'Generate Your Capability Profile',
      description: 'Run AI analysis on your confirmed work history to populate your skills matrix.',
      tabId: 'capability',
      actionText: 'View Capabilities',
      onClick: () => onNavigate('capability'),
    };
  } else if (learningProgress.filter((p) => p.status === 'completed').length === 0) {
    nextRecommendation = {
      title: 'Start Your First Micro-Learning Mission',
      description: 'Dive into bite-sized missions tailored to your top-priority skill gaps.',
      tabId: 'learning',
      actionText: 'Start Learning',
      onClick: () => onNavigate('learning'),
    };
  } else if (assessmentAttempts.length === 0) {
    nextRecommendation = {
      title: 'Take a Diagnostic Assessment',
      description: 'Validate your learned concepts and benchmark your proficiency with real scenarios.',
      tabId: 'assessments',
      actionText: 'Take Assessment',
      onClick: () => onNavigate('assessments'),
    };
  } else if (!challengeSubmissions.some((s) => s.demonstrationVerified)) {
    nextRecommendation = {
      title: 'Complete a Practical Demonstration',
      description: 'Apply your technical skills in hands-on production challenges to generate verified evidence.',
      tabId: 'challenges',
      actionText: 'Start Challenge',
      onClick: () => onNavigate('challenges'),
    };
  } else if (workplaceApplications.length === 0) {
    nextRecommendation = {
      title: 'Log On-the-Job Workplace Application',
      description: 'Record how you applied your skills in real projects for employer sign-off.',
      tabId: 'workplace',
      actionText: 'Log Workplace Practice',
      onClick: () => onNavigate('workplace'),
    };
  } else {
    nextRecommendation = {
      title: 'Track Your Career Outcomes & Wage Growth',
      description: 'Log 30/60/90-day progress, retention milestones, and responsibility expansion.',
      tabId: 'outcomes',
      actionText: 'Review Outcomes',
      onClick: () => onNavigate('outcomes'),
    };
  }

  const quickNav = [
    { label: 'Overview', tabId: 'dashboard', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'Experience', tabId: 'experience', icon: <FileText className="w-3 h-3" /> },
    { label: 'Goals', tabId: 'current-role', icon: <Target className="w-3 h-3" /> },
    { label: 'Capabilities', tabId: 'capability', icon: <Sparkles className="w-3 h-3" /> },
    { label: 'Skill Gaps', tabId: 'skill-gaps', icon: <GitPullRequest className="w-3 h-3" /> },
    { label: 'Pathway', tabId: 'pathway', icon: <Compass className="w-3 h-3" /> },
    { label: 'Learn', tabId: 'learning', icon: <BookOpen className="w-3 h-3" /> },
    { label: 'Assess', tabId: 'assessments', icon: <CheckSquare className="w-3 h-3" /> },
    { label: 'Practice', tabId: 'challenges', icon: <Code className="w-3 h-3" /> },
    { label: 'Evidence', tabId: 'evidence', icon: <ShieldCheck className="w-3 h-3" /> },
    { label: 'Workplace', tabId: 'workplace', icon: <Briefcase className="w-3 h-3" /> },
    { label: 'Outcomes', tabId: 'outcomes', icon: <TrendingUp className="w-3 h-3" /> },
  ];

  return (
    <div className="w-full bg-[#E8DDCC]/70 border border-[#111111]/12 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs space-y-3">
      {/* Smart Next Step Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 rounded-xl p-3 border border-[#111111]/08">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
                Suggested Next Focus
              </span>
              <span className="text-[10px] text-[#111111]/50">·</span>
              <h4 className="font-bold text-xs text-[#111111] truncate">{nextRecommendation.title}</h4>
            </div>
            <p className="text-[11px] text-[#111111]/70 truncate mt-0.5">
              {nextRecommendation.description}
            </p>
          </div>
        </div>

        <button
          onClick={nextRecommendation.onClick}
          className="virt-btn-primary px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs"
        >
          <span>{nextRecommendation.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clean Quick Jump Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
        {quickNav.map((item) => {
          const isCurrent = activeTab === item.tabId;
          return (
            <button
              key={item.tabId}
              onClick={() => onNavigate(item.tabId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-xs'
                  : 'bg-white/60 hover:bg-white text-[#111111]/75 hover:text-[#111111] border border-[#111111]/08'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
