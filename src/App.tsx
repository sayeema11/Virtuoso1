import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, calculateProgressionStatus } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AssessmentRunnerModal } from './components/AssessmentRunnerModal';
import { PracticalChallengeModal } from './components/PracticalChallengeModal';
import { WorkplaceApplicationModal } from './components/WorkplaceApplicationModal';
import { VerificationReviewModal } from './components/VerificationReviewModal';
import { OutcomeMilestoneModal } from './components/OutcomeMilestoneModal';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { ReportExportModal } from './components/ReportExportModal';
import { CurriculumAdjustmentModal } from './components/CurriculumAdjustmentModal';
import { OnboardingModal } from './components/OnboardingModal';
import { WorkflowPipelineBar } from './components/WorkflowPipelineBar';

import { dataStore, DatabaseState } from './services/dataStore';
import { UserRole, VerificationRequest, OutcomeFollowup } from './types';

// Views
import { DashboardView } from './views/DashboardView';
import { CapabilityView } from './views/CapabilityView';
import { CurrentRoleView } from './views/CurrentRoleView';
import { SkillGapsView } from './views/SkillGapsView';
import { CareerPathwayView } from './views/CareerPathwayView';
import { LearningMissionsView } from './views/LearningMissionsView';
import { AssessmentsView } from './views/AssessmentsView';
import { PracticalChallengesView } from './views/PracticalChallengesView';
import { EvidenceWalletView } from './views/EvidenceWalletView';
import { WorkplaceView } from './views/WorkplaceView';
import { OutcomesView } from './views/OutcomesView';
import { ExperienceResumeView } from './views/ExperienceResumeView';
import { ProviderPortalView } from './views/ProviderPortalView';
import { EmployerPortalView } from './views/EmployerPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import { AuditTrailView } from './views/AuditTrailView';
import { ProfileView } from './views/ProfileView';
import { LoginPage } from './views/LoginPage';
import { useAuth } from './services/AuthContext';

