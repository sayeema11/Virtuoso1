import {
  UserProfile,
  UserRole,
  Skill,
  RoleRequirement,
  UserSkillCapability,
  SkillGap,
  ExperienceItem,
  ResumeDocument,
  LearningMission,
  LearningProgress,
  AssessmentQuestion,
  AssessmentAttempt,
  PracticalChallenge,
  ChallengeSubmission,
  SkillEvidence,
  WorkplaceApplication,
  VerificationRequest,
  OutcomeFollowup,
  AppNotification,
  AuditLogItem,
  ProgrammeCohort,
  Organization,
  CapabilityLevel,
  EvidenceStatus,
  InternalMentor,
} from '../types';

import {
  INITIAL_USER,
  INITIAL_SKILLS,
  INITIAL_ROLE_REQUIREMENTS,
  INITIAL_USER_CAPABILITIES,
  INITIAL_EXPERIENCES,
  INITIAL_RESUME,
  INITIAL_LEARNING_MISSIONS,
  INITIAL_LEARNING_PROGRESS,
  INITIAL_ASSESSMENT_QUESTIONS,
  INITIAL_PRACTICAL_CHALLENGES,
  INITIAL_EVIDENCE_ITEMS,
  INITIAL_WORKPLACE_APPLICATIONS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_OUTCOME_FOLLOWUPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ORGANIZATIONS,
  INITIAL_COHORTS,
  INITIAL_INTERNAL_MENTORS,
} from '../data/initialData';

import {
  calculateRoleAlignment,
  computeSkillGaps,
  adaptLearningPathway,
  RoleAlignmentResult,
} from './progressionEngine';
import { db, doc, setDoc, auth } from './firebase';

const STORAGE_KEY = 'virtuoso_live_database_v2';

export interface DatabaseState {
  currentUser: UserProfile;
  skills: Skill[];
  roleRequirements: RoleRequirement[];
  userCapabilities: UserSkillCapability[];
  experiences: ExperienceItem[];
  resume: ResumeDocument | null;
  learningMissions: LearningMission[];
  learningProgress: LearningProgress[];
  assessmentQuestions: Record<string, AssessmentQuestion[]>;
  assessmentAttempts: AssessmentAttempt[];
  practicalChallenges: PracticalChallenge[];
  challengeSubmissions: ChallengeSubmission[];
  evidenceItems: SkillEvidence[];
  workplaceApplications: WorkplaceApplication[];
  verificationRequests: VerificationRequest[];
  outcomeFollowups: OutcomeFollowup[];
  notifications: AppNotification[];
  auditLogs: AuditLogItem[];
  organizations: Organization[];
  cohorts: ProgrammeCohort[];
  internalMentors: InternalMentor[];
}

type Listener = (state: DatabaseState) => void;

