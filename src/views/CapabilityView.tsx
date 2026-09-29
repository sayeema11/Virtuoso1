import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckSquare,
  Briefcase,
  Plus,
  Filter,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { CapabilityBadge } from '../components/CapabilityBadge';
import { EvidenceStatusBadge } from '../components/EvidenceStatusBadge';
import { CapabilityRadarChart } from '../components/CapabilityRadarChart';
import { CapabilityLevel } from '../types';
import { aiService } from '../services/aiService';

interface CapabilityViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
  onOpenWorkplace: (skillId?: string) => void;
}

export const CapabilityView: React.FC<CapabilityViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
  onOpenWorkplace,
}) => {
  const { userCapabilities, roleRequirements, currentUser, experiences } = database;
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const targetReqs = roleRequirements.filter((r) => r.roleTitle === currentUser.targetJobTitle);

  // Filter skills
  const filteredCapabilities = userCapabilities.filter((cap) => {
    const matchesCat = filterCategory === 'all' || cap.category === filterCategory;
    const matchesQuery = cap.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const categories = ['all', 'Cloud & Infrastructure', 'Software Engineering', 'Security & Compliance', 'Data & Analytics', 'Professional & Leadership'];

  const handleRunAiAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const confirmedSkills = experiences.flatMap((e) => e.associatedSkills);
      const res = await aiService.analyzeCapabilitiesFromExperience(experiences, confirmedSkills);

      if (res.data) {
        setAiAnalysisResult(res.data);

        // Update capability notes and levels in dataStore
        res.data.analyzedSkills.forEach((as) => {
          const existing = userCapabilities.find((c) => c.skillName.toLowerCase() === as.skillName.toLowerCase());
          if (existing) {
            dataStore.updateUserCapabilityLevel(
              existing.skillId,
              as.inferredLevel,
              existing.evidenceStatus,
              as.confidence
            );
          }
        });

        dataStore.addNotification({
          title: 'AI Capability Analysis Completed',
          message: `Extracted ${res.data.extractedDomains.length} technical domains and analyzed ${res.data.analyzedSkills.length} capability levels from confirmed work history.`,
          type: 'system',
        });
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            SKILLS & CAPABILITIES MATRIX
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Validated Capability Profile
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-2xl">
            Derived from confirmed experience intake and objective evidence. Supported capability levels: <strong>No Evidence · Limited · Developing · Proficient · Strong · Advanced</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {experiences.length > 0 && (
            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="virt-btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#312E81] ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Experience...' : 'Run AI Capability Extraction'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('skill-gaps')}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Skill Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Analysis Summary Banner if Triggered */}
      {aiAnalysisResult && (
        <div className="p-5 rounded-3xl bg-white border-2 border-[#4F46E5]/30 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-[#111111]/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              <h3 className="font-extrabold text-sm text-[#111111]">
                AI Experience Extraction & Capability Reasoning
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Analysis Active
            </span>
          </div>

          <p className="text-xs text-[#111111]/85 leading-relaxed">
            {aiAnalysisResult.summaryAssessment}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {aiAnalysisResult.analyzedSkills.map((as: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/08 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111]">{as.skillName}</span>
                  <CapabilityBadge level={as.inferredLevel} />
                </div>
                <p className="text-[11px] text-[#111111]/70 leading-snug">{as.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Alignment Radar & Benchmark Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-5 rounded-2xl virt-surface border border-[#111111]/12 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#111111]">
              Capability Polygon vs Target Role
            </span>
            <span className="text-[10px] uppercase font-bold text-[#111111]/50">
              {currentUser.targetJobTitle}
            </span>
          </div>
          <CapabilityRadarChart
            capabilities={userCapabilities}
            requirements={targetReqs}
          />
        </div>

        <div className="lg:col-span-2 p-5 rounded-2xl virt-surface border border-[#111111]/12 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#111111]">
                Competency Progression Philosophy
              </h3>
              <span className="text-xs text-[#111111]/60 font-mono">SFIA Aligned Framework</span>
            </div>

            <p className="text-xs text-[#111111]/80 leading-relaxed">
              In VIRTUOSO, capability is never assigned arbitrarily or assumed from attendance. A skill begins as an unverified resume claim, progresses through rigorous diagnostic knowledge assessment, transforms into demonstration evidence via practical deployment labs, and achieves permanence through employer-verified workplace execution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                <span className="text-[10px] font-bold text-[#111111]/60 uppercase block">1. Diagnostic Exam</span>
                <span className="text-xs font-bold text-[#111111] mt-0.5 block">Theoretical & Scenario</span>
                <p className="text-[11px] text-[#111111]/70 mt-1">Diagnostic exam verifying concepts and architectural judgment.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                <span className="text-[10px] font-bold text-[#111111]/60 uppercase block">2. Practical Challenge</span>
                <span className="text-xs font-bold text-[#111111] mt-0.5 block">Hands-on Sandbox Lab</span>
                <p className="text-[11px] text-[#111111]/70 mt-1">Direct manifest, script, and codebase evaluation.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                <span className="text-[10px] font-bold text-[#111111]/60 uppercase block">3. Workplace Endorsement</span>
                <span className="text-xs font-bold text-[#111111] mt-0.5 block">Employer Verification</span>
                <p className="text-[11px] text-[#111111]/70 mt-1">Supervisor validates real problem solved in production.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#111111]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#111111]/70">
            <span>Verified Skills: <strong>{userCapabilities.filter((c) => c.isVerified).length}</strong></span>
            <span>Assessed Skills: <strong>{userCapabilities.filter((c) => c.evidenceStatus === 'Assessed' || c.evidenceStatus === 'Demonstrated').length}</strong></span>
            <span>Resume Claims: <strong>{userCapabilities.filter((c) => c.evidenceStatus === 'Claimed').length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl virt-glass flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-[#DED0BD]/60 rounded-xl no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-xs'
                  : 'text-[#111111]/70 hover:text-[#111111]'
              }`}
            >
              {cat === 'all' ? 'All Competencies' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Capability Records Table with Explainability */}
      <div className="rounded-2xl virt-surface border border-[#111111]/12 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#DED0BD]/70 border-b border-[#111111]/10 text-[#111111] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Competency & Domain</th>
                <th className="py-3 px-4">Current Verified Level</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Why Level Exists</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/08">
              {filteredCapabilities.map((cap) => {
                const isExpanded = expandedSkillId === cap.id;

                return (
                  <React.Fragment key={cap.id}>
                    <tr className="hover:bg-[#F5EEE4]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#111111] block text-xs">
                          {cap.skillName}
                        </span>
                        <span className="text-[11px] text-[#111111]/60">
                          {cap.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <CapabilityBadge level={cap.currentLevel} showScore />
                      </td>

                      <td className="py-3.5 px-4">
                        <EvidenceStatusBadge status={cap.evidenceStatus} showStepNumber />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#DED0BD] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4]"
                              style={{ width: `${cap.confidenceScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] tabular-nums text-[#111111]">
                            {cap.confidenceScore}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setExpandedSkillId(isExpanded ? null : cap.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide reason' : 'View AI rationale'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAssessment(cap.skillId, cap.skillName)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white hover:opacity-90 transition-all shadow-2xs cursor-pointer"
                          >
                            Assess
                          </button>
                          <button
                            onClick={() => onOpenWorkplace(cap.skillId)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#DED0BD] text-[#111111] hover:bg-[#DED0BD]/90 border border-[#111111]/15 transition-all cursor-pointer"
                          >
                            Log Work
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#E8DDCC]/40">
                        <td colSpan={6} className="px-5 py-3 border-t border-[#111111]/08">
                          <div className="flex items-start gap-2 text-xs text-[#111111]/85">
                            <Sparkles className="w-4 h-4 text-[#312E81] shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-[#111111]">Capability Level Explanation:</strong>{' '}
                              {cap.notes ||
                                `Derived from ${cap.evidenceStatus} evidence in ${cap.skillName}. Confidence level computed mathematically from assessment scores (${cap.confidenceScore}%) and confirmed workplace entries.`}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
