import React from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../services/AuthContext';

interface TopBarProps {
  breadcrumbs: string[];
  currentUser: UserProfile;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onOpenOnboarding?: () => void;
  unreadCount: number;
  isAuthenticated?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  breadcrumbs,
  currentUser,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onOpenLogin,
  onOpenOnboarding,
  unreadCount,
  isAuthenticated = false,
}) => {
  const { signOutUser } = useAuth();
  return (
    <header className="sticky top-0 z-30 w-full mb-4 px-4 py-3 rounded-2xl virt-glass flex items-center justify-between transition-all select-none">
      {/* Zone 1: Single Wordmark / Title */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="text-base font-black tracking-tight text-[#111111] uppercase font-['Cabinet_Grotesk'] hover:opacity-80 transition-opacity"
        >
          VIRTUOSO
        </a>
        <span className="hidden sm:inline-block text-xs text-[#111111]/30">/</span>

        {/* Zone 2: Contextual Breadcrumb Trail (Zero pills, clean typography) */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-[#111111]/70 font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#111111]/30">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'text-[#111111] font-semibold' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Zone 3: Interactive Controls (Liquid Glass search, notifications, profile) */}
      <div className="flex items-center gap-2">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl bg-[#F1E9DD]/70 hover:bg-[#DED0BD]/90 border border-[#111111]/12 text-[#111111] transition-all active:scale-[0.97]"
          title="Search skills, evidence, cohorts (⌘K)"
        >
          <Search className="w-3.5 h-3.5 opacity-70" />
          <span className="hidden md:inline text-[11px] text-[#111111]/70">Search records...</span>
          <kbd className="hidden lg:inline-block px-1 py-0.2 text-[9px] font-mono bg-[#DED0BD] rounded border border-[#111111]/20">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-[#F1E9DD]/70 hover:bg-[#DED0BD]/90 border border-[#111111]/12 text-[#111111] transition-all active:scale-[0.97]"
          title="Notifications"
        >
          <Bell className="w-4 h-4 opacity-80" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4F46E5]" />
          )}
        </button>

        {/* Profile Setup / Persona Switch Button */}
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F1E9DD]/70 hover:bg-[#DED0BD]/90 border border-[#111111]/12 text-[#111111] transition-all cursor-pointer"
            title="Update Career Persona & Profile Setup"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[11px]">Profile Setup</span>
          </button>
        )}

        {/* User Profile / Auth Pill & Sign Out */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white hover:opacity-95 transition-all active:scale-[0.97] shadow-sm cursor-pointer"
              title="View Profile & Credentials"
            >
              <User className="w-3.5 h-3.5 opacity-90" />
              <span className="hidden sm:inline text-xs font-semibold truncate max-w-[120px]">
                {currentUser.fullName || 'My Account'}
              </span>
            </button>

            <button
              onClick={signOutUser}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F1E9DD]/80 hover:bg-red-500/15 border border-[#111111]/12 hover:border-red-500/30 text-[#111111] hover:text-red-800 transition-all text-xs font-bold cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5 text-red-700" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white hover:opacity-95 transition-all active:scale-[0.97] shadow-sm text-xs font-bold cursor-pointer"
            title="Sign in with Firebase or Google"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