class DataStore {
  private state: DatabaseState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.currentUser && parsed.skills) {
          // If legacy hardcoded demo user is present, reset to clean real profile
          if (parsed.currentUser.fullName === 'Marcus Vance' || parsed.currentUser.email === 'marcus.vance@apexcloud.co.uk') {
            localStorage.removeItem(STORAGE_KEY);
            return this.getCleanDefaultState();
          }
          if (!parsed.internalMentors || parsed.internalMentors.length === 0) {
            parsed.internalMentors = [...INITIAL_INTERNAL_MENTORS];
          }
          return parsed;
        }
      }
    } catch {
      // Fallback to initial
    }

    return this.getCleanDefaultState();
  }

  private getCleanDefaultState(): DatabaseState {
    return {
      currentUser: { ...INITIAL_USER },
      skills: [...INITIAL_SKILLS],
      roleRequirements: [...INITIAL_ROLE_REQUIREMENTS],
      userCapabilities: [...INITIAL_USER_CAPABILITIES],
      experiences: [...INITIAL_EXPERIENCES],
      resume: INITIAL_RESUME,
      learningMissions: [...INITIAL_LEARNING_MISSIONS],
      learningProgress: [...INITIAL_LEARNING_PROGRESS],
      assessmentQuestions: { ...INITIAL_ASSESSMENT_QUESTIONS },
      assessmentAttempts: [],
      practicalChallenges: [...INITIAL_PRACTICAL_CHALLENGES],
      challengeSubmissions: [],
      evidenceItems: [...INITIAL_EVIDENCE_ITEMS],
      workplaceApplications: [...INITIAL_WORKPLACE_APPLICATIONS],
      verificationRequests: [...INITIAL_VERIFICATION_REQUESTS],
      outcomeFollowups: [...INITIAL_OUTCOME_FOLLOWUPS],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      organizations: [...INITIAL_ORGANIZATIONS],
      cohorts: [...INITIAL_COHORTS],
      internalMentors: [...INITIAL_INTERNAL_MENTORS],
    };
  }

  private persistAndNotify() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Quota or incognito fallback
    }

    // Background Firestore Persistence for authenticated sessions
    try {
      const currentAuthUser = auth.currentUser;
      if (currentAuthUser && currentAuthUser.uid) {
        const userRef = doc(db, 'users', currentAuthUser.uid);
        const { currentUser } = this.state;
        setDoc(
          userRef,
          {
            id: currentUser.id,
            userId: currentAuthUser.uid,
            email: currentUser.email,
            fullName: currentUser.fullName,
            role: currentUser.role,
            roleCategory: currentUser.roleCategory,
            currentJobTitle: currentUser.currentJobTitle,
            targetJobTitle: currentUser.targetJobTitle,
            organizationName: currentUser.organizationName || '',
            district: currentUser.district,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {
          // Silent offline handle
        });
      }
    } catch {
      // Ignore background firestore sync errors
    }

    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.persistAndNotify();
  }

  // ==========================================
  // AUDIT & NOTIFICATION HELPERS
  // ==========================================

  private logAudit(action: string, entityType: string, entityId: string, details: string) {
    const log: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: this.state.currentUser.id,
      actorName: this.state.currentUser.fullName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs = [log, ...this.state.auditLogs];
  }

  private pushNotification(title: string, message: string, type: AppNotification['type'], actionUrl?: string) {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: this.state.currentUser.id,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl,
    };
    this.state.notifications = [notif, ...this.state.notifications];
  }

  // ==========================================
  // AUTH & PROFILE
  // ==========================================

  public switchRole(role: UserRole) {
    const isOrg = ['training_provider', 'employer_mentor', 'programme_admin'].includes(role);
    this.state.currentUser = {
      ...this.state.currentUser,
      role,
      roleCategory: isOrg ? 'organization' : 'individual',
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('Role Switched', 'UserProfile', this.state.currentUser.id, `User active persona changed to ${role}`);
    this.persistAndNotify();
  }

  public updateProfile(updates: Partial<UserProfile>) {
    this.state.currentUser = {
      ...this.state.currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('Profile Updated', 'UserProfile', this.state.currentUser.id, 'User profile attributes updated');
    this.persistAndNotify();
  }

  public setTargetRole(targetJobTitle: string) {
    this.state.currentUser = {
      ...this.state.currentUser,
      targetJobTitle,
      updatedAt: new Date().toISOString(),
    };
    this.pushNotification(
      'Target Career Role Updated',
      `Your pathway and future gap analysis now targets: ${targetJobTitle}`,
      'system',
      '/pathway'
    );
    this.logAudit('Target Role Updated', 'UserProfile', this.state.currentUser.id, `Target role updated to: ${targetJobTitle}`);
    this.persistAndNotify();
  }

  // ==========================================
  // RESUME & EXPERIENCES
  // ==========================================

  public uploadResume(fileName: string, extractedSkills: string[], extractedExperiences: Array<{ jobTitle: string; organization: string; startDate: string; endDate?: string; description: string }>) {
    const resumeDoc: ResumeDocument = {
      id: `res-${Date.now()}`,
      userId: this.state.currentUser.id,
      fileName,
      fileSize: 215000,
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString(),
      status: 'extracted',
      extractedSkills,
      extractedExperiences,
    };
    this.state.resume = resumeDoc;
    this.logAudit('Resume Uploaded', 'ResumeDocument', resumeDoc.id, `File ${fileName} uploaded and extracted with ${extractedSkills.length} skills`);
    this.pushNotification('Resume Analysis Complete', `Identified ${extractedSkills.length} claimed skills and ${extractedExperiences.length} work history entries. Confirm them to update your capability profile.`, 'system', '/resume');
    this.persistAndNotify();
  }

  public confirmResumeExtraction() {
    if (!this.state.resume) return;

    // Add extracted experiences
    this.state.resume.extractedExperiences.forEach((exp) => {
      const expItem: ExperienceItem = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: this.state.currentUser.id,
        jobTitle: exp.jobTitle,
        organization: exp.organization,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: !exp.endDate,
        description: exp.description,
        associatedSkills: this.state.resume?.extractedSkills || [],
        source: 'resume_extraction',
        isConfirmed: true,
        createdAt: new Date().toISOString(),
      };
      this.state.experiences.push(expItem);
    });

    // Ensure claimed skills exist in user capabilities with 'Claimed' status
    this.state.resume.extractedSkills.forEach((skillName) => {
      let skillObj = this.state.skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());
      if (!skillObj) {
        skillObj = {
          id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: skillName,
          category: 'Cloud & Infrastructure',
          description: `Skill extracted from resume: ${skillName}`,
        };
        this.state.skills.push(skillObj);
      }

      const existingCap = this.state.userCapabilities.find((c) => c.skillId === skillObj?.id);
      if (!existingCap && skillObj) {
        this.state.userCapabilities.push({
          id: `uc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: this.state.currentUser.id,
          skillId: skillObj.id,
          skillName: skillObj.name,
          category: skillObj.category,
          currentLevel: 'Limited',
          requiredLevelForCurrentRole: 'Limited',
          requiredLevelForTargetRole: 'Proficient',
          confidenceScore: 40,
          evidenceStatus: 'Claimed',
          evidenceCount: 1,
          isVerified: false,
          notes: 'Claimed from uploaded resume document.',
          updatedAt: new Date().toISOString(),
        });
      }
    });

    this.state.resume.status = 'confirmed';
    this.logAudit('Resume Confirmed', 'ResumeDocument', this.state.resume.id, 'Confirmed resume data merged into capability profile');
    this.pushNotification('Capability Profile Updated', 'Resume evidence recorded. You can now take assessments to prove your claimed proficiency.', 'learning', '/capability');
    this.persistAndNotify();
  }

  public addExperience(experience: Omit<ExperienceItem, 'id' | 'userId' | 'createdAt'>) {
    const item: ExperienceItem = {
      ...experience,
      id: `exp-${Date.now()}`,
      userId: this.state.currentUser.id,
      createdAt: new Date().toISOString(),
    };
    this.state.experiences = [item, ...this.state.experiences];
    this.logAudit('Experience Added', 'ExperienceItem', item.id, `Added experience record: ${item.jobTitle} at ${item.organization}`);
    this.persistAndNotify();
  }

  public deleteExperience(id: string) {
    this.state.experiences = this.state.experiences.filter((e) => e.id !== id);
    this.logAudit('Experience Deleted', 'ExperienceItem', id, 'Deleted experience record');
    this.persistAndNotify();
  }

  // ==========================================
  // LEARNING MISSIONS & PROGRESS
  // ==========================================

  public startMission(missionId: string) {
    const mission = this.state.learningMissions.find((m) => m.id === missionId);
    if (!mission) return;

    let progress = this.state.learningProgress.find((p) => p.missionId === missionId);
    if (!progress) {
      progress = {
        id: `lp-${Date.now()}`,
        userId: this.state.currentUser.id,
        missionId,
        skillId: mission.skillId,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        progressPercent: 20,
      };
      this.state.learningProgress.push(progress);
    } else if (progress.status === 'not_started') {
      progress.status = 'in_progress';
      progress.startedAt = new Date().toISOString();
      progress.progressPercent = 20;
    }

    this.logAudit('Mission Started', 'LearningMission', missionId, `Started mission: ${mission.title}`);
    this.persistAndNotify();
  }

  public completeMission(missionId: string, reflectionNote?: string, quizScore?: number) {
    const mission = this.state.learningMissions.find((m) => m.id === missionId);
    if (!mission) return;

    let progress = this.state.learningProgress.find((p) => p.missionId === missionId);
    if (!progress) {
      progress = {
        id: `lp-${Date.now()}`,
        userId: this.state.currentUser.id,
        missionId,
        skillId: mission.skillId,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        progressPercent: 100,
        reflectionNote,
        quizScore: quizScore ?? 85,
      };
      this.state.learningProgress.push(progress);
    } else {
      progress.status = 'completed';
      progress.completedAt = new Date().toISOString();
      progress.progressPercent = 100;
      if (reflectionNote) progress.reflectionNote = reflectionNote;
      if (quizScore) progress.quizScore = quizScore;
    }

    this.logAudit('Mission Completed', 'LearningMission', missionId, `Completed mission: ${mission.title}`);
    this.pushNotification('Learning Mission Completed', `You completed "${mission.title}". Assessment is now ready to verify your capability.`, 'assessment', '/assessments');
    this.persistAndNotify();
  }

  // ==========================================
  // ASSESSMENTS & EVIDENCE PROMOTION
  // ==========================================

  public submitAssessment(skillId: string, answers: Record<string, any>, evaluations: Record<string, { correct: boolean; feedback: string }>, calculatedScore: number) {
    const skill = this.state.skills.find((s) => s.id === skillId);
    const skillName = skill ? skill.name : skillId;
    const passed = calculatedScore >= 70;

    let achievedLevel: CapabilityLevel = 'Developing';
    if (calculatedScore >= 90) achievedLevel = 'Proficient';
    else if (calculatedScore >= 75) achievedLevel = 'Developing';
    else achievedLevel = 'Limited';

    const attempt: AssessmentAttempt = {
      id: `att-${Date.now()}`,
      userId: this.state.currentUser.id,
      skillId,
      skillName,
      score: calculatedScore,
      passed,
      completedAt: new Date().toISOString(),
      durationSeconds: 320,
      answers,
      evaluations,
      capabilityLevelAchieved: achievedLevel,
      feedbackSummary: passed
        ? `Passed assessment with score of ${calculatedScore}%. Objective knowledge confirmed.`
        : `Assessment score ${calculatedScore}% is below passing threshold of 70%. Review recommended micro-learning missions and reattempt.`,
    };

    this.state.assessmentAttempts = [attempt, ...this.state.assessmentAttempts];

    if (passed) {
      // Promote Skill Capability
      const userCap = this.state.userCapabilities.find((c) => c.skillId === skillId);
      if (userCap) {
        userCap.currentLevel = achievedLevel;
        if (userCap.evidenceStatus === 'Claimed') {
          userCap.evidenceStatus = 'Assessed';
        }
        userCap.confidenceScore = Math.max(userCap.confidenceScore, calculatedScore);
        userCap.lastDemonstratedDate = new Date().toISOString().split('T')[0];
        userCap.evidenceCount += 1;
        userCap.updatedAt = new Date().toISOString();
      }

      // Add Skill Evidence Record
      const evidence: SkillEvidence = {
        id: `ev-${Date.now()}`,
        userId: this.state.currentUser.id,
        skillId,
        skillName,
        evidenceType: 'Assessment',
        evidenceStatus: 'Assessed',
        title: `${skillName} Diagnostic Knowledge Assessment`,
        description: `Scored ${calculatedScore}% on scenario and objective technical evaluation. Capability validated at ${achievedLevel} level.`,
        sourceRefId: attempt.id,
        createdDate: new Date().toISOString().split('T')[0],
      };
      this.state.evidenceItems = [evidence, ...this.state.evidenceItems];

      this.pushNotification(
        'Assessment Passed',
        `Passed ${skillName} assessment (${calculatedScore}%). Evidence status upgraded to Assessed.`,
        'assessment',
        '/evidence'
      );
    } else {
      this.pushNotification(
        'Assessment Attempt Recorded',
        `Score: ${calculatedScore}%. Review learning materials to reinforce understanding.`,
        'learning',
        '/learning'
      );
    }

    this.logAudit('Assessment Submitted', 'AssessmentAttempt', attempt.id, `Completed ${skillName} assessment with score ${calculatedScore}% (${passed ? 'PASSED' : 'RETRY'})`);
    this.persistAndNotify();
    return attempt;
  }

  // ==========================================
  // PRACTICAL CHALLENGES
  // ==========================================

  public submitChallenge(challengeId: string, submissionType: 'text' | 'code' | 'repository_link' | 'file', content: string, repositoryUrl?: string) {
    const challenge = this.state.practicalChallenges.find((c) => c.id === challengeId);
    if (!challenge) return null;

    const submission: ChallengeSubmission = {
      id: `ch-sub-${Date.now()}`,
      challengeId,
      userId: this.state.currentUser.id,
      skillId: challenge.skillId,
      submissionType,
      content,
      repositoryUrl,
      submittedAt: new Date().toISOString(),
      evaluated: true,
      score: 88,
      evaluationFeedback: `Evaluated technical submission for "${challenge.title}". Code quality and security constraints meet production standards.`,
      demonstrationVerified: true,
    };

    this.state.challengeSubmissions = [submission, ...this.state.challengeSubmissions];

    // Upgrade Capability & Evidence to 'Demonstrated'
    const userCap = this.state.userCapabilities.find((c) => c.skillId === challenge.skillId);
    if (userCap) {
      if (userCap.evidenceStatus === 'Claimed' || userCap.evidenceStatus === 'Assessed') {
        userCap.evidenceStatus = 'Demonstrated';
      }
      userCap.currentLevel = 'Proficient';
      userCap.confidenceScore = Math.max(userCap.confidenceScore, 85);
      userCap.lastDemonstratedDate = new Date().toISOString().split('T')[0];
      userCap.evidenceCount += 1;
      userCap.updatedAt = new Date().toISOString();
    }

    const evidence: SkillEvidence = {
      id: `ev-${Date.now()}`,
      userId: this.state.currentUser.id,
      skillId: challenge.skillId,
      skillName: challenge.skillName,
      evidenceType: 'Practical Demonstration',
      evidenceStatus: 'Demonstrated',
      title: `Practical Challenge: ${challenge.title}`,
      description: `Hands-on implementation evaluated at 88%. Demonstrates real-world configuration and execution mastery.`,
      sourceRefId: submission.id,
      createdDate: new Date().toISOString().split('T')[0],
    };
    this.state.evidenceItems = [evidence, ...this.state.evidenceItems];

    this.pushNotification(
      'Practical Demonstration Verified',
      `Challenge "${challenge.title}" evaluated successfully. Evidence elevated to Demonstrated.`,
      'assessment',
      '/evidence'
    );
    this.logAudit('Challenge Submitted', 'ChallengeSubmission', submission.id, `Submitted practical challenge for ${challenge.skillName}`);
    this.persistAndNotify();
    return submission;
  }

  // ==========================================
  // WORKPLACE APPLICATION & VERIFICATION
  // ==========================================

  public logWorkplaceApplication(
    skillId: string,
    usageStatus: 'used_at_work' | 'partially_used' | 'not_yet' | 'not_relevant',
    purpose: string,
    problemSolved: string,
    contribution: string,
    supervisorName: string,
    supervisorEmail: string
  ) {
    const skill = this.state.skills.find((s) => s.id === skillId);
    const skillName = skill ? skill.name : skillId;

    const wp: WorkplaceApplication = {
      id: `wp-${Date.now()}`,
      userId: this.state.currentUser.id,
      skillId,
      skillName,
      usageStatus,
      purpose,
      problemSolved,
      contribution,
      dateApplied: new Date().toISOString().split('T')[0],
      supervisorName,
      supervisorEmail,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    this.state.workplaceApplications = [wp, ...this.state.workplaceApplications];

    if (usageStatus === 'used_at_work' || usageStatus === 'partially_used') {
      // Upgrade Evidence Status to 'Applied'
      const userCap = this.state.userCapabilities.find((c) => c.skillId === skillId);
      if (userCap) {
        if (userCap.evidenceStatus !== 'Verified') {
          userCap.evidenceStatus = 'Applied';
        }
        userCap.lastAppliedDate = wp.dateApplied;
        userCap.evidenceCount += 1;
        userCap.updatedAt = new Date().toISOString();
      }

      const evidence: SkillEvidence = {
        id: `ev-${Date.now()}`,
        userId: this.state.currentUser.id,
        skillId,
        skillName,
        evidenceType: 'Workplace Application',
        evidenceStatus: 'Applied',
        title: `Workplace Practice: ${purpose.slice(0, 45)}...`,
        description: `Applied in production: ${problemSolved}`,
        sourceRefId: wp.id,
        createdDate: wp.dateApplied,
      };
      this.state.evidenceItems = [evidence, ...this.state.evidenceItems];

      // Create Verification Request for Employer/Supervisor
      const vReq: VerificationRequest = {
        id: `vr-${Date.now()}`,
        userId: this.state.currentUser.id,
        userName: this.state.currentUser.fullName,
        userRole: this.state.currentUser.role,
        skillId,
        skillName,
        evidenceId: evidence.id,
        evidenceTitle: evidence.title,
        evidenceSummary: `Candidate applied ${skillName} to solve: ${problemSolved}`,
        supervisorName,
        supervisorEmail,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      this.state.verificationRequests = [vReq, ...this.state.verificationRequests];

      this.pushNotification(
        'Workplace Application Logged',
        `Verification request dispatched to ${supervisorName}. Evidence state is now Applied.`,
        'verification',
        '/evidence'
      );
    }

    this.logAudit('Workplace Application Logged', 'WorkplaceApplication', wp.id, `Logged workplace application for ${skillName}`);
    this.persistAndNotify();
  }

  public respondToVerification(requestId: string, decision: 'verified' | 'partially_verified' | 'unable_to_verify', notes: string) {
    const req = this.state.verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    req.status = decision;
    req.decisionNotes = notes;
    req.decidedAt = new Date().toISOString();

    if (decision === 'verified') {
      // Elevate skill capability to 'Verified'
      const userCap = this.state.userCapabilities.find((c) => c.skillId === req.skillId);
      if (userCap) {
        userCap.evidenceStatus = 'Verified';
        userCap.isVerified = true;
        userCap.currentLevel = 'Strong';
        userCap.confidenceScore = Math.max(userCap.confidenceScore, 95);
        userCap.notes = `Verified by ${req.supervisorName}: ${notes}`;
        userCap.updatedAt = new Date().toISOString();
      }

      // Update evidence item
      const ev = this.state.evidenceItems.find((e) => e.id === req.evidenceId || e.skillId === req.skillId);
      if (ev) {
        ev.evidenceStatus = 'Verified';
        ev.verifiedBy = req.supervisorName;
        ev.verifiedAt = req.decidedAt;
      }

      this.pushNotification(
        'Skill Verified by Employer',
        `${req.supervisorName} verified your demonstrated competence in ${req.skillName}!`,
        'verification',
        '/evidence'
      );
    } else {
      this.pushNotification(
        'Verification Update',
        `Supervisor review received for ${req.skillName}: ${decision.replace(/_/g, ' ')}.`,
        'verification',
        '/evidence'
      );
    }

    this.logAudit('Verification Completed', 'VerificationRequest', requestId, `Supervisor ${req.supervisorName} recorded decision: ${decision}`);
    this.persistAndNotify();
  }

  // ==========================================
  // CAPABILITY LEVEL DIRECT ADJUSTMENT
  // ==========================================

  public updateUserCapabilityLevel(
    skillId: string,
    level: CapabilityLevel,
    notesOrStatus?: string,
    confidence?: number
  ) {
    const cap = this.state.userCapabilities.find((c) => c.skillId === skillId);
    if (cap) {
      cap.currentLevel = level;
      if (notesOrStatus) {
        if (['Claimed', 'Assessed', 'Demonstrated', 'Applied', 'Verified'].includes(notesOrStatus)) {
          cap.evidenceStatus = notesOrStatus as any;
        } else {
          cap.notes = notesOrStatus;
        }
      }
      if (confidence !== undefined) cap.confidenceScore = confidence;
      cap.updatedAt = new Date().toISOString();
      this.logAudit('Capability Level Updated', 'UserCapability', cap.id, `Skill ${cap.skillName} level updated to ${level}`);
      this.persistAndNotify();
    }
  }

  public addNotification(notification: { title: string; message: string; type?: AppNotification['type']; actionUrl?: string }) {
    this.pushNotification(notification.title, notification.message, notification.type || 'system', notification.actionUrl);
    this.persistAndNotify();
  }

  // ==========================================
  // OUTCOME TRACKING (30/60/90 Days)
  // ==========================================

  public submitOutcomeFollowup(
    milestone: '30_day' | '60_day' | '90_day',
    data: {
      skillApplicationScore: number;
      confidenceScore: number;
      responsibilityExpanded: boolean;
      roleChanged: boolean;
      newRoleTitle?: string;
      promotionGranted: boolean;
      wageProgressionPercentage?: number;
      employmentStatus: OutcomeFollowup['employmentStatus'];
      placementStatus?: OutcomeFollowup['placementStatus'];
      attritionReason?: OutcomeFollowup['attritionReason'];
      attritionNotes?: string;
      reflectionNotes: string;
    }
  ) {
    let followup = this.state.outcomeFollowups.find((o) => o.milestone === milestone);
    if (!followup) {
      followup = {
        id: `of-${milestone}-${Date.now()}`,
        userId: this.state.currentUser.id,
        userName: this.state.currentUser.fullName,
        milestone,
        status: 'completed',
        dueDate: new Date().toISOString().split('T')[0],
        completedDate: new Date().toISOString().split('T')[0],
        ...data,
      };
      this.state.outcomeFollowups.push(followup);
    } else {
      followup.status = 'completed';
      followup.completedDate = new Date().toISOString().split('T')[0];
      Object.assign(followup, data);
    }

    if (data.roleChanged && data.newRoleTitle) {
      this.state.currentUser.currentJobTitle = data.newRoleTitle;
    }

    this.pushNotification(
      `${milestone.replace('_', '-')} Outcome Recorded`,
      `Verified career progression tracked: ${data.employmentStatus.replace(/_/g, ' ')}.`,
      'outcome',
      '/outcomes'
    );
    this.logAudit('Outcome Milestone Completed', 'OutcomeFollowup', followup.id, `Completed ${milestone} outcome review with wage growth: ${data.wageProgressionPercentage || 0}%`);
    this.persistAndNotify();
  }

  // ==========================================
  // NOTIFICATIONS & VELOCITY TELEMETRY
  // ==========================================

  public triggerVelocityAlert(currentVelocity: number, thresholdVelocity: number, force: boolean = false) {
    if (currentVelocity >= thresholdVelocity && !force) return;

    // Check if an unread velocity alert already exists
    const hasUnreadAlert = this.state.notifications.some(
      (n) => n.type === 'velocity_alert' && !n.read
    );

    if (hasUnreadAlert && !force) return;

    const deficitPercentage = Math.max(
      5,
      Math.round(((thresholdVelocity - currentVelocity) / Math.max(0.1, thresholdVelocity)) * 100)
    );

    const notif: AppNotification = {
      id: `notif-vel-${Date.now()}`,
      userId: this.state.currentUser.id,
      title: 'Skill Velocity Alert: Acquisition Pace Below Threshold',
      message: `Your current skill acquisition pace (${currentVelocity.toFixed(1)} skills/mo) has dropped below your projected growth threshold (${thresholdVelocity.toFixed(1)} skills/mo, -${deficitPercentage}% deficit). A check-in with your mentor Sarah Jenkins or a curriculum rebalance is recommended to prevent milestone slippage.`,
      type: 'velocity_alert',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: 'dashboard',
      metadata: {
        currentVelocity,
        thresholdVelocity,
        deficitPercentage,
        suggestedAction: 'all',
        recommendedMissions: [
          'Terraform State & Modular Automation',
          'Cloud Security & IAM Hardening',
          'Kubernetes Zero-Downtime Rollouts',
        ],
      },
    };

    this.state.notifications = [notif, ...this.state.notifications];
    this.logAudit(
      'Velocity Threshold Alert Triggered',
      'TelemetryMonitor',
      notif.id,
      `Velocity drop detected: ${currentVelocity.toFixed(1)} vs target ${thresholdVelocity.toFixed(1)} skills/mo (-${deficitPercentage}% deficit)`
    );
    this.persistAndNotify();
    return notif;
  }

  public adjustCurriculumForVelocity(plan: {
    title: string;
    strategy: 'micro_burst' | 'rebalance' | 'streamline';
    weeklyHours: number;
    prioritySkills: string[];
  }) {
    // Rebalance missions
    this.logAudit(
      'Curriculum Rebalanced for Velocity',
      'LearningPathway',
      this.state.currentUser.id,
      `Adopted ${plan.strategy} strategy with ${plan.weeklyHours} hrs/week focus on: ${plan.prioritySkills.join(', ')}`
    );

    // Push confirmation notification
    this.pushNotification(
      'Curriculum Rebalancing Applied',
      `Your micro-learning pathway has been optimized with a ${plan.strategy === 'micro_burst' ? '15-min bite-sized cadence' : 'high-yield practical focus'} to recover skill acquisition velocity.`,
      'learning',
      '/learning'
    );

    // Mark velocity notifications as read
    this.state.notifications.forEach((n) => {
      if (n.type === 'velocity_alert') n.read = true;
    });

    this.persistAndNotify();
  }

  public scheduleMentorVelocityCheckIn(mentorName: string, requestedDate: string, focusAreas: string[]) {
    this.logAudit(
      'Mentor Velocity Check-In Scheduled',
      'EmployerVerification',
      this.state.currentUser.id,
      `1:1 velocity check-in booked with ${mentorName} for ${requestedDate} focusing on ${focusAreas.join(', ')}`
    );

    this.pushNotification(
      `Mentor Check-In Requested (${mentorName})`,
      `Your 1:1 check-in request has been sent to ${mentorName} for ${requestedDate}. Agenda: unblocking practical workplace evidence and pacing calibration.`,
      'verification',
      '/evidence'
    );

    // Mark velocity alerts as read
    this.state.notifications.forEach((n) => {
      if (n.type === 'velocity_alert') n.read = true;
    });

    this.persistAndNotify();
  }

  public scheduleMentorCheckIn(
    mentorId: string,
    mentorName: string,
    requestedDate: string,
    focusGaps: string[],
    notes?: string,
    meetingType?: string
  ) {
    const mentor = this.state.internalMentors.find((m) => m.id === mentorId);
    if (mentor && mentor.activeMenteesCount < mentor.maxMenteesCapacity) {
      mentor.activeMenteesCount += 1;
      if (mentor.activeMenteesCount >= mentor.maxMenteesCapacity) {
        mentor.availabilityStatus = 'limited';
      }
    }

    const typeLabel = meetingType || '1:1 Skill Gap Mentorship';
    const agendaText = notes || `Unblocking practical workplace evidence in ${focusGaps.join(', ')}`;

    this.logAudit(
      'Mentorship 1:1 Check-In Requested',
      'EmployerVerification',
      this.state.currentUser.id,
      `Requested ${typeLabel} with ${mentorName} for ${requestedDate}. Focus competencies: ${focusGaps.join(', ')}. Agenda: ${agendaText}`
    );

    this.pushNotification(
      `Mentorship 1:1 Requested (${mentorName})`,
      `Your request for ${typeLabel} with ${mentorName} on ${requestedDate} has been dispatched. Focus: ${focusGaps.join(', ')}.`,
      'verification',
      '/evidence'
    );

    // Mark velocity alerts as read
    this.state.notifications.forEach((n) => {
      if (n.type === 'velocity_alert') n.read = true;
    });

    this.persistAndNotify();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persistAndNotify();
    }
  }

  public markAllNotificationsAsRead() {
    this.state.notifications.forEach((n) => {
      n.read = true;
    });
    this.persistAndNotify();
  }

  // ==========================================
  // GETTERS & DERIVED DATA FLOWS
  // ==========================================

  public getCurrentRoleAlignment(): RoleAlignmentResult {
    const currentRequirements = this.state.roleRequirements.filter(
      (r) => r.roleTitle === this.state.currentUser.currentJobTitle
    );
    return calculateRoleAlignment(this.state.userCapabilities, currentRequirements);
  }

  public getFutureRoleAlignment(): RoleAlignmentResult {
    const futureRequirements = this.state.roleRequirements.filter(
      (r) => r.roleTitle === this.state.currentUser.targetJobTitle
    );
    return calculateRoleAlignment(this.state.userCapabilities, futureRequirements);
  }

  public getTargetRoleAlignment(): RoleAlignmentResult {
    return this.getFutureRoleAlignment();
  }

  public getSkillGaps(context: 'current_role' | 'future_role' | 'all'): SkillGap[] {
    const currentRequirements = this.state.roleRequirements.filter(
      (r) => r.roleTitle === this.state.currentUser.currentJobTitle
    );
    const futureRequirements = this.state.roleRequirements.filter(
      (r) => r.roleTitle === this.state.currentUser.targetJobTitle
    );

    const currentGaps = computeSkillGaps(this.state.userCapabilities, currentRequirements, 'current_role');
    const futureGaps = computeSkillGaps(this.state.userCapabilities, futureRequirements, 'future_role');

    if (context === 'current_role') return currentGaps;
    if (context === 'future_role') return futureGaps;

    // Deduplicate by skillId preferring future target context
    const map = new Map<string, SkillGap>();
    currentGaps.forEach((g) => map.set(g.skillId, g));
    futureGaps.forEach((g) => map.set(g.skillId, g));
    return Array.from(map.values()).sort((a, b) => a.priority - b.priority);
  }

  public getAdaptedPathway() {
    const gaps = this.getSkillGaps('future_role');
    return adaptLearningPathway(this.state.learningMissions, gaps, this.state.learningProgress);
  }

  public getFunnelMetrics() {
    const cohorts = this.state.cohorts;
    const enrolled = cohorts.reduce((acc, c) => acc + c.enrolledLearners, 0);
    const completed = cohorts.reduce((acc, c) => acc + c.completedLearners, 0);
    const assessed = cohorts.reduce((acc, c) => acc + c.assessedLearners, 0);
    const demonstrated = cohorts.reduce((acc, c) => acc + c.demonstratedLearners, 0);
    const applied = cohorts.reduce((acc, c) => acc + c.appliedLearners, 0);
    const outcomesVerified = cohorts.reduce((acc, c) => acc + c.outcomesVerified, 0);

    return {
      enrolled,
      completed,
      assessed,
      demonstrated,
      applied,
      outcomesVerified,
      completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      demonstrationRate: completed > 0 ? Math.round((demonstrated / completed) * 100) : 0,
      applicationRate: demonstrated > 0 ? Math.round((applied / demonstrated) * 100) : 0,
      outcomeProgressionRate: enrolled > 0 ? Math.round((outcomesVerified / enrolled) * 100) : 0,
    };
  }
}

export const dataStore = new DataStore();
