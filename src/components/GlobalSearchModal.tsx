import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Award, Target, BookOpen, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  database,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  // Close on Escape, Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      category: string;
      subtitle: string;
      icon: React.ReactNode;
      targetTab: string;
    }> = [];

    // Search Skills
    database.skills.forEach((skill) => {
      if (skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q)) {
        results.push({
          id: `sk-${skill.id}`,
          title: skill.name,
          category: 'Skill',
          subtitle: skill.category,
          icon: <Award className="w-4 h-4" />,
          targetTab: 'capability',
        });
      }
    });

    // Search Roles
    database.roleRequirements.forEach((req) => {
      if (req.roleTitle.toLowerCase().includes(q) && !results.some((r) => r.title === req.roleTitle)) {
        results.push({
          id: `role-${req.id}`,
          title: req.roleTitle,
          category: 'Role Benchmark',
          subtitle: `Required level for ${req.skillName}: ${req.requiredLevel}`,
          icon: <Target className="w-4 h-4" />,
          targetTab: 'current-role',
        });
      }
    });

    // Search Evidence
    database.evidenceItems.forEach((ev) => {
      if (ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)) {
        results.push({
          id: `ev-${ev.id}`,
          title: ev.title,
          category: 'Evidence Item',
          subtitle: `${ev.skillName} · ${ev.evidenceStatus}`,
          icon: <ShieldCheck className="w-4 h-4" />,
          targetTab: 'evidence',
        });
      }
    });

    // Search Missions
    database.learningMissions.forEach((mission) => {
      if (mission.title.toLowerCase().includes(q) || mission.summary.toLowerCase().includes(q)) {
        results.push({
          id: `ms-${mission.id}`,
          title: mission.title,
          category: 'Learning Mission',
          subtitle: `${mission.skillName} · ${mission.durationMinutes} mins`,
          icon: <BookOpen className="w-4 h-4" />,
          targetTab: 'learning',
        });
      }
    });

    // Search Cohorts
    database.cohorts.forEach((cohort) => {
      if (cohort.name.toLowerCase().includes(q) || cohort.district.toLowerCase().includes(q)) {
        results.push({
          id: `coh-${cohort.id}`,
          title: cohort.name,
          category: 'Cohort',
          subtitle: `${cohort.providerName} · ${cohort.district}`,
          icon: <Users className="w-4 h-4" />,
          targetTab: 'cohorts',
        });
      }
    });

    // Search Outcomes
    database.outcomeFollowups.forEach((outcome) => {
      if (outcome.reflectionNotes?.toLowerCase().includes(q) || outcome.milestone.includes(q)) {
        results.push({
          id: `out-${outcome.id}`,
          title: `${outcome.milestone.replace('_', '-')} Review`,
          category: 'Career Outcome',
          subtitle: `Status: ${outcome.employmentStatus.replace(/_/g, ' ')}`,
          icon: <TrendingUp className="w-4 h-4" />,
          targetTab: 'outcomes',
        });
      }
    });

    return results.slice(0, 10);
  }, [query, database]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#111111]/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl virt-glass-strong rounded-2xl border border-[#111111]/20 shadow-2xl overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-[#111111]/12 bg-[#F1E9DD]/80">
            <Search className="w-4 h-4 text-[#111111]/60 mr-2.5" />
            <input
              type="text"
              autoFocus
              placeholder="Search skills, roles, evidence, learning missions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#111111] placeholder-[#111111]/40 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-[#111111]/50 hover:text-[#111111] mr-2"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#DED0BD] text-[#111111]/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {query.trim() === '' ? (
              <div className="px-4 py-8 text-center text-xs text-[#111111]/50">
                Type keywords to query live skills, benchmarks, evidence records, or training cohorts.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[#111111]/50">
                No matching records found for "{query}".
              </div>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onNavigate(result.targetTab);
                    onClose();
                  }}
                  className="w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-[#DED0BD]/90 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-[#F5EEE4] border border-[#111111]/10 text-[#111111] group-hover:bg-gradient-to-r group-hover:from-[#312E81] group-hover:via-[#4F46E5] group-hover:to-[#06B6D4] group-hover:text-white transition-colors">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#111111] truncate">
                        {result.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/40">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#111111]/70 truncate mt-0.5">
                      {result.subtitle}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-4 py-2 border-t border-[#111111]/10 bg-[#E8DDCC]/70 flex items-center justify-between text-[11px] text-[#111111]/60">
            <span>Live Relational Search</span>
            <span>ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
