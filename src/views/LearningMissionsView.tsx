import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Play,
  CheckSquare,
  Clock,
  ArrowRight,
  FileText,
  Sparkles,
  ShieldAlert,
  Sliders,
  Filter,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { LearningMission } from '../types';

interface LearningMissionsViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenAssessment: (skillId: string, skillName: string) => void;
}

export const LearningMissionsView: React.FC<LearningMissionsViewProps> = ({
  database,
  onNavigate,
  onOpenAssessment,
}) => {
  const { learningMissions, learningProgress } = database;
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | '5' | '10' | '15' | '30' | '60'>('all');
  const [selectedMission, setSelectedMission] = useState<LearningMission>(learningMissions[0]);
  const [reflectionInput, setReflectionInput] = useState('');

  // Filter missions by selected available time
  const filteredMissions = learningMissions.filter((mission) => {
    if (selectedTimeFilter === 'all') return true;
    if (selectedTimeFilter === '5') return mission.durationMinutes <= 5;
    if (selectedTimeFilter === '10') return mission.durationMinutes > 5 && mission.durationMinutes <= 10;
    if (selectedTimeFilter === '15') return mission.durationMinutes > 10 && mission.durationMinutes <= 15;
    if (selectedTimeFilter === '30') return mission.durationMinutes > 15 && mission.durationMinutes <= 30;
    if (selectedTimeFilter === '60') return mission.durationMinutes > 30;
    return true;
  });

  const activeMission = filteredMissions.find((m) => m.id === selectedMission?.id) || filteredMissions[0] || learningMissions[0];
  const currentProgress = learningProgress.find((p) => p.missionId === activeMission?.id);
  const isCompleted = currentProgress?.status === 'completed';
  const isInProgress = currentProgress?.status === 'in_progress';

  const handleStart = () => {
    if (activeMission) {
      dataStore.startMission(activeMission.id);
    }
  };

  const handleComplete = () => {
    if (activeMission) {
      dataStore.completeMission(activeMission.id, reflectionInput, 90);
      setReflectionInput('');
    }
  };

  const timePills: Array<{ id: 'all' | '5' | '10' | '15' | '30' | '60'; label: string }> = [
    { id: 'all', label: 'All Available Times' },
    { id: '5', label: '⚡ 5 Mins' },
    { id: '10', label: '⏱ 10 Mins' },
    { id: '15', label: '⏱ 15 Mins' },
    { id: '30', label: '🎯 30 Mins' },
    { id: '60', label: '🚀 60+ Mins' },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            STAGE 7 · ADAPTIVE MICRO-LEARNING
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Targeted Technical Micro-Missions
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Modular learning adapting to your available time, diagnosed skill gaps, and weak areas. Concepts, code patterns, and production scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMission && (
            <button
              onClick={() => onOpenAssessment(activeMission.skillId, activeMission.skillName)}
              className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Launch Assessment (Stage 8)</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage 7 Educational Mastery Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-[#111111]">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-bold text-amber-950">Learning Completion vs. Verified Mastery Policy</h4>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            Completing a micro-learning unit builds conceptual understanding, but <strong>does not automatically confer verified skill mastery</strong>. To advance your capability profile, pass the objective diagnostic assessment (Stage 8) and submit practical challenge deliverables (Stage 9).
          </p>
        </div>
      </div>

      {/* Choose Available Time Selector (Flowchart Stage 7 Requirement) */}
      <div className="p-3 rounded-2xl virt-glass flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
          <Clock className="w-4 h-4 text-[#312E81]" />
          <span>Choose Available Time:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-[#DED0BD]/60 rounded-xl no-scrollbar">
          {timePills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedTimeFilter(pill.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedTimeFilter === pill.id
                  ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-xs'
                  : 'text-[#111111]/70 hover:text-[#111111] hover:bg-white/40'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Missions Navigator & Interactive Mission Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mission Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#111111]/50 tracking-wider block">
              Adaptive Curriculum ({filteredMissions.length})
            </span>
            <span className="text-[10px] font-semibold text-[#111111]/60 font-mono">
              Filter: {selectedTimeFilter === 'all' ? 'All Durations' : `${selectedTimeFilter}m`}
            </span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredMissions.map((mission) => {
              const prog = learningProgress.find((p) => p.missionId === mission.id);
              const isSelected = activeMission?.id === mission.id;
              const completed = prog?.status === 'completed';

              return (
                <button
                  key={mission.id}
                  onClick={() => setSelectedMission(mission)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-md'
                      : 'bg-[#F1E9DD] text-[#111111] border-[#111111]/12 hover:bg-[#DED0BD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold opacity-60">
                      {mission.skillName}
                    </span>
                    {completed ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#DED0BD] text-[#111111] rounded-sm">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-70 tabular-nums">
                        {mission.durationMinutes}m
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-xs mt-1 leading-snug">
                    {mission.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-current/15 text-[10px] opacity-75">
                    <span>{mission.difficulty}</span>
                    <span>Target: {mission.targetCapabilityLevel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Mission Canvas (8 Cols) */}
        {activeMission && (
          <div className="lg:col-span-8 space-y-5">
            <div className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-5">
              {/* Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#111111]/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 tracking-wider block">
                    Active Mission Unit · {activeMission.durationMinutes} Minutes
                  </span>
                  <h3 className="text-lg font-black text-[#111111] font-['Cabinet_Grotesk']">
                    {activeMission.title}
                  </h3>
                  <span className="text-xs text-[#111111]/70">
                    Competency: <strong>{activeMission.skillName}</strong> · {activeMission.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-xs font-bold rounded-sm shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MISSION COMPLETED</span>
                    </span>
                  ) : isInProgress ? (
                    <button
                      onClick={handleComplete}
                      className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Mark Mission Completed
                    </button>
                  ) : (
                    <button
                      onClick={handleStart}
                      className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Mission</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mission Summary */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]/50 block">
                  Mission Objective
                </span>
                <p className="text-xs text-[#111111] leading-relaxed">
                  {activeMission.summary}
                </p>
              </div>

              {/* Key Architectural Concepts */}
              <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 space-y-2">
                <span className="text-xs font-bold text-[#111111] block">
                  Key Concepts & Principles
                </span>
                <ul className="text-xs text-[#111111]/85 space-y-1.5 list-disc pl-4">
                  {activeMission.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="leading-snug">{concept}</li>
                  ))}
                </ul>
              </div>

              {/* Practical Scenario Demonstration */}
              <div className="p-4 rounded-xl bg-[#DED0BD]/60 border border-[#111111]/15 space-y-2">
                <span className="text-xs font-bold text-[#111111] block">
                  Production Outage & Diagnostic Scenario
                </span>
                <p className="text-xs text-[#111111] leading-relaxed">
                  {activeMission.practicalScenario}
                </p>
              </div>

              {/* Reflection & Learning Log Form */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111111] block">
                    Engineering Reflection Prompt:
                  </label>
                  <p className="text-xs text-[#111111]/70 italic">
                    "{activeMission.reflectionPrompt}"
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Record your architectural takeaways, trade-offs, and practical lessons learned..."
                  className="w-full p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#111111]/50">
                    Reflection logs are stored in your lifelong learning ledger.
                  </span>

                  <button
                    onClick={handleComplete}
                    className="virt-btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save Reflection & Finish Unit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
