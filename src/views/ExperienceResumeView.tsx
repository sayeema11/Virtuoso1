import React, { useState } from 'react';
import { FileText, Upload, Plus, Trash2, CheckCircle2, ShieldAlert, Briefcase } from 'lucide-react';
import { DatabaseState, dataStore } from '../services/dataStore';
import { ExperienceItem } from '../types';

interface ExperienceResumeViewProps {
  database: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenResumeUpload: () => void;
}

export const ExperienceResumeView: React.FC<ExperienceResumeViewProps> = ({
  database,
  onNavigate,
  onOpenResumeUpload,
}) => {
  const { experiences, resume } = database;
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !organization) return;

    dataStore.addExperience({
      jobTitle,
      organization,
      startDate,
      endDate: isCurrent ? undefined : endDate,
      isCurrent,
      description,
      associatedSkills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
      source: 'manual_entry',
      isConfirmed: true,
    });

    setJobTitle('');
    setOrganization('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setSkillsStr('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    dataStore.deleteExperience(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            EXPERIENCE & INTAKE LEDGER
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Work History & Resume Evidence
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Ingest and confirm career history and claimed skills. Only confirmed records enter the capability profile as Claimed evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="virt-btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Add Manual Experience'}</span>
          </button>
          <button
            onClick={onOpenResumeUpload}
            className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Technical CV</span>
          </button>
        </div>
      </div>

      {/* Distinction Policy Banner (Requirement 6) */}
      <div className="p-4 rounded-2xl virt-surface border border-[#111111]/12 flex items-start gap-3 text-xs text-[#111111]">
        <ShieldAlert className="w-5 h-5 text-[#111111] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-bold">Verified Evidence vs. Resume Evidence Policy</h4>
          <p className="text-[11px] text-[#111111]/80 leading-relaxed">
            Skills extracted from resumes or manually entered are marked as <strong>Resume Evidence (Claimed)</strong>. They establish your starting baseline, but must be proven through scenario assessments, practical lab demonstrations, or employer sign-offs before achieving <strong>Verified Mastery</strong>.
          </p>
        </div>
      </div>

      {/* Resume Document Status Card if present */}
      {resume && (
        <div className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                  Active Document Source
                </span>
                <h4 className="font-extrabold text-sm text-[#111111]">{resume.fileName}</h4>
              </div>
            </div>

            <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-sm uppercase shadow-2xs">
              {resume.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {resume.extractedSkills.map((sk, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded bg-[#DED0BD] text-[#111111] font-semibold border border-[#111111]/20"
              >
                {sk}
              </span>
            ))}
          </div>

          <div className="text-[11px] text-[#111111]/60 pt-2 border-t border-[#111111]/08 flex items-center justify-between">
            <span>Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}</span>
            <span>{resume.extractedExperiences.length} History entries extracted</span>
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      {showAddForm && (
        <form
          onSubmit={handleManualAdd}
          className="p-6 rounded-2xl virt-surface border border-[#111111]/15 space-y-4"
        >
          <h3 className="font-extrabold text-sm text-[#111111]">
            Add Verified Experience Item
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#111111]">Job / Role Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Junior DevOps Engineer"
                className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#111111]">Organization / Employer</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Cloud Solutions"
                className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#111111]">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#111111]">End Date</label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="accent-[#111111]"
                  />
                  <span className="text-[11px] text-[#111111]/70">Current Position</span>
                </label>
              </div>
              <input
                type="date"
                disabled={isCurrent}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] disabled:opacity-40 focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#111111]">Key Responsibilities & Deliverables</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail your operational responsibilities, systems tuned, and tools deployed..."
              className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#111111]">Associated Skills (comma-separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="Docker & Containerization, Linux System Internals, Kubernetes"
              className="w-full p-2.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="virt-btn-primary px-5 py-2 text-xs font-bold rounded-xl"
            >
              Save Experience Record
            </button>
          </div>
        </form>
      )}

      {/* Confirmed Experience Items List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-[#111111]">
          Confirmed Experience Records ({experiences.length})
        </h3>

        {experiences.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/60 border border-dashed border-[#111111]/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EEE4] border border-[#111111]/10 flex items-center justify-center mx-auto text-[#4F46E5]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#111111]">No Work Experience Records Added Yet</h4>
              <p className="text-xs text-[#111111]/70 max-w-md mx-auto">
                Upload your CV (PDF or DOCX) for automated skill extraction, or add your previous roles and technologies manually to establish your capability baseline.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={onOpenResumeUpload}
                className="virt-btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Technical CV</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="virt-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role Manually</span>
              </button>
            </div>
          </div>
        ) : (
          experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl virt-surface border border-[#111111]/12 space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">
                    {exp.organization} · {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                  <h4 className="font-extrabold text-base text-[#111111] mt-0.5">
                    {exp.jobTitle}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#DED0BD] text-[#111111] rounded-sm uppercase">
                    {exp.source.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 rounded-lg hover:bg-[#DED0BD] text-[#111111]/40 hover:text-[#111111] transition-colors"
                    title="Delete experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#111111]/85 leading-relaxed">
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#111111]/08">
                {exp.associatedSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] rounded bg-[#F5EEE4] text-[#111111] border border-[#111111]/15 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
