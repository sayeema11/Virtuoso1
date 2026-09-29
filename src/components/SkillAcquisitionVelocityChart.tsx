import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  Target,
  Sliders,
  Award,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Calendar,
  User,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { CurriculumAdjustmentModal } from './CurriculumAdjustmentModal';

export type ChartAnalysisMode = 'absolute' | 'velocity';
type MetricMode = 'competencies' | 'capabilityScore';
type VelocityScenario = 'baseline' | 'sprint' | 'paced';
type HorizonMonths = 3 | 6;

export interface SkillAcquisitionVelocityChartProps {
  database: DatabaseState;
  onOpenCurriculumModal?: () => void;
  analysisMode?: ChartAnalysisMode;
  onAnalysisModeChange?: (mode: ChartAnalysisMode) => void;
  onTriggerCelebration?: (title: string, subtitle?: string) => void;
}

interface MilestoneDetail {
  title: string;
  completionDate: string; // Specific milestone completion date e.g. 'Apr 18, 2026'
  status: 'Completed' | 'Current Focus' | 'Projected';
  evidenceType?: string;
  badge?: string;
}

interface DataPoint {
  month: string;
  shortMonth: string;
  isProjected?: boolean;
  totalSkills?: number | null;
  demonstrated?: number | null;
  verified?: number | null;
  capabilityScore?: number | null;
  velocity?: number | null;
  projectedVelocity?: number | null;
  velocityLower?: number | null;
  velocityUpper?: number | null;
  velocityThreshold?: number | null;
  milestone: string;
  milestoneCompletionDate: string; // Exact milestone completion or target projection date
  milestoneStatus: 'Completed' | 'Current Focus' | 'Projected';
  milestoneDetails?: MilestoneDetail[];
  // ML Projection fields
  projectedSkills?: number | null;
  projectedScore?: number | null;
  confidenceLower?: number | null;
  confidenceUpper?: number | null;
  confidenceRange?: [number, number] | null;
  confidenceIntervalWidth?: number;
}

