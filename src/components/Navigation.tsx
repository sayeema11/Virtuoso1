import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Compass,
  Target,
  GitPullRequest,
  BookOpen,
  CheckSquare,
  Award,
  Briefcase,
  TrendingUp,
  FileText,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sliders,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { UserRole, ProgressionStatus } from '../types';
import { DatabaseState } from '../services/dataStore';
import { useAuth } from '../services/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'core' | 'progression' | 'evidence' | 'organization';
  allowedRoles?: UserRole[];
}

export interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userRole: UserRole;
  onRoleSwitch: (role: UserRole) => void;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  database?: DatabaseState;
  progressionStatus?: ProgressionStatus;
}

export function calculateProgressionStatus(database?: DatabaseState): ProgressionStatus {
  if (!database) {
    return {
      nextStepTabId: 'profile',
      onboardingCompleted: false,
      hasExperience: false,
      hasGoals: false,
      hasCapabilities: false,
      hasGaps: false,
      hasLearning: false,
      hasAssessment: false,
      hasChallenge: false,
      hasWorkplace: false,
      hasOutcome: false,
    };
  }

  const { currentUser, experiences, userCapabilities, learningProgress, assessmentAttempts, challengeSubmissions, workplaceApplications, outcomeFollowups, resume } = database;

  const onboardingCompleted = Boolean(currentUser.onboardingCompleted && currentUser.fullName);
  const hasExperience = Boolean(experiences.length > 0 || resume);
  const hasGoals = Boolean(currentUser.targetJobTitle && currentUser.currentJobTitle);
  const hasCapabilities = Boolean(userCapabilities.length > 0);
  const hasGaps = Boolean(userCapabilities.some((c) => c.requiredLevelForTargetRole));
  const hasLearning = Boolean(learningProgress.some((p) => p.status === 'completed'));
  const hasAssessment = Boolean(assessmentAttempts.length > 0);
  const hasChallenge = Boolean(challengeSubmissions.some((s) => s.demonstrationVerified));
  const hasWorkplace = Boolean(workplaceApplications.length > 0);
  const hasOutcome = Boolean(outcomeFollowups.length > 0);

  let nextStepTabId = 'dashboard';
  if (!onboardingCompleted) nextStepTabId = 'profile';
  else if (!hasExperience) nextStepTabId = 'experience';
  else if (!hasGoals) nextStepTabId = 'current-role';
  else if (!hasCapabilities) nextStepTabId = 'capability';
  else if (!hasGaps) nextStepTabId = 'skill-gaps';
  else if (!hasLearning) nextStepTabId = 'learning';
  else if (!hasAssessment) nextStepTabId = 'assessments';
  else if (!hasChallenge) nextStepTabId = 'challenges';
  else if (!hasWorkplace) nextStepTabId = 'workplace';
  else if (!hasOutcome) nextStepTabId = 'outcomes';

  return {
    nextStepTabId,
    onboardingCompleted,
    hasExperience,
    hasGoals,
    hasCapabilities,
    hasGaps,
    hasLearning,
    hasAssessment,
    hasChallenge,
    hasWorkplace,
    hasOutcome,
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userRole,
  onRoleSwitch,
  unreadNotificationCount,
  onOpenNotifications,
  database,
  progressionStatus,
}) => {
  const { signOutUser } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Derive active progression status and priority next step tab ID
  const activeProgression = React.useMemo(() => {
    if (progressionStatus) return progressionStatus;
    return calculateProgressionStatus(database);
  }, [progressionStatus, database]);

  const activePriorityTabId = activeProgression.nextStepTabId;

  const individualNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Career Overview', icon: <LayoutDashboard className="w-4 h-4" />, category: 'core' },
    { id: 'profile', label: 'Profile & Settings', icon: <GraduationCap className="w-4 h-4" />, category: 'core' },
    { id: 'experience', label: 'Experience & Resume', icon: <FileText className="w-4 h-4" />, category: 'core' },
    { id: 'current-role', label: 'Current Role & Goals', icon: <Target className="w-4 h-4" />, category: 'progression' },
    { id: 'capability', label: 'Skills & Capabilities', icon: <Award className="w-4 h-4" />, category: 'progression' },
    { id: 'skill-gaps', label: 'Skill Gap Analysis', icon: <GitPullRequest className="w-4 h-4" />, category: 'progression' },
    { id: 'pathway', label: 'Career Pathway', icon: <Compass className="w-4 h-4" />, category: 'progression' },
    { id: 'learning', label: 'Micro-Learning', icon: <BookOpen className="w-4 h-4" />, category: 'progression' },
    { id: 'assessments', label: 'Assessments', icon: <CheckSquare className="w-4 h-4" />, category: 'evidence' },
    { id: 'challenges', label: 'Practical Challenges', icon: <Sparkles className="w-4 h-4" />, category: 'evidence' },
    { id: 'evidence', label: 'Skill Evidence Wallet', icon: <ShieldCheck className="w-4 h-4" />, category: 'evidence' },
    { id: 'workplace', label: 'Workplace Application', icon: <Briefcase className="w-4 h-4" />, category: 'evidence' },
    { id: 'outcomes', label: 'Career Outcomes', icon: <TrendingUp className="w-4 h-4" />, category: 'evidence' },
    { id: 'login', label: 'Account & Security', icon: <LogIn className="w-4 h-4" />, category: 'core' },
  ];

  const orgNavItems: Record<string, NavItem[]> = {
    training_provider: [
      { id: 'provider-portal', label: 'Provider Overview', icon: <GraduationCap className="w-4 h-4" />, category: 'organization' },
      { id: 'cohorts', label: 'Cohorts & Training', icon: <BookOpen className="w-4 h-4" />, category: 'organization' },
      { id: 'capability', label: 'Learner Capabilities', icon: <Award className="w-4 h-4" />, category: 'organization' },
      { id: 'outcomes', label: 'Outcome Progression', icon: <TrendingUp className="w-4 h-4" />, category: 'organization' },
      { id: 'reports', label: 'Accreditation Reports', icon: <FileText className="w-4 h-4" />, category: 'organization' },
    ],
    employer_mentor: [
      { id: 'employer-portal', label: 'Employer Overview', icon: <Building2 className="w-4 h-4" />, category: 'organization' },
      { id: 'verifications-inbox', label: 'Pending Verifications', icon: <ShieldCheck className="w-4 h-4" />, category: 'organization' },
      { id: 'capability', label: 'Workforce Skills', icon: <Award className="w-4 h-4" />, category: 'organization' },
      { id: 'outcomes', label: '30/60/90 Retention', icon: <TrendingUp className="w-4 h-4" />, category: 'organization' },
    ],
    programme_admin: [
      { id: 'admin-portal', label: 'Programme Governance', icon: <Sliders className="w-4 h-4" />, category: 'organization' },
      { id: 'funnel', label: 'Training → Outcome Funnel', icon: <GitPullRequest className="w-4 h-4" />, category: 'organization' },
      { id: 'districts', label: 'District Impact', icon: <Target className="w-4 h-4" />, category: 'organization' },
      { id: 'reports', label: 'Live Data Exports', icon: <FileText className="w-4 h-4" />, category: 'organization' },
      { id: 'audit-trail', label: 'Security & Audit Logs', icon: <ShieldCheck className="w-4 h-4" />, category: 'organization' },
    ],
  };

  const navItems = orgNavItems[userRole] || individualNavItems;

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    apprentice: { label: 'Apprentice', badge: 'Individual' },
    trainee: { label: 'Trainee', badge: 'Individual' },
    employee: { label: 'Employee', badge: 'Individual' },
    job_seeker: { label: 'Job Seeker', badge: 'Individual' },
    self_employed: { label: 'Self-Employed', badge: 'Individual' },
    training_provider: { label: 'Training Provider', badge: 'Organization' },
    employer_mentor: { label: 'Employer / Mentor', badge: 'Organization' },
    programme_admin: { label: 'Programme Admin', badge: 'Government' },
  };

  return (
    <>
      {/* DESKTOP FLOATING LIQUID GLASS SIDEBAR */}
      <aside className="hidden lg:flex fixed top-4 left-4 bottom-4 w-64 z-40 flex-col justify-between p-3.5 rounded-2xl virt-glass select-none transition-all">
        {/* Brand & Wordmark */}
        <div className="space-y-4">
          <div className="px-2.5 pt-1 pb-2 border-b border-[#111111]/10 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#111111] uppercase font-['Cabinet_Grotesk']">
                VIRTUOSO
              </span>
              <p className="text-[11px] text-[#111111]/60 tracking-wider">
                Workforce Intelligence
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#111111] opacity-75" />
          </div>

          {/* Role Persona Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left bg-[#F1E9DD]/80 hover:bg-[#DED0BD]/90 border border-[#111111]/10 rounded-xl transition-all active:scale-[0.98]"
            >
              <div className="truncate">
                <span className="text-[10px] text-[#111111]/60 block leading-tight">ACTIVE ROLE</span>
                <span className="font-semibold text-[#111111]">{roleLabels[userRole]?.label}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#111111]/70" />
            </button>

            {/* Dropdown Menu */}
            {roleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute top-full left-0 right-0 mt-1.5 p-1.5 virt-glass-strong rounded-xl z-50 shadow-2xl border border-[#111111]/15"
              >
                <div className="text-[10px] uppercase font-semibold text-[#111111]/50 px-2 py-1">
                  Switch Persona
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {(Object.keys(roleLabels) as UserRole[]).map((rKey) => (
                    <button
                      key={rKey}
                      onClick={() => {
                        onRoleSwitch(rKey);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                        userRole === rKey
                          ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-medium shadow-xs'
                          : 'text-[#111111] hover:bg-[#DED0BD]/80'
                      }`}
                    >
                      <span>{roleLabels[rKey].label}</span>
                      <span className="text-[10px] opacity-75">{roleLabels[rKey].badge}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Links with Smooth Liquid Active Pill & Dynamic Next Stage Glow */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1.5 nav-slidebar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isNextFocus = !isActive && activePriorityTabId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-all ${
                    isActive
                      ? 'text-white font-semibold'
                      : isNextFocus
                      ? 'active-priority text-[#111111] font-semibold bg-white/80 shadow-xs border border-[#4F46E5]/35 ring-1 ring-[#4F46E5]/20'
                      : 'text-[#111111]/75 hover:text-[#111111] hover:bg-[#F1E9DD]/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.32)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.icon}
                  </span>
                  <span className="relative z-10 truncate">{item.label}</span>

                  {/* Next Stage Guide Indicator */}
                  {isNextFocus && (
                    <span className="relative z-10 ml-auto flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                      <span>Next</span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Notifications */}
        <div className="pt-2 border-t border-[#111111]/10 space-y-2">
          <button
            onClick={onOpenNotifications}
            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#F1E9DD]/60 hover:bg-[#DED0BD]/80 border border-[#111111]/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="font-medium text-[#111111]">Notifications</span>
            {unreadNotificationCount > 0 ? (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white tabular-nums">
                {unreadNotificationCount}
              </span>
            ) : (
              <span className="text-[10px] text-[#111111]/50">0 new</span>
            )}
          </button>

          <button
            onClick={() => signOutUser()}
            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-900 border border-red-500/25 font-bold transition-all active:scale-[0.98] cursor-pointer"
            title="Sign Out of Session"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-red-700" />
              <span>Sign Out</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
              Exit
            </span>
          </button>

          <div className="px-2 py-1 text-[10px] text-[#111111]/50 flex items-center justify-between">
            <span>VIRTUOSO Live Engine</span>
            <span>v2.4-STABLE</span>
          </div>
        </div>
      </aside>

      {/* MOBILE SLIDE DRAWER / FULL SLIDE BAR ACCESSIBILITY */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-[#111111]/40 backdrop-blur-xs z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 p-4 bg-[#F1E9DD] border-r border-[#111111]/15 shadow-2xl flex flex-col justify-between select-none"
            >
              <div className="space-y-4">
                <div className="pb-3 border-b border-[#111111]/10 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-lg tracking-tight text-[#111111] uppercase font-['Cabinet_Grotesk']">
                      VIRTUOSO
                    </span>
                    <p className="text-[11px] text-[#111111]/60 tracking-wider">
                      Workforce Intelligence
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-[#E8DDCC] hover:bg-[#DED0BD] text-[#111111] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Role Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left bg-[#E8DDCC]/80 border border-[#111111]/10 rounded-xl"
                  >
                    <div className="truncate">
                      <span className="text-[10px] text-[#111111]/60 block leading-tight">ACTIVE ROLE</span>
                      <span className="font-semibold text-[#111111]">{roleLabels[userRole]?.label}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#111111]/70" />
                  </button>

                  {roleMenuOpen && (
                    <div className="mt-1.5 p-1.5 bg-[#F5EEE4] rounded-xl shadow-lg border border-[#111111]/15 space-y-0.5 max-h-48 overflow-y-auto">
                      {(Object.keys(roleLabels) as UserRole[]).map((rKey) => (
                        <button
                          key={rKey}
                          onClick={() => {
                            onRoleSwitch(rKey);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                            userRole === rKey ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-medium' : 'text-[#111111]'
                          }`}
                        >
                          <span>{roleLabels[rKey].label}</span>
                          <span className="text-[10px] opacity-75">{roleLabels[rKey].badge}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* All Features Slide Bar List */}
                <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 nav-slidebar">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isNextFocus = !isActive && activePriorityTabId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-semibold shadow-md'
                            : isNextFocus
                            ? 'active-priority text-[#111111] font-semibold bg-white shadow-xs border border-[#4F46E5]/35 ring-1 ring-[#4F46E5]/20'
                            : 'text-[#111111]/80 hover:bg-[#E8DDCC]'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                        {isNextFocus && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20">
                            Next
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-[#111111]/10 space-y-2">
                <button
                  onClick={() => {
                    onOpenNotifications();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#E8DDCC] font-medium text-[#111111]"
                >
                  <span>Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    signOutUser();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-900 border border-red-500/25 font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 text-red-700" />
                    <span>Sign Out</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                    Exit
                  </span>
                </button>

                <div className="text-[10px] text-[#111111]/50 flex items-center justify-between">
                  <span>VIRTUOSO Live Engine</span>
                  <span>v2.4-STABLE</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE FLOATING LIQUID GLASS BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 p-2 rounded-2xl virt-glass-strong shadow-2xl flex items-center justify-around border border-[#111111]/15">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[#4F46E5] font-semibold hover:text-[#312E81]"
          title="Open Slide Bar for All Features"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] tracking-tight font-bold">Slide Bar</span>
        </button>

        {navItems.slice(0, 4).map((item) => {
          const isActive = activeTab === item.id;
          const isNextFocus = !isActive && activePriorityTabId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-[#111111] font-bold' : isNextFocus ? 'active-priority text-[#4F46E5] font-semibold' : 'text-[#111111]/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileNavBackground"
                  className="absolute inset-0 bg-[#DED0BD] rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative">
                {item.icon}
                {isNextFocus && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#4F46E5] animate-ping" />
                )}
                {isNextFocus && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#4F46E5]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[56px]">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
