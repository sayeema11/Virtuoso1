// ==========================================
// VIRTUOSO DATA MODEL & SCHEMA TYPES
// ==========================================

export type UserRole =
  | 'employee'
  | 'job_seeker'
  | 'trainee'
  | 'apprentice'
  | 'self_employed'
  | 'training_provider'
  | 'employer_mentor'
  | 'programme_admin';

export type RoleCategory = 'individual' | 'organization';

export type CapabilityLevel =
  | 'No Evidence'
  | 'Limited'
  | 'Developing'
  | 'Proficient'
  | 'Strong'
  | 'Advanced';

export const CAPABILITY_LEVEL_SCORES: Record<CapabilityLevel, number> = {
  'No Evidence': 0,
  'Limited': 1,
  'Developing': 2,
  'Proficient': 3,
  'Strong': 4,
  'Advanced': 5,
};

export type EvidenceType =
  | 'Resume'
  | 'Self Report'
  | 'Assessment'
  | 'Practical Demonstration'
  | 'Workplace Application'
  | 'Mentor Verification'
  | 'Employer Verification';

export type EvidenceStatus =
  | 'Claimed'
  | 'Assessed'
  | 'Demonstrated'
  | 'Applied'
  | 'Verified';

export type GapSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CareerGoalType =
  | 'promotion'
  | 'new_role'
  | 'new_technology'
  | 'self_employment'
  | 'career_transition'
  | 'other';

export type AttritionReason =
  | 'skill_gap'
  | 'insufficient_experience'
  | 'lack_of_vacancies'
  | 'location'
  | 'compensation'
  | 'employer_requirements'
  | 'personal_constraints'
  | 'programme_mismatch'
  | 'training_relevance'
  | 'confidence'
  | 'other';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  roleCategory: RoleCategory;
  organizationId?: string;
  organizationName?: string;
  currentJobTitle: string;
  targetJobTitle: string;
  yearsOfExperience: number;
  location: string;
  district: string;
  bio?: string;
  industry?: string;
  skillsUsed?: string[];
  trainingReceived?: string;
  workplaceChallenges?: string;
  careerGoalType?: CareerGoalType;
  careerGoalDescription?: string;
  targetTimelineMonths?: number;
  onboardingCompleted: boolean;
  consentAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressionStatus {
  nextStepTabId: string;
  nextStepLabel?: string;
  onboardingCompleted: boolean;
  hasExperience: boolean;
  hasGoals: boolean;
  hasCapabilities: boolean;
  hasGaps: boolean;
  hasLearning: boolean;
  hasAssessment: boolean;
  hasChallenge: boolean;
  hasWorkplace: boolean;
  hasOutcome: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'employer' | 'training_provider' | 'government_body';
  sector: string;
  district: string;
  activeCohortsCount: number;
  totalApprentices: number;
  verifiedRate: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Cloud & Infrastructure' | 'Software Engineering' | 'Data & Analytics' | 'Security & Compliance' | 'Professional & Leadership';
  description: string;
  standardCode?: string;
}

export interface RoleRequirement {
  id: string;
  roleTitle: string;
  skillId: string;
  skillName: string;
  requiredLevel: CapabilityLevel;
  isCore: boolean;
  description: string;
}

export interface UserSkillCapability {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: CapabilityLevel;
  requiredLevelForCurrentRole: CapabilityLevel;
  requiredLevelForTargetRole: CapabilityLevel;
  confidenceScore: number; // 0 - 100
  evidenceStatus: EvidenceStatus;
  evidenceCount: number;
  lastDemonstratedDate?: string;
  lastAppliedDate?: string;
  isVerified: boolean;
  notes?: string;
  updatedAt: string;
}

export interface SkillGap {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: CapabilityLevel;
  requiredLevel: CapabilityLevel;
  gapDiff: number; // required - current
  severity: GapSeverity;
  priority: number; // 1 - 5 (1 being highest)
  targetContext: 'current_role' | 'future_role';
  reason: string;
  evidenceState: EvidenceStatus;
  recommendedAction: string;
  estimatedEffortHours: number;
  requiresWorkplacePractice: boolean;
}

export interface ExperienceItem {
  id: string;
  userId: string;
  jobTitle: string;
  organization: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  associatedSkills: string[];
  source: 'resume_extraction' | 'manual_entry';
  isConfirmed: boolean;
  createdAt: string;
}

export interface ResumeDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  status: 'uploaded' | 'extracted' | 'confirmed';
  extractedText?: string;
  extractedSkills: string[];
  extractedExperiences: Array<{
    jobTitle: string;
    organization: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
}