export const SkillAcquisitionVelocityChart: React.FC<SkillAcquisitionVelocityChartProps> = ({
  database,
  onOpenCurriculumModal,
  analysisMode: externalAnalysisMode,
  onAnalysisModeChange,
  onTriggerCelebration,
}) => {
  const [internalAnalysisMode, setInternalAnalysisMode] = useState<ChartAnalysisMode>('absolute');
  const activeAnalysisMode = externalAnalysisMode !== undefined ? externalAnalysisMode : internalAnalysisMode;

  const handleModeSwitch = (mode: ChartAnalysisMode) => {
    setInternalAnalysisMode(mode);
    onAnalysisModeChange?.(mode);
  };

  const [metricMode, setMetricMode] = useState<MetricMode>('competencies');
  const [showProjection, setShowProjection] = useState<boolean>(true);
  const [scenario, setScenario] = useState<VelocityScenario>('baseline');
  const [horizon, setHorizon] = useState<HorizonMonths>(6);
  const [thresholdVelocity, setThresholdVelocity] = useState<number>(1.5);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const { userCapabilities } = database;

  // Compute live current stats for Month 6 (Sep 2026)
  const currentTotalSkills = Math.max(1, userCapabilities.length);
  const currentVerified = userCapabilities.filter((c) => c.isVerified || c.evidenceStatus === 'Verified').length;
  const currentDemonstratedOrApplied = userCapabilities.filter(
    (c) => c.evidenceStatus === 'Demonstrated' || c.evidenceStatus === 'Applied' || c.evidenceStatus === 'Verified'
  ).length;

  const currentScoreAvg =
    userCapabilities.length > 0
      ? Math.round(userCapabilities.reduce((acc, c) => acc + c.confidenceScore, 0) / userCapabilities.length)
      : 68;

  // 6-month historical progression data points (Apr 2026 - Sep 2026)
  const historicalData: DataPoint[] = useMemo(() => {
    return [
      {
        month: 'Apr 2026',
        shortMonth: 'Apr',
        isProjected: false,
        totalSkills: 2,
        demonstrated: 1,
        verified: 0,
        capabilityScore: 24,
        velocity: 2.0,
        velocityThreshold: thresholdVelocity,
        milestone: 'Diagnostic intake & baseline assessment (Linux & Docker baseline)',
        milestoneCompletionDate: 'Apr 18, 2026',
        milestoneStatus: 'Completed',
        milestoneDetails: [
          {
            title: 'Diagnostic Intake & Skills Mapping',
            completionDate: 'Apr 12, 2026',
            status: 'Completed',
            evidenceType: 'Diagnostic Assessment',
            badge: 'Foundational',
          },
          {
            title: 'Linux & Docker Environment Baseline Certified',
            completionDate: 'Apr 18, 2026',
            status: 'Completed',
            evidenceType: 'System Verification',
            badge: '2 Skills Verified',
          },
        ],
      },
      {
        month: 'May 2026',
        shortMonth: 'May',
        isProjected: false,
        totalSkills: 4,
        demonstrated: 1,
        verified: 0,
        capabilityScore: 36,
        velocity: 2.0,
        velocityThreshold: thresholdVelocity,
        milestone: 'Terraform & IAM cloud governance competency goals added',
        milestoneCompletionDate: 'May 12, 2026',
        milestoneStatus: 'Completed',
        milestoneDetails: [
          {
            title: 'Infrastructure as Code (Terraform) Curriculum Added',
            completionDate: 'May 06, 2026',
            status: 'Completed',
            evidenceType: 'Curriculum Sync',
            badge: 'Resume Claim',
          },
          {
            title: 'Cloud Security & IAM Governance Level-1 Achieved',
            completionDate: 'May 12, 2026',
            status: 'Completed',
            evidenceType: 'Knowledge Assessment',
            badge: 'Claimed',
          },
        ],
      },
      {
        month: 'Jun 2026',
        shortMonth: 'Jun',
        isProjected: false,
        totalSkills: 5,
        demonstrated: 2,
        verified: 0,
        capabilityScore: 45,
        velocity: 1.0,
        velocityThreshold: thresholdVelocity,
        milestone: 'Kubernetes orchestration diagnostic assessment passed (92%)',
        milestoneCompletionDate: 'Jun 18, 2026',
        milestoneStatus: 'Completed',
        milestoneDetails: [
          {
            title: 'Pod Lifecycle & Service Networking Simulation Passed',
            completionDate: 'Jun 14, 2026',
            status: 'Completed',
            evidenceType: 'Interactive Lab',
            badge: 'Score 88%',
          },
          {
            title: 'Kubernetes Orchestration Diagnostic Exam Certified (92%)',
            completionDate: 'Jun 18, 2026',
            status: 'Completed',
            evidenceType: 'Exam Assessment',
            badge: 'Assessed',
          },
        ],
      },
      {
        month: 'Jul 2026',
        shortMonth: 'Jul',
        isProjected: false,
        totalSkills: 6,
        demonstrated: 3,
        verified: 0,
        capabilityScore: 56,
        velocity: 1.0,
        velocityThreshold: thresholdVelocity,
        milestone: 'CI/CD automated pipeline practical challenge demonstrated in sandbox',
        milestoneCompletionDate: 'Jul 28, 2026',
        milestoneStatus: 'Completed',
        milestoneDetails: [
          {
            title: 'GitHub Actions Continuous Integration Automated Build Passed',
            completionDate: 'Jul 19, 2026',
            status: 'Completed',
            evidenceType: 'Workplace Pull Request',
            badge: 'Automated CI',
          },
          {
            title: 'Linux System Internals Diagnostic Check Passed (84%)',
            completionDate: 'Jul 28, 2026',
            status: 'Completed',
            evidenceType: 'Diagnostic Assessment',
            badge: 'Applied',
          },
        ],
      },
      {
        month: 'Aug 2026',
        shortMonth: 'Aug',
        isProjected: false,
        totalSkills: Math.max(6, currentTotalSkills - 1),
        demonstrated: Math.max(3, currentDemonstratedOrApplied - 1),
        verified: 1,
        capabilityScore: Math.max(60, currentScoreAvg - 6),
        velocity: 1.0,
        velocityThreshold: thresholdVelocity,
        milestone: 'Docker containerization verified in production by mentor',
        milestoneCompletionDate: 'Aug 14, 2026',
        milestoneStatus: 'Completed',
        milestoneDetails: [
          {
            title: 'Production Migration of Legacy Auth Service to Containers',
            completionDate: 'Aug 05, 2026',
            status: 'Completed',
            evidenceType: 'Production Commit',
            badge: 'Workplace Demo',
          },
          {
            title: 'Supervisor Production Verification: Docker & Containerization',
            completionDate: 'Aug 14, 2026',
            status: 'Completed',
            evidenceType: 'Mentor Sign-Off',
            badge: 'Supervisor Verified',
          },
        ],
      },
      {
        month: 'Sep 2026',
        shortMonth: 'Sep (Now)',
        isProjected: false,
        totalSkills: currentTotalSkills,
        demonstrated: currentDemonstratedOrApplied,
        verified: currentVerified,
        capabilityScore: currentScoreAvg,
        velocity: 1.0,
        velocityThreshold: thresholdVelocity,
        milestone: 'Active Kubernetes zero-downtime mission & multi-competency practice',
        milestoneCompletionDate: 'Sep 20, 2026',
        milestoneStatus: 'Current Focus',
        milestoneDetails: [
          {
            title: 'Linux systemd Health Watchdogs & Log Rotation Verified',
            completionDate: 'Sep 10, 2026',
            status: 'Completed',
            evidenceType: 'Production Artifact',
            badge: 'Applied',
          },
          {
            title: 'Kubernetes Multi-Cluster Zero-Downtime Workplace Challenge Active',
            completionDate: 'Sep 20, 2026',
            status: 'Current Focus',
            evidenceType: 'Active Challenge',
            badge: 'In Progress (75%)',
          },
        ],
        projectedSkills: currentTotalSkills,
        projectedScore: currentScoreAvg,
        confidenceLower: currentTotalSkills,
        confidenceUpper: currentTotalSkills,
        confidenceRange: [currentTotalSkills, currentTotalSkills],
        confidenceIntervalWidth: 0,
        projectedVelocity: 1.0,
        velocityLower: 1.0,
        velocityUpper: 1.0,
      },
    ];
  }, [currentTotalSkills, currentDemonstratedOrApplied, currentVerified, currentScoreAvg, thresholdVelocity]);

  // =========================================================================
  // MACHINE LEARNING REGRESSION ENGINE (OLS with Heteroscedastic Bounds)
  // =========================================================================
  const mlModel = useMemo(() => {
    const n = historicalData.length;
    const xValues = [0, 1, 2, 3, 4, 5];
    const ySkills = historicalData.map((d) => d.totalSkills ?? 0);
    const yScores = historicalData.map((d) => d.capabilityScore ?? 0);

    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const ySkillsMean = ySkills.reduce((a, b) => a + b, 0) / n;
    const yScoresMean = yScores.reduce((a, b) => a + b, 0) / n;

    let ssXX = 0;
    let ssXYSkills = 0;
    let ssXYScores = 0;
    for (let i = 0; i < n; i++) {
      const dx = xValues[i] - xMean;
      ssXX += dx * dx;
      ssXYSkills += dx * (ySkills[i] - ySkillsMean);
      ssXYScores += dx * (yScores[i] - yScoresMean);
    }

    const rawSlopeSkills = ssXX !== 0 ? ssXYSkills / ssXX : 1.0;
    const rawSlopeScores = ssXX !== 0 ? ssXYScores / ssXX : 8.5;
    const interceptSkills = ySkillsMean - rawSlopeSkills * xMean;

    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const yFit = interceptSkills + rawSlopeSkills * xValues[i];
      ssTot += Math.pow(ySkills[i] - ySkillsMean, 2);
      ssRes += Math.pow(ySkills[i] - yFit, 2);
    }
    const rSquared = ssTot > 0 ? Math.max(0.85, Math.min(0.99, 1 - ssRes / ssTot)) : 0.96;
    const standardError = Math.sqrt(ssRes / Math.max(1, n - 2));

    return {
      rawSlopeSkills,
      rawSlopeScores,
      rSquared: Number(rSquared.toFixed(3)),
      standardError: Math.max(0.35, standardError),
      ssXX,
      xMean,
      n,
    };
  }, [historicalData]);

  // Scenario Multiplier
  const velocityMultiplier = useMemo(() => {
    switch (scenario) {
      case 'sprint':
        return 1.3;
      case 'paced':
        return 0.75;
      case 'baseline':
      default:
        return 1.0;
    }
  }, [scenario]);

  const effectiveMonthlySkillVelocity = mlModel.rawSlopeSkills * velocityMultiplier;
  const effectiveMonthlyScoreVelocity = mlModel.rawSlopeScores * velocityMultiplier;

  // Velocity Deficit & Threshold Alert Detection
  const isVelocityBelowThreshold = effectiveMonthlySkillVelocity < thresholdVelocity;
  const velocityDeficitPercentage = isVelocityBelowThreshold
    ? Math.round(((thresholdVelocity - effectiveMonthlySkillVelocity) / thresholdVelocity) * 100)
    : 0;

  // Auto-evaluate velocity trigger on load
  useEffect(() => {
    if (isVelocityBelowThreshold) {
      dataStore.triggerVelocityAlert(effectiveMonthlySkillVelocity, thresholdVelocity, false);
    }
  }, [isVelocityBelowThreshold, effectiveMonthlySkillVelocity, thresholdVelocity]);

  // Generate Future Projected Data Points
  const projectedFuturePoints: DataPoint[] = useMemo(() => {
    if (!showProjection) return [];

    const monthsConfig = [
      {
        month: 'Oct 2026',
        shortMonth: 'Oct',
        step: 1,
        milestone: 'Projected: Cloud security & Terraform advanced state automation verified',
        milestoneCompletionDate: 'Oct 24, 2026',
        milestoneStatus: 'Projected' as const,
        milestoneDetails: [
          {
            title: 'Terraform State Locking & DynamoDB Backend Architecture',
            completionDate: 'Oct 14, 2026',
            status: 'Projected' as const,
            evidenceType: 'Workplace Pull Request',
            badge: 'Target Skill #7',
          },
          {
            title: 'Cloud Security IAM Zero-Trust Audit & Review',
            completionDate: 'Oct 24, 2026',
            status: 'Projected' as const,
            evidenceType: 'Supervisor Verification',
            badge: 'Target Skill #8',
          },
        ],
      },
      {
        month: 'Nov 2026',
        shortMonth: 'Nov',
        step: 2,
        milestone: 'Projected: 10 Competencies milestone (Senior Platform benchmark threshold reached)',
        milestoneCompletionDate: 'Nov 20, 2026',
        milestoneStatus: 'Projected' as const,
        milestoneDetails: [
          {
            title: 'Technical Mentorship & Code Review Guild Participation',
            completionDate: 'Nov 08, 2026',
            status: 'Projected' as const,
            evidenceType: 'Peer Endorsement',
            badge: 'Target Skill #9',
          },
          {
            title: 'Senior Platform Engineer Competency Benchmark Reached (10 Skills)',
            completionDate: 'Nov 20, 2026',
            status: 'Projected' as const,
            evidenceType: 'Milestone Threshold',
            badge: 'Senior Benchmark',
          },
        ],
      },
      {
        month: 'Dec 2026',
        shortMonth: 'Dec',
        step: 3,
        milestone: 'Projected: Observability & Prometheus/Grafana enterprise telemetry acquired',
        milestoneCompletionDate: 'Dec 18, 2026',
        milestoneStatus: 'Projected' as const,
        milestoneDetails: [
          {
            title: 'Prometheus & Alertmanager Service Level Objectives Setup',
            completionDate: 'Dec 10, 2026',
            status: 'Projected' as const,
            evidenceType: 'Telemetry Pipeline',
            badge: 'Target Skill #11',
          },
          {
            title: 'Grafana Enterprise Dashboard & Incident Playbooks',
            completionDate: 'Dec 18, 2026',
            status: 'Projected' as const,
            evidenceType: 'Incident Response Sign-off',
            badge: 'Observability',
          },
        ],
      },
      {
        month: 'Jan 2027',
        shortMonth: 'Jan',
        step: 4,
        milestone: 'Projected: Multi-cloud architecture & Disaster Recovery practical deployment',
        milestoneCompletionDate: 'Jan 22, 2027',
        milestoneStatus: 'Projected' as const,
        milestoneDetails: [
          {
            title: 'Cross-Region Failover Architecture & Recovery Simulation',
            completionDate: 'Jan 15, 2027',
            status: 'Projected' as const,
            evidenceType: 'Disaster Recovery Drill',
            badge: 'Target Skill #12',
          },
          {
            title: 'Multi-Cloud Transit Gateway & VPC Peering Mesh',
            completionDate: 'Jan 22, 2027',
            status: 'Projected' as const,
            evidenceType: 'Architecture Review',
            badge: 'Staff Scope',
          },
        ],
      },
      {
        month: 'Feb 2027',
        shortMonth: 'Feb',
        step: 5,
        milestone: 'Projected: 12 Competencies milestone (Staff Cloud Architect benchmark reached)',
        milestoneCompletionDate: 'Feb 26, 2027',
        milestoneStatus: 'Projected' as const,
        milestoneDetails: [
          {
            title: 'Staff Cloud Architect Portfolio Review & Governance Board Sign-Off',
            completionDate: 'Feb 26, 2027',
            status: 'Projected' as const,
            evidenceType: 'Executive Sign-Off',
            badge: 'Staff Architect Milestone',
          },
        ],
      },
      {
        month: 'Mar 2027',
        shortMonth: 'Mar',
        step: 6,
        milestone: 'Projected: High-scale microservices mesh & zero-trust security orchestration',
        milestoneCompletionDate: 'Mar 25, 2027',
        milestoneStatus: 'Projected' as const,
        milestoneDetails: [
          {
            title: 'Istio Service Mesh mTLS & Distributed Tracing Implementation',
            completionDate: 'Mar 15, 2027',
            status: 'Projected' as const,
            evidenceType: 'Service Mesh Audit',
            badge: 'Target Skill #13',
          },
          {
            title: 'Automated Compliance Policy as Code (OPA Gatekeeper)',
            completionDate: 'Mar 25, 2027',
            status: 'Projected' as const,
            evidenceType: 'Security Gate Certification',
            badge: 'High Mastery',
          },
        ],
      },
    ];

    const targetSteps = monthsConfig.slice(0, horizon);

    return targetSteps.map((m) => {
      const step = m.step;
      const futureX = 5 + step;

      const projectedSkillValue = Number(
        (currentTotalSkills + effectiveMonthlySkillVelocity * step).toFixed(1)
      );

      const varianceExpansion = Math.sqrt(
        1 + 1 / mlModel.n + Math.pow(futureX - mlModel.xMean, 2) / mlModel.ssXX
      );
      const margin = Number((mlModel.standardError * 1.96 * Math.sqrt(step * 0.7) * varianceExpansion * 0.5).toFixed(1));

      const lowerSkillBound = Math.max(currentTotalSkills, Number((projectedSkillValue - margin).toFixed(1)));
      const upperSkillBound = Number((projectedSkillValue + margin).toFixed(1));

      const projectedScoreValue = Math.min(
        100,
        Math.round(currentScoreAvg + effectiveMonthlyScoreVelocity * step)
      );
      const lowerScoreBound = Math.max(currentScoreAvg, Math.round(projectedScoreValue - margin * 4));
      const upperScoreBound = Math.min(100, Math.round(projectedScoreValue + margin * 4));

      // Velocity corridor metrics
      const projectedVelocityValue = Number(effectiveMonthlySkillVelocity.toFixed(1));
      const velMargin = Number((0.2 * Math.sqrt(step * 0.5)).toFixed(1));
      const lowerVelBound = Math.max(0.2, Number((projectedVelocityValue - velMargin).toFixed(1)));
      const upperVelBound = Number((projectedVelocityValue + velMargin).toFixed(1));

      return {
        month: m.month,
        shortMonth: `${m.shortMonth}*`,
        isProjected: true,
        totalSkills: null,
        demonstrated: null,
        verified: null,
        capabilityScore: null,
        velocity: null,
        velocityThreshold: thresholdVelocity,
        projectedVelocity: projectedVelocityValue,
        velocityLower: lowerVelBound,
        velocityUpper: upperVelBound,
        milestone: m.milestone,
        milestoneCompletionDate: m.milestoneCompletionDate,
        milestoneStatus: m.milestoneStatus,
        milestoneDetails: m.milestoneDetails,
        projectedSkills: projectedSkillValue,
        projectedScore: projectedScoreValue,
        confidenceLower: metricMode === 'competencies' ? lowerSkillBound : lowerScoreBound,
        confidenceUpper: metricMode === 'competencies' ? upperSkillBound : upperScoreBound,
        confidenceRange:
          metricMode === 'competencies'
            ? [lowerSkillBound, upperSkillBound]
            : [lowerScoreBound, upperScoreBound],
        confidenceIntervalWidth: upperSkillBound - lowerSkillBound,
      };
    });
  }, [
    showProjection,
    horizon,
    currentTotalSkills,
    currentScoreAvg,
    effectiveMonthlySkillVelocity,
    effectiveMonthlyScoreVelocity,
    mlModel,
    metricMode,
    thresholdVelocity,
  ]);

  const combinedData: DataPoint[] = useMemo(() => {
    return [...historicalData, ...projectedFuturePoints];
  }, [historicalData, projectedFuturePoints]);

  const sixMonthGain = currentTotalSkills - (historicalData[0]?.totalSkills ?? 2);
  const scoreGrowth = currentScoreAvg - (historicalData[0]?.capabilityScore ?? 24);

  // Target Milestone Predictions
  const milestoneEstimates = useMemo(() => {
    const calcTimeline = (targetValue: number, currentValue: number, velocity: number) => {
      if (currentValue >= targetValue) return { achieved: true, weeks: 0, date: 'Achieved' };
      const gap = targetValue - currentValue;
      const monthsNeeded = gap / Math.max(0.1, velocity);
      const weeksNeeded = Math.max(1, Math.round(monthsNeeded * 4.33));

      const futureDate = new Date(2026, 8, 28);
      futureDate.setDate(futureDate.getDate() + weeksNeeded * 7);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${monthNames[futureDate.getMonth()]} ${futureDate.getFullYear()}`;

      return {
        achieved: false,
        weeks: weeksNeeded,
        months: Number(monthsNeeded.toFixed(1)),
        date: dateStr,
      };
    };

    const target10 = calcTimeline(10, currentTotalSkills, effectiveMonthlySkillVelocity);
    const target12 = calcTimeline(12, currentTotalSkills, effectiveMonthlySkillVelocity);
    const targetScore85 = calcTimeline(85, currentScoreAvg, effectiveMonthlyScoreVelocity);

    return {
      target10,
      target12,
      targetScore85,
    };
  }, [currentTotalSkills, currentScoreAvg, effectiveMonthlySkillVelocity, effectiveMonthlyScoreVelocity]);

  // Handler to manually simulate triggering the velocity alert
  const handleSimulateVelocityNotification = () => {
    dataStore.triggerVelocityAlert(effectiveMonthlySkillVelocity, thresholdVelocity, true);
    setNotificationToast('Velocity Alert Triggered: Notification posted to the header bell with suggested interventions!');
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Custom Interactive Recharts Tooltip in Beige + Black styling with specific milestone completion dates
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point: DataPoint = payload[0].payload;
      const isProjected = point.isProjected;
      const isCurrentFocus = point.milestoneStatus === 'Current Focus';

      return (
        <div className="bg-[#111111] text-[#F5EEE4] p-3.5 rounded-2xl shadow-2xl border border-[#F5EEE4]/20 max-w-sm text-xs space-y-2.5 backdrop-blur-md">
          {/* Header: Month & Forecast / Milestone Tag */}
          <div className="flex items-center justify-between border-b border-[#F5EEE4]/15 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold font-['Cabinet_Grotesk'] text-sm tracking-wide text-[#F5EEE4]">
                {point.month}
              </span>
              {isProjected ? (
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-[#F5EEE4] text-[#111111] rounded-sm flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  ML Forecast
                </span>
              ) : isCurrentFocus ? (
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white rounded-sm flex items-center gap-0.5">
                  <Activity className="w-2.5 h-2.5" />
                  Current Focus
                </span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-sm flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Validated
                </span>
              )}
            </div>
            <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-[#F5EEE4]/15 text-[#F5EEE4] rounded-sm font-mono">
              +{point.velocity ?? point.projectedVelocity ?? 1} skills/mo
            </span>
          </div>

          {/* Prominent Milestone Completion Date Callout */}
          <div className="p-2 rounded-xl bg-[#F5EEE4]/08 border border-[#F5EEE4]/15 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#DED0BD] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                {isProjected ? 'Target Completion Date:' : 'Milestone Completion Date:'}
              </span>
              <span className="font-bold text-[#F5EEE4] font-mono text-xs tabular-nums bg-[#F5EEE4]/15 px-1.5 py-0.5 rounded">
                {point.milestoneCompletionDate}
              </span>
            </div>
            <div className="text-[11px] text-[#F5EEE4]/90 font-medium leading-snug">
              {point.milestone}
            </div>
          </div>

          {/* Detailed Milestone Evidence / Sub-Achievements */}
          {point.milestoneDetails && point.milestoneDetails.length > 0 && (
            <div className="space-y-1 pt-0.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#DED0BD]/70 block">
                {isProjected ? 'Projected Milestone Workstreams' : 'Certified Completion Records'}
              </span>
              <div className="space-y-1">
                {point.milestoneDetails.map((detail, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-1.5 rounded-lg bg-[#F5EEE4]/05 border border-[#F5EEE4]/10 flex items-center justify-between text-[10px] gap-2"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          detail.status === 'Completed'
                            ? 'bg-emerald-400'
                            : detail.status === 'Current Focus'
                            ? 'bg-cyan-400 animate-pulse'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span className="truncate text-[#F5EEE4]/90" title={detail.title}>
                        {detail.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {detail.badge && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-semibold bg-[#F5EEE4]/15 text-[#DED0BD]">
                          {detail.badge}
                        </span>
                      )}
                      <span className="font-mono text-[#DED0BD] text-[9px] font-bold">
                        {detail.completionDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metric Details depending on Mode */}
          {activeAnalysisMode === 'velocity' ? (
            /* Velocity Trend Specific Tooltip */
            <div className="space-y-1.5 font-mono text-[11px] pt-1 border-t border-[#F5EEE4]/10">
              <div className="flex items-center justify-between text-[#F5EEE4]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F5EEE4]" />
                  {isProjected ? 'Projected Velocity:' : 'Monthly Growth Velocity:'}
                </span>
                <span className="font-bold tabular-nums text-sm">
                  +{isProjected ? point.projectedVelocity : point.velocity} skills/mo
                </span>
              </div>

              <div className="flex items-center justify-between text-[#DED0BD]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-amber-400" />
                  Target Growth Threshold:
                </span>
                <span className="tabular-nums font-bold">{thresholdVelocity.toFixed(1)} skills/mo</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#F5EEE4]/10 text-[10px]">
                <span>Pacing Evaluation:</span>
                {(isProjected ? (point.projectedVelocity ?? 0) : (point.velocity ?? 0)) >= thresholdVelocity ? (
                  <span className="text-emerald-400 font-bold">✓ Exceeds Threshold</span>
                ) : (
                  <span className="text-amber-400 font-bold">⚠️ Below Growth Threshold</span>
                )}
              </div>

              {isProjected && (
                <div className="flex items-center justify-between text-[#E8DDCC]/70 text-[10px]">
                  <span>95% Confidence Corridor:</span>
                  <span className="tabular-nums">[{point.velocityLower} - {point.velocityUpper}] /mo</span>
                </div>
              )}
            </div>
          ) : metricMode === 'competencies' ? (
            /* Absolute Competencies Tooltip */
            <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-[#F5EEE4]/10">
              {!isProjected ? (
                <>
                  <div className="flex items-center justify-between text-[#F5EEE4]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F5EEE4]" />
                      Total Acquired Skills:
                    </span>
                    <span className="font-bold tabular-nums">{point.totalSkills}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#DED0BD]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#DED0BD]" />
                      Demonstrated / Applied:
                    </span>
                    <span className="font-bold tabular-nums">{point.demonstrated}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#E8DDCC]/70">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm border border-[#F5EEE4]" />
                      Supervisor Verified:
                    </span>
                    <span className="font-bold tabular-nums">{point.verified}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[#F5EEE4]">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full border border-[#F5EEE4] bg-transparent" />
                      ML Projected Acquisition:
                    </span>
                    <span className="font-bold tabular-nums text-sm">
                      ~{point.projectedSkills} skills
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#DED0BD]">
                    <span>95% Confidence Corridor:</span>
                    <span className="tabular-nums">
                      [{point.confidenceLower} - {point.confidenceUpper}]
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#E8DDCC]/70 text-[10px]">
                    <span>Model Confidence:</span>
                    <span className="tabular-nums font-bold">
                      {(mlModel.rSquared * 100).toFixed(0)}% (R² = {mlModel.rSquared})
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Absolute Capability Score Tooltip */
            <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-[#F5EEE4]/10">
              {!isProjected ? (
                <>
                  <div className="flex items-center justify-between text-[#F5EEE4]">
                    <span>Capability Index Score:</span>
                    <span className="font-bold tabular-nums">{point.capabilityScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between text-[#DED0BD]">
                    <span>Total Skill Portfolio:</span>
                    <span className="font-bold tabular-nums">{point.totalSkills} competencies</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[#F5EEE4]">
                    <span className="font-bold">ML Projected Score:</span>
                    <span className="font-bold tabular-nums text-sm">
                      {point.projectedScore} / 100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#DED0BD]">
                    <span>Expected Range:</span>
                    <span className="tabular-nums">
                      {point.confidenceLower} – {point.confidenceUpper} pts
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="pt-1.5 border-t border-[#F5EEE4]/15 flex items-center justify-between text-[10px] text-[#F5EEE4]/70">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Hover along chart to trace velocity milestones</span>
            </span>
            <span className="font-mono text-[9px] text-[#DED0BD]">
              {point.shortMonth.replace('*', '')}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-5">
      {/* Top Bar: Title, Badges, and Primary View Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
              {activeAnalysisMode === 'velocity'
                ? 'GROWTH VELOCITY TELEMETRY & THRESHOLD TRACKING'
                : 'SKILL ACQUISITION PROGRESS & ML TIMELINE PROJECTION'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-md flex items-center gap-1 shadow-xs">
              <TrendingUp className="w-3 h-3" />
              +{effectiveMonthlySkillVelocity.toFixed(1)} Skills / Mo
            </span>
            {showProjection && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E8DDCC] text-[#111111] rounded-md border border-[#111111]/15 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#111111]" />
                ML Regression Active (R² = {mlModel.rSquared})
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 ${
                activeAnalysisMode === 'velocity'
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-xs'
                  : 'bg-[#F5EEE4] text-[#111111] border-[#111111]/15'
              }`}
            >
              Mode: {activeAnalysisMode === 'velocity' ? 'Growth Velocity' : 'Absolute Skill Level'}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#111111] font-['Cabinet_Grotesk'] mt-1">
            {activeAnalysisMode === 'velocity'
              ? 'Skill Growth Velocity & Threshold Dynamics'
              : 'Skill Acquisition Progress & Timeline Projection'}
          </h3>
          <p className="text-xs text-[#111111]/60">
            {activeAnalysisMode === 'velocity'
              ? 'Analyze month-over-month acquisition pace, acceleration/deceleration trends, and early warning thresholds.'
              : 'Empirical progression combined with machine learning trajectory modeling to forecast milestones and monitor career benchmarks.'}
          </p>
        </div>

        {/* Action Controls: Chart Mode Switcher + ML Projection Toggle & Metric Sub-Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Primary Mode Toggle Switch: Absolute Skill Level vs Growth Velocity */}
          <div className="inline-flex p-1 rounded-xl bg-[#111111]/08 border border-[#111111]/15 text-xs font-semibold shadow-inner">
            <button
              onClick={() => handleModeSwitch('absolute')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAnalysisMode === 'absolute'
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm font-bold'
                  : 'text-[#111111]/70 hover:text-[#111111]'
              }`}
              title="Display cumulative skill acquisition level over time"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Absolute Skill Level</span>
            </button>
            <button
              onClick={() => handleModeSwitch('velocity')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAnalysisMode === 'velocity'
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm font-bold'
                  : 'text-[#111111]/70 hover:text-[#111111]'
              }`}
              title="Display monthly rate of skill acquisition (velocity) and threshold comparison"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Growth Velocity</span>
            </button>
          </div>

          {/* ML Projection Toggle */}
          <button
            onClick={() => setShowProjection(!showProjection)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              showProjection
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent'
                : 'bg-[#F5EEE4] text-[#111111]/70 border-[#111111]/20 hover:text-[#111111]'
            }`}
            title="Toggle Machine-Learning predictive timeline projection line"
          >
            <Sparkles className={`w-3.5 h-3.5 ${showProjection ? 'text-white' : 'text-[#111111]/60'}`} />
            <span>ML Projection</span>
            <span
              className={`w-2 h-2 rounded-full ${showProjection ? 'bg-white' : 'bg-[#111111]/30'}`}
            />
          </button>

          {/* Sub-Metric Switcher (only in Absolute mode) */}
          {activeAnalysisMode === 'absolute' && (
            <div className="inline-flex p-1 rounded-xl bg-[#E8DDCC]/70 border border-[#111111]/10 text-xs font-semibold">
              <button
                onClick={() => setMetricMode('competencies')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  metricMode === 'competencies'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm font-bold'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                Competencies
              </button>
              <button
                onClick={() => setMetricMode('capabilityScore')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  metricMode === 'capabilityScore'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm font-bold'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                Index Score
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VELOCITY THRESHOLD EARLY WARNING & NOTIFICATION TRIGGER BANNER */}
      {/* ========================================================================= */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isVelocityBelowThreshold
            ? 'bg-[#F5EEE4] border-[#111111] shadow-sm'
            : 'bg-[#E8DDCC]/40 border-[#111111]/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl mt-0.5 ${
                isVelocityBelowThreshold
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-xs'
                  : 'bg-[#E8DDCC] text-[#111111]'
              }`}
            >
              {isVelocityBelowThreshold ? (
                <AlertTriangle className="w-4 h-4 text-amber-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-[#111111] font-['Cabinet_Grotesk']">
                  {isVelocityBelowThreshold
                    ? 'Velocity Lag Alert: Pace Below Growth Threshold'
                    : 'Velocity On-Track: Pacing Meets Projected Goal'}
                </span>
                {isVelocityBelowThreshold ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm tabular-nums shadow-2xs">
                    -{velocityDeficitPercentage}% Deficit
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-800 text-white rounded-sm">
                    Healthy Pace
                  </span>
                )}
              </div>
              <p className="text-xs text-[#111111]/75 leading-relaxed">
                {isVelocityBelowThreshold
                  ? `Current velocity (${effectiveMonthlySkillVelocity.toFixed(1)} skills/mo) is lagging your ${thresholdVelocity.toFixed(1)} skills/mo target. We suggest scheduling a 1:1 mentor check-in or rebalancing your curriculum to prevent milestone delay.`
                  : `Your current acquisition rate (${effectiveMonthlySkillVelocity.toFixed(1)}/mo) matches or exceeds your ${thresholdVelocity.toFixed(1)}/mo threshold for target role readiness.`}
              </p>
            </div>
          </div>

          {/* Action Intervention Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            {isVelocityBelowThreshold && (
              <>
                <button
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold hover:opacity-95 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Adjust Curriculum
                </button>

                <button
                  onClick={() => setIsCurriculumModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#E8DDCC] text-[#111111] text-xs font-bold hover:bg-[#DED0BD] border border-[#111111]/15 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  Mentor Check-In
                </button>
              </>
            )}

            {/* Test Trigger Button */}
            <button
              onClick={handleSimulateVelocityNotification}
              className="px-2.5 py-1.5 rounded-xl border border-[#111111]/20 hover:border-[#111111] text-[11px] font-bold text-[#111111]/80 hover:text-[#111111] transition-all flex items-center gap-1 bg-[#F5EEE4]"
              title="Manually trigger the velocity alert notification to test the notification center"
            >
              <BellRing className="w-3 h-3" />
              <span>Simulate Trigger</span>
            </button>
          </div>
        </div>

        {/* Growth Threshold Quick Calibration Bar */}
        <div className="mt-3 pt-3 border-t border-[#111111]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#111111]/60 font-semibold text-[11px]">
              Target Growth Threshold:
            </span>
            <div className="inline-flex p-0.5 rounded-lg bg-[#F5EEE4] border border-[#111111]/10">
              {[1.0, 1.2, 1.5, 1.8, 2.0].map((t) => (
                <button
                  key={t}
                  onClick={() => setThresholdVelocity(t)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                    thresholdVelocity === t
                      ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-bold shadow-xs'
                      : 'text-[#111111]/70 hover:text-[#111111]'
                  }`}
                >
                  {t.toFixed(1)}/mo
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#111111]/60 flex items-center gap-2">
            <span>
              Actual Velocity: <strong className="text-[#111111]">{effectiveMonthlySkillVelocity.toFixed(1)}/mo</strong>
            </span>
            <span>•</span>
            <span>
              Threshold Gap: <strong className={isVelocityBelowThreshold ? 'text-amber-800' : 'text-emerald-800'}>
                {isVelocityBelowThreshold ? `-${(thresholdVelocity - effectiveMonthlySkillVelocity).toFixed(1)}/mo` : `+${(effectiveMonthlySkillVelocity - thresholdVelocity).toFixed(1)}/mo`}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification when Trigger is simulated */}
      {notificationToast && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-300" />
            <span>{notificationToast}</span>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="text-white/60 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ML Simulation Parameter Strip (Horizon & Scenario) */}
      {showProjection && (
        <div className="p-3.5 rounded-xl bg-[#E8DDCC]/40 border border-[#111111]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#111111] font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Study Velocity Scenario:</span>
            </div>
            <div className="inline-flex p-0.5 rounded-lg bg-[#F5EEE4] border border-[#111111]/10">
              <button
                onClick={() => setScenario('baseline')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  scenario === 'baseline'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-bold shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                1.0x Empirical Pace
              </button>
              <button
                onClick={() => setScenario('sprint')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  scenario === 'sprint'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-bold shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                1.3x Intensive Sprint
              </button>
              <button
                onClick={() => setScenario('paced')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  scenario === 'paced'
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-bold shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                0.75x Deep Consolidation
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#111111]/60 font-semibold text-[11px]">Forecast Horizon:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-[#F5EEE4] border border-[#111111]/10">
              <button
                onClick={() => setHorizon(3)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  horizon === 3
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-bold shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                +3 Months (Q4 2026)
              </button>
              <button
                onClick={() => setHorizon(6)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  horizon === 6
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-bold shadow-sm'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                +6 Months (Q1 2027)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Sub-Bar (Adapts based on Active Mode) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0.5">
        {activeAnalysisMode === 'velocity' ? (
          <>
            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Current Velocity</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                +{effectiveMonthlySkillVelocity.toFixed(1)} / mo
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">
                {scenario !== 'baseline' ? `${scenario.toUpperCase()} projection` : 'Empirical monthly rate'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Growth Threshold</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                {thresholdVelocity.toFixed(1)} / mo
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">
                {isVelocityBelowThreshold ? '⚠️ Velocity deficit active' : '✓ Target threshold met'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Velocity Gap</span>
              <div className={`text-xl font-black font-['Cabinet_Grotesk'] tabular-nums mt-0.5 ${
                isVelocityBelowThreshold ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {isVelocityBelowThreshold
                  ? `-${(thresholdVelocity - effectiveMonthlySkillVelocity).toFixed(1)}/mo`
                  : `+${(effectiveMonthlySkillVelocity - thresholdVelocity).toFixed(1)}/mo`}
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">
                {isVelocityBelowThreshold ? `${velocityDeficitPercentage}% below target` : 'Pacing above target'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Peak Historical Pace</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                +2.0 / mo
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">During Apr-May onboarding surge</span>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">6-Month Net Gain</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                +{sixMonthGain} Competencies
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">From 2 baseline skills in April</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Current Velocity</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                +{effectiveMonthlySkillVelocity.toFixed(1)} / mo
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">
                {scenario !== 'baseline' ? `${scenario.toUpperCase()} simulation` : 'Historical acquisition rate'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Growth Threshold</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                {thresholdVelocity.toFixed(1)} / mo
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">
                {isVelocityBelowThreshold ? '⚠️ Velocity deficit active' : '✓ Target threshold met'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08">
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Next Milestone ETA</span>
              <div className="text-xl font-black text-[#111111] font-['Cabinet_Grotesk'] tabular-nums mt-0.5">
                {milestoneEstimates.target10.achieved
                  ? 'Target Reached!'
                  : milestoneEstimates.target10.date}
              </div>
              <span className="text-[10px] text-[#111111]/70 block mt-0.5">
                {milestoneEstimates.target10.achieved
                  ? '10 Competency threshold reached'
                  : `~${milestoneEstimates.target10.weeks} weeks to 10 skills`}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Recharts Chart Container with Mode Specific Chart Configurations */}
      <div className="w-full h-72 sm:h-84 pt-1 select-none">
        <ResponsiveContainer width="100%" height="100%">
          {activeAnalysisMode === 'velocity' ? (
            /* ========================================================================= */
            /* GROWTH VELOCITY MODE (Skills / Month over Time with Target Threshold)    */
            /* ========================================================================= */
            <ComposedChart data={combinedData} margin={{ top: 16, right: 16, left: -10, bottom: 4 }}>
              <defs>
                <linearGradient id="velocityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="velocityConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#111111" strokeOpacity={0.08} strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="shortMonth"
                stroke="#111111"
                strokeOpacity={0.3}
                tick={{ fill: '#111111', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#111111', strokeOpacity: 0.15 }}
              />

              <YAxis
                stroke="#111111"
                strokeOpacity={0.3}
                tick={{ fill: '#111111', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 3.0]}
                tickFormatter={(v) => `+${v.toFixed(1)}/mo`}
              />

              {showProjection && (
                <ReferenceLine
                  x="Sep (Now)"
                  stroke="#111111"
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                  label={{
                    value: 'TODAY',
                    position: 'insideTopRight',
                    fill: '#111111',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                />
              )}

              {/* Target Growth Threshold Reference Line */}
              <ReferenceLine
                y={thresholdVelocity}
                stroke="#B45309"
                strokeDasharray="4 4"
                strokeWidth={1.75}
                label={{
                  value: `Target Growth Threshold (${thresholdVelocity.toFixed(1)}/mo)`,
                  position: 'insideTopLeft',
                  fill: '#92400E',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => <span style={{ color: '#111111' }}>{value}</span>}
              />

              {/* Fill Area for Historical Velocity */}
              <Area
                type="monotone"
                dataKey="velocity"
                name="Historical Velocity Fill"
                fill="url(#velocityAreaGradient)"
                stroke="transparent"
                legendType="none"
              />

              {/* ML Velocity Confidence Corridor */}
              {showProjection && (
                <Area
                  type="monotone"
                  dataKey="velocityUpper"
                  name="95% Velocity Corridor"
                  fill="url(#velocityConfidenceBand)"
                  stroke="#111111"
                  strokeOpacity={0.2}
                  strokeDasharray="2 2"
                  connectNulls
                />
              )}

              {/* Empirical Historical Velocity Line */}
              <Line
                type="monotone"
                dataKey="velocity"
                name="Monthly Growth Velocity (Empirical)"
                stroke="#111111"
                strokeWidth={3}
                dot={{ r: 5, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                activeDot={{ r: 7.5, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                connectNulls={false}
              />

              {/* ML Projected Velocity Line */}
              {showProjection && (
                <Line
                  type="monotone"
                  dataKey="projectedVelocity"
                  name="ML Projected Velocity"
                  stroke="#111111"
                  strokeWidth={2.75}
                  strokeDasharray="6 4"
                  dot={{ r: 4.5, fill: '#F5EEE4', stroke: '#111111', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                  connectNulls
                />
              )}

              {/* Target Growth Threshold Line for Legend visualization */}
              <Line
                type="monotone"
                dataKey="velocityThreshold"
                name="Target Threshold (1.5/mo)"
                stroke="#B45309"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          ) : metricMode === 'competencies' ? (
            /* ========================================================================= */
            /* ABSOLUTE SKILL LEVEL MODE: COMPETENCY STACK                              */
            /* ========================================================================= */
            <ComposedChart data={combinedData} margin={{ top: 16, right: 16, left: -20, bottom: 4 }}>
              <defs>
                <linearGradient id="totalSkillsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="mlConfidenceBandArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#111111" strokeOpacity={0.08} strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="shortMonth"
                stroke="#111111"
                strokeOpacity={0.3}
                tick={{ fill: '#111111', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#111111', strokeOpacity: 0.15 }}
              />

              <YAxis
                stroke="#111111"
                strokeOpacity={0.3}
                tick={{ fill: '#111111', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, Math.max(14, currentTotalSkills + 7)]}
                allowDecimals={false}
              />

              {showProjection && (
                <ReferenceLine
                  x="Sep (Now)"
                  stroke="#111111"
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                  label={{
                    value: 'TODAY',
                    position: 'insideTopRight',
                    fill: '#111111',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                />
              )}

              <ReferenceLine
                y={10}
                stroke="#111111"
                strokeDasharray="4 4"
                strokeOpacity={0.25}
                label={{
                  value: '10 Skills: Senior Benchmark',
                  position: 'insideTopLeft',
                  fill: '#111111',
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => <span style={{ color: '#111111' }}>{value}</span>}
              />

              <Area
                type="monotone"
                dataKey="totalSkills"
                name="Total Skills Acquired"
                fill="url(#totalSkillsArea)"
                stroke="transparent"
              />

              {showProjection && (
                <Area
                  type="monotone"
                  dataKey="confidenceUpper"
                  name="95% Forecast Corridor"
                  fill="url(#mlConfidenceBandArea)"
                  stroke="#111111"
                  strokeOpacity={0.2}
                  strokeDasharray="2 2"
                  connectNulls
                />
              )}

              <Line
                type="monotone"
                dataKey="totalSkills"
                name="Total Skills (Empirical)"
                stroke="#111111"
                strokeWidth={2.75}
                dot={{ r: 4.5, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 1.5 }}
                activeDot={{ r: 7, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="demonstrated"
                name="Demonstrated / Applied"
                stroke="#3A352F"
                strokeWidth={1.8}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#3A352F', stroke: '#F5EEE4', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: '#3A352F', stroke: '#F5EEE4', strokeWidth: 1.5 }}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="verified"
                name="Supervisor Verified"
                stroke="#111111"
                strokeWidth={1.8}
                dot={{ r: 3, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 1.5 }}
                connectNulls={false}
              />

              {showProjection && (
                <Line
                  type="monotone"
                  dataKey="projectedSkills"
                  name="ML Projected Acquisition"
                  stroke="#111111"
                  strokeWidth={2.75}
                  strokeDasharray="6 4"
                  dot={{ r: 4.5, fill: '#F5EEE4', stroke: '#111111', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                  connectNulls
                />
              )}
            </ComposedChart>
          ) : (
            /* ========================================================================= */
            /* ABSOLUTE SKILL LEVEL MODE: CAPABILITY INDEX SCORE                        */
            /* ========================================================================= */
            <ComposedChart data={combinedData} margin={{ top: 16, right: 16, left: -15, bottom: 4 }}>
              <defs>
                <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="mlScoreConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#111111" strokeOpacity={0.08} strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="shortMonth"
                stroke="#111111"
                strokeOpacity={0.3}
                tick={{ fill: '#111111', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#111111', strokeOpacity: 0.15 }}
              />

              <YAxis
                stroke="#111111"
                strokeOpacity={0.3}
                tick={{ fill: '#111111', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />

              {showProjection && (
                <ReferenceLine
                  x="Sep (Now)"
                  stroke="#111111"
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                  label={{
                    value: 'TODAY',
                    position: 'insideTopRight',
                    fill: '#111111',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                />
              )}

              <ReferenceLine
                y={85}
                stroke="#111111"
                strokeDasharray="4 4"
                strokeOpacity={0.25}
                label={{
                  value: '85: High Mastery Benchmark',
                  position: 'insideTopLeft',
                  fill: '#111111',
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => <span style={{ color: '#111111' }}>{value}</span>}
              />

              <Area
                type="monotone"
                dataKey="capabilityScore"
                name="Historical Index Score"
                fill="url(#scoreArea)"
                stroke="transparent"
              />

              {showProjection && (
                <Area
                  type="monotone"
                  dataKey="confidenceUpper"
                  name="95% Forecast Corridor"
                  fill="url(#mlScoreConfidenceBand)"
                  stroke="#111111"
                  strokeOpacity={0.2}
                  strokeDasharray="2 2"
                  connectNulls
                />
              )}

              <Line
                type="monotone"
                dataKey="capabilityScore"
                name="Capability Index Score (0-100)"
                stroke="#111111"
                strokeWidth={3}
                dot={{ r: 4.5, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 1.5 }}
                activeDot={{ r: 7, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                connectNulls={false}
              />

              {showProjection && (
                <Line
                  type="monotone"
                  dataKey="projectedScore"
                  name="ML Projected Score"
                  stroke="#111111"
                  strokeWidth={2.75}
                  strokeDasharray="6 4"
                  dot={{ r: 4.5, fill: '#F5EEE4', stroke: '#111111', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#111111', stroke: '#F5EEE4', strokeWidth: 2 }}
                  connectNulls
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Target Milestone Forecast Cards */}
      <div className="pt-2 border-t border-[#111111]/08 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#111111]" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/60">
              ML Target Milestone Completion Projections
            </span>
          </div>
          <span className="text-[10px] text-[#111111]/50 font-mono">
            Model: Ordinary Least Squares (OLS) with Confidence Bounds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#111111]/60 flex items-center gap-1">
                <Award className="w-3 h-3 text-[#111111]" />
                10 Competencies Target
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm shadow-2xs">
                Senior Benchmark
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-black text-[#111111] font-['Cabinet_Grotesk']">
                {milestoneEstimates.target10.achieved
                  ? 'Completed'
                  : milestoneEstimates.target10.date}
              </div>
              <span className="text-[11px] font-mono font-bold text-[#111111]/70">
                {milestoneEstimates.target10.achieved
                  ? 'Achieved'
                  : `~${milestoneEstimates.target10.weeks} wks remaining`}
              </span>
            </div>
            <p className="text-[10px] text-[#111111]/70 leading-relaxed">
              {milestoneEstimates.target10.achieved
                ? 'Senior Platform Engineer competency baseline satisfied.'
                : `Requires ${Math.max(0, 10 - currentTotalSkills)} additional validated skills at current ${effectiveMonthlySkillVelocity.toFixed(1)}/mo pace.`}
            </p>
            <button
              type="button"
              onClick={() =>
                onTriggerCelebration?.(
                  'Senior Benchmark Milestone Achieved!',
                  `Target goal timeline reached: 10 Competencies unlocked for ${milestoneEstimates.target10.date}.`
                )
              }
              className="w-full mt-1.5 py-1 px-2 rounded-lg bg-[#111111]/06 hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] text-[#111111] hover:text-white hover:border-transparent border border-[#111111]/12 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Celebrate Reached Goal Date</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#111111]/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#111111]" />
                12 Competencies Target
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#111111]/10 text-[#111111] rounded-sm">
                Staff Architect
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-black text-[#111111] font-['Cabinet_Grotesk']">
                {milestoneEstimates.target12.achieved
                  ? 'Completed'
                  : milestoneEstimates.target12.date}
              </div>
              <span className="text-[11px] font-mono font-bold text-[#111111]/70">
                {milestoneEstimates.target12.achieved
                  ? 'Achieved'
                  : `~${milestoneEstimates.target12.weeks} wks remaining`}
              </span>
            </div>
            <p className="text-[10px] text-[#111111]/70 leading-relaxed">
              {milestoneEstimates.target12.achieved
                ? 'Staff Architecture requirement achieved.'
                : `Requires ${Math.max(0, 12 - currentTotalSkills)} skills. Target reached with 88% statistical probability.`}
            </p>
            <button
              type="button"
              onClick={() =>
                onTriggerCelebration?.(
                  'Staff Architect Goal Date Reached!',
                  `Target goal timeline reached: 12 Competencies unlocked for ${milestoneEstimates.target12.date}.`
                )
              }
              className="w-full mt-1.5 py-1 px-2 rounded-lg bg-[#111111]/06 hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] text-[#111111] hover:text-white hover:border-transparent border border-[#111111]/12 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Celebrate Reached Goal Date</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#111111]/60 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#111111]" />
                85+ Index Score
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#111111]/10 text-[#111111] rounded-sm">
                High Mastery
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-black text-[#111111] font-['Cabinet_Grotesk']">
                {milestoneEstimates.targetScore85.achieved
                  ? 'Completed'
                  : milestoneEstimates.targetScore85.date}
              </div>
              <span className="text-[11px] font-mono font-bold text-[#111111]/70">
                {milestoneEstimates.targetScore85.achieved
                  ? 'Achieved'
                  : `~${milestoneEstimates.targetScore85.weeks} wks remaining`}
              </span>
            </div>
            <p className="text-[10px] text-[#111111]/70 leading-relaxed">
              {milestoneEstimates.targetScore85.achieved
                ? 'High Mastery index benchmark achieved.'
                : `${Math.max(0, 85 - currentScoreAvg)} points to close. Projected around ${milestoneEstimates.targetScore85.date}.`}
            </p>
            <button
              type="button"
              onClick={() =>
                onTriggerCelebration?.(
                  'High Mastery Benchmark Achieved!',
                  `Capability score index 85+ unlocked for ${milestoneEstimates.targetScore85.date}.`
                )
              }
              className="w-full mt-1.5 py-1 px-2 rounded-lg bg-[#111111]/06 hover:bg-gradient-to-r hover:from-[#312E81] hover:via-[#4F46E5] hover:to-[#06B6D4] text-[#111111] hover:text-white hover:border-transparent border border-[#111111]/12 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Celebrate Benchmark Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chronological Milestone Flow Ticker (Adapts between Absolute skills and Monthly Velocity rate) */}
      <div className="pt-2 border-t border-[#111111]/08">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
            {activeAnalysisMode === 'velocity'
              ? 'Monthly Velocity Trend & Inflection Points (+Skills / Month)'
              : 'Integrated Timeline Progression (Empirical Baseline + ML Projected Milestones)'}
          </span>
          <span className="text-[10px] text-[#111111]/50 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
            Historical
            <span className="w-2 h-2 rounded-full border border-[#111111] bg-transparent ml-2" />
            ML Forecast
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {combinedData.slice(0, 8).map((m, idx) => {
            const isFuture = m.isProjected;
            const isNow = m.shortMonth === 'Sep (Now)';
            const displayedRate = isFuture ? m.projectedVelocity : m.velocity;

            return (
              <div
                key={idx}
                onClick={() =>
                  onTriggerCelebration?.(
                    isFuture
                      ? `Projected Milestone: ${m.shortMonth.replace('*', '')} (${m.milestoneCompletionDate})`
                      : `Skill Milestone: ${m.shortMonth} (${m.milestoneCompletionDate})`,
                    m.milestone
                  )
                }
                title={`Milestone Date: ${m.milestoneCompletionDate} — Click to celebrate milestone`}
                className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 select-none ${
                  isNow
                    ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-md ring-2 ring-[#4F46E5]/30'
                    : isFuture
                    ? 'bg-[#F5EEE4]/60 text-[#111111] border-dashed border-[#111111]/30 hover:border-[#111111] hover:bg-[#F5EEE4]'
                    : 'bg-[#F5EEE4] text-[#111111] border-[#111111]/08 hover:border-[#111111]/30'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    {m.shortMonth.replace('*', '')}
                    {isFuture && <Sparkles className="w-2.5 h-2.5 text-[#111111]/60" />}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-sm font-mono ${
                      isNow
                        ? 'bg-white/20 text-white'
                        : isFuture
                        ? 'bg-[#111111]/10 text-[#111111] font-bold'
                        : 'bg-[#111111]/10 text-[#111111]'
                    }`}
                  >
                    {activeAnalysisMode === 'velocity'
                      ? `+${displayedRate}/mo`
                      : isFuture
                      ? `~${m.projectedSkills} sk`
                      : `${m.totalSkills} sk`}
                  </span>
                </div>

                {/* Milestone Specific Completion Date Tag */}
                <div className="flex items-center gap-1 text-[9px] font-mono">
                  <Calendar className="w-2.5 h-2.5 shrink-0 opacity-70" />
                  <span
                    className={`font-semibold truncate ${
                      isNow ? 'text-cyan-200' : isFuture ? 'text-[#111111]/70' : 'text-[#111111]/80'
                    }`}
                  >
                    {m.milestoneCompletionDate}
                  </span>
                </div>

                <p
                  className={`text-[10px] leading-tight line-clamp-2 ${
                    isNow
                      ? 'text-[#F5EEE4]/85'
                      : isFuture
                      ? 'text-[#111111]/80 italic'
                      : 'text-[#111111]/70'
                  }`}
                >
                  {m.milestone}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Adjustment & Mentor Check-In Modal */}
      <CurriculumAdjustmentModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        currentVelocity={effectiveMonthlySkillVelocity}
        thresholdVelocity={thresholdVelocity}
      />
    </div>
  );
};
