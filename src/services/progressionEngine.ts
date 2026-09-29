import {
  CapabilityLevel,
  CAPABILITY_LEVEL_SCORES,
  RoleRequirement,
  UserSkillCapability,
  SkillGap,
  GapSeverity,
  EvidenceStatus,
  LearningMission,
  LearningProgress,
} from '../types';

export function getScoreForLevel(level: CapabilityLevel): number {
  return CAPABILITY_LEVEL_SCORES[level] ?? 0;
}

export function getLevelFromScore(score: number): CapabilityLevel {
  if (score >= 5) return 'Advanced';
  if (score >= 4) return 'Strong';
  if (score >= 3) return 'Proficient';
  if (score >= 2) return 'Developing';
  if (score >= 1) return 'Limited';
  return 'No Evidence';
}

export interface RoleAlignmentResult {
  roleTitle: string;
  alignmentPercentage: number;
  totalSkillsRequired: number;
  fullyAlignedSkillsCount: number;
  partialSkillsCount: number;
  criticalGapsCount: number;
  skillDetails: Array<{
    skillId: string;
    skillName: string;
    currentLevel: CapabilityLevel;
    requiredLevel: CapabilityLevel;
    gapScore: number;
    evidenceStatus: EvidenceStatus;
    isCore: boolean;
    isAligned: boolean;
    priority: number;
  }>;
}

/**
 * Deterministically calculates role alignment based on actual current user capabilities vs role requirements.
 * Never hardcoded. Updates immediately when capability or evidence changes.
 */
export function calculateRoleAlignment(
  userCapabilities: UserSkillCapability[],
  roleRequirements: RoleRequirement[]
): RoleAlignmentResult {
  if (roleRequirements.length === 0) {
    return {
      roleTitle: 'Unspecified Role',
      alignmentPercentage: 100,
      totalSkillsRequired: 0,
      fullyAlignedSkillsCount: 0,
      partialSkillsCount: 0,
      criticalGapsCount: 0,
      skillDetails: [],
    };
  }

  const roleTitle = roleRequirements[0].roleTitle;
  let totalWeight = 0;
  let achievedWeight = 0;
  let fullyAlignedCount = 0;
  let partialCount = 0;
  let criticalCount = 0;

  const skillDetails = roleRequirements.map((req) => {
    const userCap = userCapabilities.find((c) => c.skillId === req.skillId);
    const currentLevel: CapabilityLevel = userCap ? userCap.currentLevel : 'No Evidence';
    const evidenceStatus: EvidenceStatus = userCap ? userCap.evidenceStatus : 'Claimed';

    const currentScore = getScoreForLevel(currentLevel);
    const requiredScore = getScoreForLevel(req.requiredLevel);
    const weight = req.isCore ? 1.5 : 1.0;
    totalWeight += weight;

    const gap = Math.max(0, requiredScore - currentScore);
    const progressRatio = requiredScore === 0 ? 1 : Math.min(1, currentScore / requiredScore);
    achievedWeight += progressRatio * weight;

    const isAligned = currentScore >= requiredScore;
    if (isAligned) {
      fullyAlignedCount++;
    } else if (currentScore > 0) {
      partialCount++;
    }

    if (gap >= 2 && req.isCore) {
      criticalCount++;
    }

    let priority = 3;
    if (gap >= 2 && req.isCore) priority = 1;
    else if (gap >= 2) priority = 2;
    else if (gap === 1 && req.isCore) priority = 2;
    else if (gap === 1) priority = 3;
    else priority = 4;

    return {
      skillId: req.skillId,
      skillName: req.skillName,
      currentLevel,
      requiredLevel: req.requiredLevel,
      gapScore: gap,
      evidenceStatus,
      isCore: req.isCore,
      isAligned,
      priority,
    };
  });

  const alignmentPercentage = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  return {
    roleTitle,
    alignmentPercentage,
    totalSkillsRequired: roleRequirements.length,
    fullyAlignedSkillsCount: fullyAlignedCount,
    partialSkillsCount: partialCount,
    criticalGapsCount: criticalCount,
    skillDetails,
  };
}

/**
 * Computes deterministic skill gaps between current capability and role requirements.
 */
