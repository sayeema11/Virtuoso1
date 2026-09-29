import React, { useState } from 'react';
import { User, Building2, Target, CheckCircle2, ShieldCheck, Mail, MapPin, LogOut } from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { UserRole } from '../types';
import { useAuth } from '../services/AuthContext';

interface ProfileViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ database, onNavigate }) => {
  const { signOutUser } = useAuth();
  const { currentUser } = database;
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [currentJobTitle, setCurrentJobTitle] = useState(currentUser.currentJobTitle);
  const [targetJobTitle, setTargetJobTitle] = useState(currentUser.targetJobTitle);
  const [district, setDistrict] = useState(currentUser.district);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateProfile({
      fullName,
      email,
      currentJobTitle,
      targetJobTitle,
      district,
      bio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            IDENTITY & GOVERNANCE
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            User Persona & Career Credentials
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Manage your personal profile, authenticated organization affiliation, active career objectives, and consent registry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card Preview */}
        <div className="p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-4 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center font-extrabold text-2xl font-['Cabinet_Grotesk'] shadow-md">
            {currentUser.fullName ? currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) : <User className="w-8 h-8" />}
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-[#111111] font-['Cabinet_Grotesk']">
              {currentUser.fullName || 'New Member'}
            </h3>
            <span className="text-xs text-[#111111]/70 block mt-0.5">
              {currentUser.currentJobTitle || 'Role not specified'}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-[#111111]/10 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#111111]/80">
              <Mail className="w-3.5 h-3.5 opacity-60" />
              <span>{currentUser.email || 'No email registered'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#111111]/80">
              <Building2 className="w-3.5 h-3.5 opacity-60" />
              <span>{currentUser.organizationName || 'Independent Learner'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#111111]/80">
              <MapPin className="w-3.5 h-3.5 opacity-60" />
              <span>{currentUser.district || 'Not specified'}</span>
            </div>
          </div>

          <div className="w-full p-3 rounded-xl bg-[#DED0BD]/60 border border-[#111111]/12 text-xs text-left space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Target Career Goal</span>
            <span className="font-extrabold text-[#111111] block">{currentUser.targetJobTitle}</span>
          </div>

          <div className="w-full pt-2">
            <div className="p-3 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 text-xs text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GDPR Consent Verified</span>
              </div>
              <p className="text-[11px] text-[#111111]/70">
                Authorized encrypted skill and verification exchange with accredited training providers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl virt-surface border border-[#111111]/12 space-y-4">
          <h3 className="font-extrabold text-sm text-[#111111]">
            Edit Identity & Progression Goals
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Primary Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Current Position / Job Title</label>
                <input
                  type="text"
                  required
                  value={currentJobTitle}
                  onChange={(e) => setCurrentJobTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111111]">Target Career Goal / Job Title</label>
                <input
                  type="text"
                  required
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#111111]">Economic District / Region</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#111111]">Professional Bio / Specialization Focus</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111] leading-relaxed"
                />
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-[#DED0BD] border border-[#111111]/20 flex items-center gap-2 text-xs font-bold text-[#111111]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile and Target Role updated. Pathway recalculated!</span>
              </div>
            )}

              <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-[#111111]/10">
                <button
                  type="button"
                  onClick={signOutUser}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-900 border border-red-500/25 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-700" />
                  <span>Sign Out of Session</span>
                </button>
                <button
                  type="submit"
                  className="virt-btn-primary px-6 py-2.5 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
};