export default function App() {
  const { firebaseUser, loading: authLoading, isAuthenticated } = useAuth();
  const [database, setDatabase] = useState<DatabaseState>(dataStore.getState());
  const [activeTab, setActiveTab] = useState<string>(() => {
    const isGuest = typeof window !== 'undefined' && localStorage.getItem('virtuoso_guest_session');
    if (!firebaseUser && !isGuest && !dataStore.getState().currentUser.fullName) {
      return 'login';
    }
    return 'dashboard';
  });

  // Modal States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResumeUploadOpen, setIsResumeUploadOpen] = useState(false);
  const [isReportExportOpen, setIsReportExportOpen] = useState(false);

  const [assessmentModalState, setAssessmentModalState] = useState<{
    isOpen: boolean;
    skillId: string;
    skillName: string;
  }>({ isOpen: false, skillId: '', skillName: '' });

  const [challengeModalState, setChallengeModalState] = useState<{
    isOpen: boolean;
    challengeId: string;
  }>({ isOpen: false, challengeId: '' });

  const [workplaceModalState, setWorkplaceModalState] = useState<{
    isOpen: boolean;
    skillId?: string;
  }>({ isOpen: false });

  const [verificationReviewState, setVerificationReviewState] = useState<{
    isOpen: boolean;
    request: VerificationRequest | null;
  }>({ isOpen: false, request: null });

  const [outcomeModalState, setOutcomeModalState] = useState<{
    isOpen: boolean;
    milestone: '30_day' | '60_day' | '90_day';
  }>({ isOpen: false, milestone: '90_day' });

  const [curriculumModalState, setCurriculumModalState] = useState<{
    isOpen: boolean;
    currentVelocity: number;
    thresholdVelocity: number;
  }>({ isOpen: false, currentVelocity: 1.0, thresholdVelocity: 1.5 });

  // Subscribe to live database state
  useEffect(() => {
    const unsubscribe = dataStore.subscribe((newState) => {
      setDatabase({ ...newState });
    });
    return unsubscribe;
  }, []);

  // When user signs in or auth state restores, smoothly transition from login to dashboard and trigger onboarding if needed
  useEffect(() => {
    if (!authLoading && (firebaseUser || isAuthenticated)) {
      if (activeTab === 'login') {
        setActiveTab('dashboard');
      }
      if (!database.currentUser.onboardingCompleted) {
        setIsOnboardingOpen(true);
      }
    } else if (!authLoading && !firebaseUser && !isAuthenticated) {
      if (activeTab !== 'login') {
        setActiveTab('login');
      }
    }
  }, [firebaseUser, isAuthenticated, authLoading, activeTab, database.currentUser.onboardingCompleted]);

  const { currentUser, notifications } = database;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleSwitch = (newRole: UserRole) => {
    dataStore.switchRole(newRole);
    if (newRole === 'training_provider') setActiveTab('provider-portal');
    else if (newRole === 'employer_mentor') setActiveTab('employer-portal');
    else if (newRole === 'programme_admin') setActiveTab('admin-portal');
    else setActiveTab('dashboard');
  };

  const getBreadcrumbs = () => {
    const tabLabels: Record<string, string[]> = {
      dashboard: ['Career', 'Overview'],
      capability: ['Skills', 'Capability Profile'],
      'current-role': ['Career Goal', currentUser.currentJobTitle || 'Role Alignment'],
      'skill-gaps': ['Diagnostics', 'Skill Gap Analysis'],
      pathway: ['Progression', 'Career Pathway'],
      learning: ['Skill Growth', 'Micro-Learning Missions'],
      assessments: ['Validation', 'Diagnostic Assessments'],
      challenges: ['Validation', 'Practical Challenges'],
      evidence: ['Portfolio', 'Skill Evidence Wallet'],
      workplace: ['Application', 'Workplace Practice'],
      outcomes: ['Impact', 'Career Outcomes & Wages'],
      experience: ['Career History', 'Resume & Experience'],
      'provider-portal': ['Organization', 'Training Provider Command'],
      cohorts: ['Organization', 'Cohorts & Training'],
      'employer-portal': ['Organization', 'Employer Verification Hub'],
      'verifications-inbox': ['Organization', 'Pending Verifications'],
      'admin-portal': ['Governance', 'Programme Administration'],
      funnel: ['Governance', 'Training → Outcome Funnel'],
      districts: ['Governance', 'District Analytics'],
      reports: ['Governance', 'Data Reports'],
      'audit-trail': ['Security', 'Audit Trail'],
      profile: ['Account', 'Profile & Settings'],
      login: ['Authentication', 'Sign In / Register'],
    };
    return tabLabels[activeTab] || ['Platform', activeTab];
  };

  // Launch assessment helper
  const handleOpenAssessment = (skillId: string, skillName: string) => {
    setAssessmentModalState({ isOpen: true, skillId, skillName });
  };

  // Launch challenge helper
  const handleOpenChallenge = (challengeId: string) => {
    setChallengeModalState({ isOpen: true, challengeId });
  };

  // Selected challenge object
  const activeChallenge = database.practicalChallenges.find(
    (c) => c.id === challengeModalState.challengeId
  );

  // Active assessment questions
  const activeQuestions = database.assessmentQuestions[assessmentModalState.skillId] || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#E8DDCC] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="p-5 rounded-3xl virt-surface shadow-xl border border-[#111111]/15 space-y-3 max-w-xs w-full">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-md">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="font-black text-sm uppercase text-[#111111] font-['Cabinet_Grotesk'] tracking-tight">
            VIRTUOSO
          </h3>
          <p className="text-[11px] text-[#111111]/70 font-medium">
            Restoring secure session via Firebase...
          </p>
        </div>
      </div>
    );
  }

  // When not authenticated or on login page, display ONLY the clean LoginPage without any dashboard options or sidebar navigation
  if (!isAuthenticated || activeTab === 'login') {
    return (
      <div className="min-h-screen bg-[#E8DDCC] text-[#111111] flex items-center justify-center p-4 sm:p-6 lg:p-12 antialiased select-none">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8DDCC] text-[#111111] antialiased">
      {/* Floating Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'reports') setIsReportExportOpen(true);
          else setActiveTab(tab);
        }}
        userRole={currentUser.role}
        onRoleSwitch={handleRoleSwitch}
        unreadNotificationCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        database={database}
        progressionStatus={calculateProgressionStatus(database)}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-72 pr-4 sm:pr-6 pl-4 pt-4 pb-24 lg:pb-8 max-w-7xl mx-auto transition-all">
        {/* Top Bar with Breadcrumbs & Actions */}
        <TopBar
          breadcrumbs={getBreadcrumbs()}
          currentUser={currentUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenLogin={() => setActiveTab('login')}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          unreadCount={unreadCount}
          isAuthenticated={isAuthenticated}
        />

        {/* Official VIRTUOSO 12-Stage Solution Pipeline Bar */}
        {activeTab !== 'login' && !['provider-portal', 'employer-portal', 'admin-portal'].includes(activeTab) && (
          <WorkflowPipelineBar
            activeTab={activeTab}
            onNavigate={setActiveTab}
            database={database}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {/* Dynamic View Rendering with Fluid Page Transitions */}
        <main className="mt-2 min-h-[calc(100vh-140px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                  onOpenWorkplace={(sId) => setWorkplaceModalState({ isOpen: true, skillId: sId })}
                />
              )}

              {activeTab === 'capability' && (
                <CapabilityView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                  onOpenWorkplace={(sId) => setWorkplaceModalState({ isOpen: true, skillId: sId })}
                />
              )}

              {activeTab === 'current-role' && (
                <CurrentRoleView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                />
              )}

              {activeTab === 'skill-gaps' && (
                <SkillGapsView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                  onOpenWorkplace={(sId) => setWorkplaceModalState({ isOpen: true, skillId: sId })}
                />
              )}

              {activeTab === 'pathway' && (
                <CareerPathwayView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                  onOpenChallenge={handleOpenChallenge}
                />
              )}

              {activeTab === 'learning' && (
                <LearningMissionsView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                />
              )}

              {activeTab === 'assessments' && (
                <AssessmentsView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenAssessment={handleOpenAssessment}
                />
              )}

              {activeTab === 'challenges' && (
                <PracticalChallengesView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenChallenge={handleOpenChallenge}
                />
              )}

              {activeTab === 'evidence' && (
                <EvidenceWalletView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenWorkplace={(sId) => setWorkplaceModalState({ isOpen: true, skillId: sId })}
                />
              )}

              {activeTab === 'workplace' && (
                <WorkplaceView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenWorkplace={(sId) => setWorkplaceModalState({ isOpen: true, skillId: sId })}
                />
              )}

              {activeTab === 'outcomes' && (
                <OutcomesView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenOutcomeModal={(ms) => setOutcomeModalState({ isOpen: true, milestone: ms })}
                />
              )}

              {activeTab === 'experience' && (
                <ExperienceResumeView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenResumeUpload={() => setIsResumeUploadOpen(true)}
                />
              )}

              {(activeTab === 'provider-portal' || activeTab === 'cohorts') && (
                <ProviderPortalView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenReportModal={() => setIsReportExportOpen(true)}
                />
              )}

              {(activeTab === 'employer-portal' || activeTab === 'verifications-inbox') && (
                <EmployerPortalView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenVerificationReview={(req) => setVerificationReviewState({ isOpen: true, request: req })}
                />
              )}

              {(activeTab === 'admin-portal' || activeTab === 'funnel' || activeTab === 'districts') && (
                <AdminPortalView
                  database={database}
                  onNavigate={setActiveTab}
                  onOpenReportModal={() => setIsReportExportOpen(true)}
                />
              )}

              {activeTab === 'audit-trail' && (
                <AuditTrailView database={database} />
              )}

              {activeTab === 'profile' && (
                <ProfileView database={database} onNavigate={setActiveTab} />
              )}

              {activeTab === 'login' && (
                <LoginPage onBackToApp={() => setActiveTab('dashboard')} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Search Liquid Glass Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        database={database}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Live Notifications Liquid Glass Drawer */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => dataStore.markNotificationAsRead(id)}
        onMarkAllRead={() => dataStore.markAllNotificationsAsRead()}
        onNavigate={(url) => setActiveTab(url.replace('/', ''))}
        onOpenCurriculumAdjustment={(curVel, targetVel) => {
          setCurriculumModalState({
            isOpen: true,
            currentVelocity: curVel ?? 1.0,
            thresholdVelocity: targetVel ?? 1.5,
          });
        }}
      />

      {/* Assessment Runner Modal */}
      {assessmentModalState.isOpen && (
        <AssessmentRunnerModal
          isOpen={assessmentModalState.isOpen}
          onClose={() => setAssessmentModalState({ isOpen: false, skillId: '', skillName: '' })}
          skillId={assessmentModalState.skillId}
          skillName={assessmentModalState.skillName}
          questions={activeQuestions}
          onComplete={() => {}}
        />
      )}

      {/* Practical Challenge Modal */}
      {challengeModalState.isOpen && activeChallenge && (
        <PracticalChallengeModal
          isOpen={challengeModalState.isOpen}
          onClose={() => setChallengeModalState({ isOpen: false, challengeId: '' })}
          challenge={activeChallenge}
          onComplete={() => {}}
        />
      )}

      {/* Workplace Application Modal */}
      <WorkplaceApplicationModal
        isOpen={workplaceModalState.isOpen}
        onClose={() => setWorkplaceModalState({ isOpen: false })}
        skills={database.skills}
        preselectedSkillId={workplaceModalState.skillId}
        onComplete={() => {}}
      />

      {/* Verification Review Modal */}
      {verificationReviewState.isOpen && verificationReviewState.request && (
        <VerificationReviewModal
          isOpen={verificationReviewState.isOpen}
          onClose={() => setVerificationReviewState({ isOpen: false, request: null })}
          request={verificationReviewState.request}
          onComplete={() => {}}
        />
      )}

      {/* Outcome Milestone Modal */}
      <OutcomeMilestoneModal
        isOpen={outcomeModalState.isOpen}
        onClose={() => setOutcomeModalState({ isOpen: false, milestone: '90_day' })}
        milestone={outcomeModalState.milestone}
        existingRecord={database.outcomeFollowups.find((o) => o.milestone === outcomeModalState.milestone)}
        onComplete={() => {}}
      />

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isResumeUploadOpen}
        onClose={() => setIsResumeUploadOpen(false)}
        onComplete={() => {}}
      />

      {/* Report & Data Export Modal */}
      <ReportExportModal
        isOpen={isReportExportOpen}
        onClose={() => setIsReportExportOpen(false)}
        database={database}
      />

      {/* Stage 1 Official Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentUser={currentUser}
        onComplete={() => setActiveTab('experience')}
      />

      {/* Curriculum Adjustment & Velocity Recovery Modal */}
      <CurriculumAdjustmentModal
        isOpen={curriculumModalState.isOpen}
        onClose={() => setCurriculumModalState((prev) => ({ ...prev, isOpen: false }))}
        currentVelocity={curriculumModalState.currentVelocity}
        thresholdVelocity={curriculumModalState.thresholdVelocity}
        onSuccess={() => setActiveTab('dashboard')}
      />
    </div>
  );
}