export interface LearningMission {
  id: string;
  skillId: string;
  skillName: string;
  title: string;
  durationMinutes: number;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  summary: string;
  keyConcepts: string[];
  practicalScenario: string;
  reflectionPrompt: string;
  targetCapabilityLevel: CapabilityLevel;
}

export interface LearningProgress {
  id: string;
  userId: string;
  missionId: string;
  skillId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  progressPercent: number;
  reflectionNote?: string;
  quizScore?: number;
}

export interface AssessmentQuestion {
  id: string;
  skillId: string;
  type: 'mcq' | 'multiple_select' | 'scenario' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  scenarioText?: string;
  explanation: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  score: number; // 0 - 100
  passed: boolean;
  completedAt: string;
  durationSeconds: number;
  answers: Record<string, any>;
  evaluations: Record<string, { correct: boolean; feedback: string }>;
  capabilityLevelAchieved: CapabilityLevel;
  feedbackSummary: string;
}

export interface PracticalChallenge {
  id: string;
  skillId: string;
  skillName: string;
  title: string;
  scenario: string;
  deliverables: string[];
  evaluationCriteria: string[];
  difficulty: 'Standard' | 'Demanding' | 'Expert';
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  skillId: string;
  submissionType: 'text' | 'code' | 'repository_link' | 'file';
  content: string;
  repositoryUrl?: string;
  fileName?: string;
  submittedAt: string;
  evaluated: boolean;
  score?: number;
  rubricScores?: Record<string, number>;
  evaluationFeedback?: string;
  demonstrationVerified: boolean;
}

export interface SkillEvidence {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  evidenceType: EvidenceType;
  evidenceStatus: EvidenceStatus;
  title: string;
  description: string;
  sourceRefId?: string; // id of assessment, challenge, experience, or workplace app
  verificationId?: string;
  createdDate: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface WorkplaceApplication {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  usageStatus: 'used_at_work' | 'partially_used' | 'not_yet' | 'not_relevant';
  purpose: string;
  problemSolved: string;
  contribution: string;
  dateApplied: string;
  supervisorName?: string;
  supervisorEmail?: string;
  verified: boolean;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  skillId: string;
  skillName: string;
  evidenceId: string;
  evidenceTitle: string;
  evidenceSummary: string;
  supervisorName: string;
  supervisorEmail: string;
  status: 'pending' | 'verified' | 'partially_verified' | 'unable_to_verify';
  decisionNotes?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface OutcomeFollowup {
  id: string;
  userId: string;
  userName: string;
  milestone: '30_day' | '60_day' | '90_day';
  status: 'due' | 'completed' | 'scheduled';
  dueDate: string;
  completedDate?: string;
  skillApplicationScore: number; // 1 - 5
  confidenceScore: number; // 1 - 5
  responsibilityExpanded: boolean;
  roleChanged: boolean;
  newRoleTitle?: string;
  promotionGranted: boolean;
  wageProgressionPercentage?: number;
  employmentStatus: 'employed_full_time' | 'employed_part_time' | 'promoted' | 'self_employed' | 'in_apprenticeship' | 'further_education';
  placementStatus?: 'placed' | 'retained' | 'promoted' | 'in_progress' | 'not_placed' | 'attrition';
  attritionReason?: AttritionReason;
  attritionNotes?: string;
  reflectionNotes?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assessment' | 'verification' | 'outcome' | 'learning' | 'system' | 'velocity_alert';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    currentVelocity?: number;
    thresholdVelocity?: number;
    deficitPercentage?: number;
    suggestedAction?: 'check_in' | 'curriculum_adjustment' | 'all';
    recommendedMissions?: string[];
  };
}

export interface AuditLogItem {
  id: string;
  userId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface ProgrammeCohort {
  id: string;
  name: string;
  programmeName: string;
  providerName: string;
  startDate: string;
  endDate: string;
  district: string;
  enrolledLearners: number;
  completedLearners: number;
  assessedLearners: number;
  demonstratedLearners: number;
  appliedLearners: number;
  outcomesVerified: number;
}

export interface InternalMentor {
  id: string;
  name: string;
  roleTitle: string;
  organizationId: string;
  organizationName: string;
  department: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  expertiseSkillIds: string[];
  expertiseSkillNames: string[];
  specialties: string[];
  yearsExperience: number;
  activeMenteesCount: number;
  maxMenteesCapacity: number;
  availabilityStatus: 'available' | 'limited' | 'waitlist';
  preferredCadence: string;
  apprenticesGraduated: number;
  verifiedSignOffsCount: number;
  rating: number;
  bio: string;
  recentEndorsement?: string;
}
