import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Search,
  Building2,
  ShieldCheck,
  Zap,
  MessageSquare,
  Clock,
  Star,
  BookOpen,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { InternalMentor, SkillGap } from '../types';

interface MentorSuggestionProps {
  database: DatabaseState;
  onNavigate?: (tabId: string) => void;
  onTriggerCelebration?: (title: string, subtitle?: string) => void;
}

interface MentorMatchResult {
  mentor: InternalMentor;
  matchScore: number;
  matchedGaps: SkillGap[];
  criticalGapsCount: number;
  highGapsCount: number;
  isInternalOrg: boolean;
}

export const MentorSuggestion: React.FC<MentorSuggestionProps> = ({
  database,
  onNavigate,
  onTriggerCelebration,
}) => {
  const { currentUser, internalMentors = [] } = database;

  // State
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'internal' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalMentor, setActiveModalMentor] = useState<InternalMentor | null>(null);
  const [activeProfileMentor, setActiveProfileMentor] = useState<InternalMentor | null>(null);
  const [requestedMentorIds, setRequestedMentorIds] = useState<Record<string, { date: string; gaps: string[] }>>({});

  // Scheduling Form State
  const [selectedGaps, setSelectedGaps] = useState<string[]>([]);
  const [meetingType, setMeetingType] = useState<string>('Skill Gap Diagnostic & 1:1 Guidance');
  const [requestedDate, setRequestedDate] = useState<string>('2026-10-02');
  const [meetingTime, setMeetingTime] = useState<string>('14:00');
  const [agendaNotes, setAgendaNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Retrieve user skill gaps
  const userGaps = useMemo(() => {
    return dataStore.getSkillGaps('all');
  }, [database.userCapabilities, database.roleRequirements]);

  // Compute deterministic mentor matches based on skill gaps & organizational expertise
  const mentorMatches = useMemo((): MentorMatchResult[] => {
    return internalMentors.map((mentor) => {
      // Find user gaps where mentor has expertise
      const matchedGaps = userGaps.filter((gap) => {
        const hasSkill = mentor.expertiseSkillIds.includes(gap.skillId);
        // Prioritize gaps that have a deficit or need workplace verification
        return hasSkill && (gap.gapDiff > 0 || gap.evidenceState !== 'Verified');
      });

      const criticalGapsCount = matchedGaps.filter((g) => g.severity === 'CRITICAL').length;
      const highGapsCount = matchedGaps.filter((g) => g.severity === 'HIGH').length;
      const mediumGapsCount = matchedGaps.filter((g) => g.severity === 'MEDIUM').length;

      // Base scoring
      let score = 65;
      score += criticalGapsCount * 14;
      score += highGapsCount * 9;
      score += mediumGapsCount * 4;

      // Organizational bonus: same employer
      const isInternalOrg = mentor.organizationId === currentUser.organizationId;
      if (isInternalOrg) score += 6;

      // Verification track record bonus
      if (mentor.verifiedSignOffsCount > 25) score += 3;

      // Normalize between 72% and 99%
      const matchScore = Math.min(99, Math.max(72, score));

      return {
        mentor,
        matchScore,
        matchedGaps,
        criticalGapsCount,
        highGapsCount,
        isInternalOrg,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [internalMentors, userGaps, currentUser.organizationId]);

  // Filtered results
  const filteredMatches = useMemo(() => {
    return mentorMatches.filter(({ mentor, matchedGaps, criticalGapsCount, isInternalOrg }) => {
      // Tab filter
      if (selectedFilter === 'critical' && criticalGapsCount === 0) return false;
      if (selectedFilter === 'internal' && !isInternalOrg) return false;
      if (selectedFilter === 'available' && mentor.availabilityStatus !== 'available') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = mentor.name.toLowerCase().includes(q);
        const matchesRole = mentor.roleTitle.toLowerCase().includes(q);
        const matchesDept = mentor.department.toLowerCase().includes(q);
        const matchesSkills = mentor.expertiseSkillNames.some((s) => s.toLowerCase().includes(q));
        const matchesGaps = matchedGaps.some((g) => g.skillName.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesDept && !matchesSkills && !matchesGaps) {
          return false;
        }
      }

      return true;
    });
  }, [mentorMatches, selectedFilter, searchQuery]);

  // Open booking modal
  const handleOpenBooking = (mentor: InternalMentor, defaultGaps: SkillGap[]) => {
    setActiveModalMentor(mentor);
    const initialSelectedGaps = defaultGaps.length > 0
      ? [defaultGaps[0].skillName]
      : mentor.expertiseSkillNames.slice(0, 1);
    setSelectedGaps(initialSelectedGaps);
    setMeetingType('Skill Gap Diagnostic & 1:1 Guidance');
    setRequestedDate('2026-10-02');
    setMeetingTime('14:00');
    setAgendaNotes(
      `Hi ${mentor.name.split(' ')[0]}, I'm currently working toward ${currentUser.targetJobTitle} and looking to address my skill gap in ${initialSelectedGaps.join(', ')}. I'd appreciate your guidance on workplace demonstration and architecture best practices.`
    );
  };

  // Submit booking
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalMentor) return;

    setIsSubmitting(true);
    setTimeout(() => {
      dataStore.scheduleMentorCheckIn(
        activeModalMentor.id,
        activeModalMentor.name,
        `${requestedDate} at ${meetingTime}`,
        selectedGaps,
        agendaNotes,
        meetingType
      );

      setRequestedMentorIds((prev) => ({
        ...prev,
        [activeModalMentor.id]: {
          date: `${requestedDate} (${meetingTime})`,
          gaps: selectedGaps,
        },
      }));

      setIsSubmitting(false);
      setBookingSuccess(`1:1 Mentorship request sent to ${activeModalMentor.name} for ${requestedDate}!`);

      if (onTriggerCelebration) {
        onTriggerCelebration(
          `Mentorship Requested: ${activeModalMentor.name}`,
          `1:1 Check-in proposed for ${requestedDate} to close gaps in ${selectedGaps.join(', ')}.`
        );
      }

      setTimeout(() => {
        setActiveModalMentor(null);
        setBookingSuccess(null);
      }, 1500);
    }, 400);
  };

  const handleToggleGap = (gapName: string) => {
    setSelectedGaps((prev) =>
      prev.includes(gapName) ? prev.filter((g) => g !== gapName) : [...prev, gapName]
    );
  };

  return (
    <div className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-5">
      {/* Component Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
              ORGANIZATIONAL EXPERTISE & MENTOR INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
              AI Skill-Gap Matching
            </span>
          </div>
          <h3 className="text-lg font-black text-[#111111] font-['Cabinet_Grotesk'] mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4F46E5]" />
            <span>Recommended Internal Mentors</span>
          </h3>
          <p className="text-xs text-[#111111]/70 mt-0.5 max-w-2xl">
            Internal leaders and senior architects at <strong>{currentUser.organizationName}</strong> matched directly to your active skill gaps and <strong>{currentUser.targetJobTitle}</strong> benchmarks.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#111111]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by mentor, skill, or department..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:border-[#4F46E5]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#111111]/50 hover:text-[#111111]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#111111]/08">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                : 'bg-[#F5EEE4] text-[#111111]/70 hover:text-[#111111] hover:bg-[#E8DDCC]'
            }`}
          >
            All Recommended ({mentorMatches.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('critical')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedFilter === 'critical'
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                : 'bg-[#F5EEE4] text-[#111111]/70 hover:text-[#111111] hover:bg-[#E8DDCC]'
            }`}
          >
            <span>Critical Gap Matches</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('internal')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedFilter === 'internal'
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                : 'bg-[#F5EEE4] text-[#111111]/70 hover:text-[#111111] hover:bg-[#E8DDCC]'
            }`}
          >
            Internal to Apex ({mentorMatches.filter((m) => m.isInternalOrg).length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('available')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedFilter === 'available'
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                : 'bg-[#F5EEE4] text-[#111111]/70 hover:text-[#111111] hover:bg-[#E8DDCC]'
            }`}
          >
            Open Mentee Slots
          </button>
        </div>

        <div className="text-[11px] text-[#111111]/60 font-medium">
          Showing {filteredMatches.length} matching internal advisor{filteredMatches.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map(({ mentor, matchScore, matchedGaps, criticalGapsCount, isInternalOrg }) => {
          const isRequested = !!requestedMentorIds[mentor.id];
          const requestInfo = requestedMentorIds[mentor.id];

          return (
            <div
              key={mentor.id}
              className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 flex flex-col justify-between hover:border-[#4F46E5]/40 transition-all hover:shadow-sm relative group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Initials Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-black text-sm flex items-center justify-center shadow-2xs">
                      {mentor.initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#111111] leading-tight">
                        {mentor.name}
                      </h4>
                      <p className="text-[11px] text-[#111111]/70 leading-snug line-clamp-1">
                        {mentor.roleTitle}
                      </p>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div
                    className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white text-[11px] font-black tracking-tight shadow-2xs flex items-center gap-1 shrink-0"
                    title={`Calculated based on overlapping skill gaps in ${matchedGaps.map((g) => g.skillName).join(', ')}`}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-200" />
                    <span>{matchScore}% Match</span>
                  </div>
                </div>

                {/* Organization & Department */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#E8DDCC] font-bold text-[#111111] flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5 text-[#111111]/60" />
                    {mentor.organizationName}
                  </span>
                  <span className="text-[#111111]/50">·</span>
                  <span className="text-[#111111]/70 font-medium">
                    {mentor.department}
                  </span>
                </div>

                {/* Gaps They Can Unblock */}
                <div className="mt-3 pt-2.5 border-t border-[#111111]/08 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#111111]/70 uppercase tracking-wider">
                      Can Unblock Your Gaps ({matchedGaps.length}):
                    </span>
                    {criticalGapsCount > 0 && (
                      <span className="text-rose-700 font-extrabold text-[9px]">
                        {criticalGapsCount} Critical Deficit{criticalGapsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {matchedGaps.slice(0, 3).map((gap) => (
                      <span
                        key={gap.id}
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm border ${
                          gap.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : gap.severity === 'HIGH'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                        title={`Target level: ${gap.requiredLevel} | Current level: ${gap.currentLevel}`}
                      >
                        {gap.skillName}
                      </span>
                    ))}
                    {matchedGaps.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-[#E8DDCC] text-[#111111]/70">
                        +{matchedGaps.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Track Record Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#111111]/70 bg-[#E8DDCC]/40 p-2 rounded-lg">
                  <div>
                    <span className="block font-bold text-[#111111] tabular-nums">
                      {mentor.verifiedSignOffsCount} Sign-Offs
                    </span>
                    <span className="text-[#111111]/60">Verified apprentice evidence</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#111111] tabular-nums flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      {mentor.rating} / 5.0
                    </span>
                    <span className="text-[#111111]/60">
                      {mentor.apprenticesGraduated} apprentices coached
                    </span>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="mt-2.5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        mentor.availabilityStatus === 'available'
                          ? 'bg-emerald-500 animate-pulse'
                          : mentor.availabilityStatus === 'limited'
                          ? 'bg-amber-500'
                          : 'bg-zinc-400'
                      }`}
                    />
                    <span className="font-semibold text-[#111111]/80 capitalize">
                      {mentor.availabilityStatus === 'available'
                        ? `Available (${mentor.maxMenteesCapacity - mentor.activeMenteesCount} slot left)`
                        : 'Limited Capacity'}
                    </span>
                  </div>
                  <span className="text-[#111111]/50 text-[9px] truncate max-w-[140px]" title={mentor.preferredCadence}>
                    {mentor.preferredCadence}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#111111]/08 flex items-center gap-2">
                {isRequested ? (
                  <div className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Requested for {requestInfo.date}</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(mentor, matchedGaps)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] hover:opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request 1:1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveProfileMentor(mentor)}
                      className="py-1.5 px-2.5 rounded-lg bg-[#E8DDCC] hover:bg-[#DED0BD] text-[#111111] text-xs font-semibold transition-all border border-[#111111]/10 hover:border-[#111111]/20 cursor-pointer"
                      title="Inspect mentor profile, verified skills, and past apprentice endorsements"
                    >
                      Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="p-8 text-center rounded-xl bg-[#F5EEE4] border border-dashed border-[#111111]/20 space-y-2">
          <Users className="w-8 h-8 text-[#111111]/40 mx-auto" />
          <h4 className="font-bold text-sm text-[#111111]">No matching mentors found</h4>
          <p className="text-xs text-[#111111]/60 max-w-sm mx-auto">
            Try adjusting your search query or reset the filter to view all available internal mentors.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter('all');
              setSearchQuery('');
            }}
            className="mt-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 1:1 Mentorship Scheduling Modal */}
      {activeModalMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#FAF5EE] border border-[#111111]/20 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#111111]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-black text-sm flex items-center justify-center shadow-2xs">
                  {activeModalMentor.initials}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
                    1:1 MENTORSHIP REQUEST
                  </span>
                  <h3 className="text-base font-extrabold text-[#111111] font-['Cabinet_Grotesk']">
                    Connect with {activeModalMentor.name}
                  </h3>
                  <span className="text-xs text-[#111111]/70">
                    {activeModalMentor.roleTitle} · {activeModalMentor.organizationName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalMentor(null)}
                className="text-[#111111]/50 hover:text-[#111111] p-1 rounded-lg hover:bg-[#111111]/05"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-[#111111]">
                  Invitation Dispatched!
                </h4>
                <p className="text-xs text-[#111111]/70 max-w-md mx-auto">
                  {bookingSuccess} A notification and calendar hold have been logged into your audit trail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
                {/* Priority Gap Focus Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1.5">
                    Target Skill Gap(s) to Focus On
                  </label>
                  <p className="text-[11px] text-[#111111]/60 mb-2">
                    Select the specific competency gaps you want to review or unblock with {activeModalMentor.name}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeModalMentor.expertiseSkillNames.map((skillName) => {
                      const isSelected = selectedGaps.includes(skillName);
                      const gap = userGaps.find((g) => g.skillName === skillName);
                      return (
                        <button
                          key={skillName}
                          type="button"
                          onClick={() => handleToggleGap(skillName)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-2xs'
                              : 'bg-[#F5EEE4] text-[#111111]/80 border-[#111111]/15 hover:border-[#111111]/30'
                          }`}
                        >
                          <span>{skillName}</span>
                          {gap && (
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : gap.severity === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {gap.severity}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Meeting Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Check-In Format & Objective
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Skill Gap Diagnostic & 1:1 Guidance">
                      1:1 Skill Gap Diagnostic & Guidance (30 min)
                    </option>
                    <option value="Workplace Evidence Review & Sign-Off">
                      Workplace Evidence Review & Employer Endorsement (45 min)
                    </option>
                    <option value="Architecture Pairing & Code Review">
                      Technical Architecture Pairing & Code Review (60 min)
                    </option>
                    <option value="Career Milestone & Progression Checkpoint">
                      Career Milestone & Progression Checkpoint (30 min)
                    </option>
                  </select>
                </div>

                {/* Date & Time Picker */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Proposed Date
                    </label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#4F46E5]"
                    >
                      <option value="09:30">09:30 AM (BST)</option>
                      <option value="11:00">11:00 AM (BST)</option>
                      <option value="14:00">02:00 PM (BST)</option>
                      <option value="15:30">03:30 PM (BST)</option>
                      <option value="16:30">04:30 PM (BST)</option>
                    </select>
                  </div>
                </div>

                {/* Personalized Agenda Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Agenda Notes & Context
                  </label>
                  <textarea
                    rows={3}
                    value={agendaNotes}
                    onChange={(e) => setAgendaNotes(e.target.value)}
                    placeholder="Briefly describe what you'd like to achieve during the session..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#4F46E5] placeholder:text-[#111111]/40"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-[#111111]/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveModalMentor(null)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#E8DDCC] hover:bg-[#DED0BD] text-[#111111] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || selectedGaps.length === 0}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] hover:opacity-95 text-white flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Send 1:1 Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mentor Profile Detail Modal */}
      {activeProfileMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#FAF5EE] border border-[#111111]/20 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#111111]/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white font-black text-base flex items-center justify-center shadow-2xs">
                  {activeProfileMentor.initials}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111111] font-['Cabinet_Grotesk']">
                    {activeProfileMentor.name}
                  </h3>
                  <p className="text-xs text-[#111111]/80 font-medium">
                    {activeProfileMentor.roleTitle}
                  </p>
                  <p className="text-[11px] text-[#111111]/60">
                    {activeProfileMentor.organizationName} · {activeProfileMentor.department}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveProfileMentor(null)}
                className="text-[#111111]/50 hover:text-[#111111] p-1 rounded-lg hover:bg-[#111111]/05"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                Background & Mentorship Philosophy
              </h4>
              <p className="text-xs text-[#111111]/80 leading-relaxed bg-[#F5EEE4] p-3 rounded-xl border border-[#111111]/10">
                {activeProfileMentor.bio}
              </p>
            </div>

            {/* Verified Skills & Specialties */}
            <div>
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Organizational Competencies & Specialties
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProfileMentor.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-[#E8DDCC] text-[#111111] border border-[#111111]/10"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Endorsement */}
            {activeProfileMentor.recentEndorsement && (
              <div>
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Recent Apprentice Sign-Off & Endorsement
                </h4>
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 italic flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span>"{activeProfileMentor.recentEndorsement}"</span>
                </div>
              </div>
            )}

            {/* Track Record Numerical Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                <span className="block font-black text-sm text-[#111111] tabular-nums">
                  {activeProfileMentor.yearsExperience} yrs
                </span>
                <span className="text-[10px] text-[#111111]/60">Experience</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                <span className="block font-black text-sm text-[#111111] tabular-nums">
                  {activeProfileMentor.verifiedSignOffsCount}
                </span>
                <span className="text-[10px] text-[#111111]/60">Sign-Offs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/10">
                <span className="block font-black text-sm text-[#111111] tabular-nums">
                  {activeProfileMentor.rating} / 5.0
                </span>
                <span className="text-[10px] text-[#111111]/60">Mentee Rating</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#111111]/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveProfileMentor(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#E8DDCC] hover:bg-[#DED0BD] text-[#111111] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const mentor = activeProfileMentor;
                  setActiveProfileMentor(null);
                  handleOpenBooking(mentor, userGaps.filter((g) => mentor.expertiseSkillIds.includes(g.skillId)));
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] hover:opacity-95 text-white flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule 1:1 Check-In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