export function computeSkillGaps(
  userCapabilities: UserSkillCapability[],
  roleRequirements: RoleRequirement[],
  targetContext: 'current_role' | 'future_role'
): SkillGap[] {
  return roleRequirements.map((req) => {
    const userCap = userCapabilities.find((c) => c.skillId === req.skillId);
    const currentLevel: CapabilityLevel = userCap ? userCap.currentLevel : 'No Evidence';
    const evidenceState: EvidenceStatus = userCap ? userCap.evidenceStatus : 'Claimed';

    const currentScore = getScoreForLevel(currentLevel);
    const requiredScore = getScoreForLevel(req.requiredLevel);
    const gapDiff = Math.max(0, requiredScore - currentScore);

    let severity: GapSeverity = 'LOW';
    let priority = 4;
    let recommendedAction = 'Maintain active practice and verify in production';
    let estimatedEffortHours = 10;
    let requiresWorkplacePractice = false;

    if (gapDiff >= 2 && req.isCore) {
      severity = 'CRITICAL';
      priority = 1;
      recommendedAction = 'Complete core diagnostic assessment and hands-on simulation challenge immediately';
      estimatedEffortHours = 40;
      requiresWorkplacePractice = true;
    } else if (gapDiff >= 2) {
      severity = 'HIGH';
      priority = 2;
      recommendedAction = 'Engage in micro-learning mission followed by practical deployment challenge';
      estimatedEffortHours = 25;
      requiresWorkplacePractice = true;
    } else if (gapDiff === 1 && req.isCore) {
      severity = 'HIGH';
      priority = 2;
      recommendedAction = 'Document workplace application and request supervisor mentor endorsement';
      estimatedEffortHours = 18;
      requiresWorkplacePractice = true;
    } else if (gapDiff === 1) {
      severity = 'MEDIUM';
      priority = 3;
      recommendedAction = 'Targeted knowledge assessment to prove advancing proficiency';
      estimatedEffortHours = 12;
      requiresWorkplacePractice = false;
    } else {
      severity = 'LOW';
      priority = 5;
      recommendedAction = 'Submit for workplace verification to elevate from Assessed to Verified';
      estimatedEffortHours = 6;
      requiresWorkplacePractice = evidenceState !== 'Verified';
    }

    const reason =
      gapDiff > 0
        ? `Role requires ${req.requiredLevel} capability; currently verified at ${currentLevel} (${evidenceState} evidence).`
        : `Target capability of ${req.requiredLevel} has been achieved (${evidenceState} status).`;

    return {
      id: `gap-${targetContext}-${req.skillId}`,
      skillId: req.skillId,
      skillName: req.skillName,
      category: 'Cloud & Infrastructure',
      currentLevel,
      requiredLevel: req.requiredLevel,
      gapDiff,
      severity,
      priority,
      targetContext,
      reason,
      evidenceState,
      recommendedAction,
      estimatedEffortHours,
      requiresWorkplacePractice,
    };
  });
}

/**
 * Dynamically sorts and prioritizes learning missions based on actual skill gaps and current progress.
 */
export function adaptLearningPathway(
  missions: LearningMission[],
  gaps: SkillGap[],
  progressItems: LearningProgress[]
): Array<LearningMission & { priority: number; gapSeverity: GapSeverity; userStatus: string }> {
  return missions
    .map((mission) => {
      const matchingGap = gaps.find((g) => g.skillId === mission.skillId);
      const progress = progressItems.find((p) => p.missionId === mission.id);

      const priority = matchingGap ? matchingGap.priority : 4;
      const gapSeverity: GapSeverity = matchingGap ? matchingGap.severity : 'LOW';
      const userStatus = progress ? progress.status : 'not_started';

      return {
        ...mission,
        priority,
        gapSeverity,
        userStatus,
      };
    })
    .sort((a, b) => {
      // Incomplete prioritized first
      if (a.userStatus === 'completed' && b.userStatus !== 'completed') return 1;
      if (a.userStatus !== 'completed' && b.userStatus === 'completed') return -1;
      // In progress prioritized
      if (a.userStatus === 'in_progress' && b.userStatus !== 'in_progress') return -1;
      if (a.userStatus !== 'in_progress' && b.userStatus === 'in_progress') return 1;
      // Priority (1 is highest)
      return a.priority - b.priority;
    });
}
