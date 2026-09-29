import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: DatabaseState;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  database,
}) => {
  const [reportType, setReportType] = useState<'capabilities' | 'evidence' | 'funnel' | 'outcomes'>('capabilities');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    let csvContent = '';

    if (reportType === 'capabilities') {
      csvContent = 'Skill Name,Category,Current Level,Confidence Score,Evidence Status,Verified\n';
      database.userCapabilities.forEach((c) => {
        csvContent += `"${c.skillName}","${c.category}","${c.currentLevel}",${c.confidenceScore},"${c.evidenceStatus}",${c.isVerified}\n`;
      });
    } else if (reportType === 'evidence') {
      csvContent = 'Skill Name,Evidence Type,Evidence Status,Title,Date,Verified By\n';
      database.evidenceItems.forEach((e) => {
        csvContent += `"${e.skillName}","${e.evidenceType}","${e.evidenceStatus}","${e.title}","${e.createdDate}","${e.verifiedBy || 'Pending'}"\n`;
      });
    } else if (reportType === 'outcomes') {
      csvContent = 'Learner,Milestone,Status,Employment Status,Wage Progression %,Due Date\n';
      database.outcomeFollowups.forEach((o) => {
        csvContent += `"${o.userName}","${o.milestone}","${o.status}","${o.employmentStatus}",${o.wageProgressionPercentage || 0},"${o.dueDate}"\n`;
      });
    } else {
      csvContent = 'Cohort Name,Programme,Provider,Enrolled,Completed,Assessed,Demonstrated,Applied,Outcomes Verified\n';
      database.cohorts.forEach((c) => {
        csvContent += `"${c.name}","${c.programmeName}","${c.providerName}",${c.enrolledLearners},${c.completedLearners},${c.assessedLearners},${c.demonstratedLearners},${c.appliedLearners},${c.outcomesVerified}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `virtuoso_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg virt-glass-strong rounded-2xl border border-[#111111]/18 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                  Data Governance & Reporting
                </span>
                <h3 className="font-extrabold text-base text-[#111111]">
                  Export Live Platform Data
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#DED0BD] text-[#111111]/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">Select Dataset</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'capabilities', label: 'Capability Profile', count: database.userCapabilities.length },
                  { id: 'evidence', label: 'Evidence Wallet', count: database.evidenceItems.length },
                  { id: 'outcomes', label: 'Career Outcomes', count: database.outcomeFollowups.length },
                  { id: 'funnel', label: 'Cohort Progression', count: database.cohorts.length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setReportType(item.id as any)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      reportType === item.id
                        ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent font-semibold shadow-xs'
                        : 'bg-[#F5EEE4] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5 tabular-nums">
                      {item.count} records available
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5EEE4] border border-[#111111]/10 text-xs text-[#111111] space-y-1">
              <div className="font-bold">Export Format Standards</div>
              <p className="text-[11px] text-[#111111]/75 leading-relaxed">
                Exports reflect actual records currently persisted in VIRTUOSO. Real-time updates and verifications are immediately included.
              </p>
            </div>

            {downloadSuccess && (
              <div className="p-3 rounded-xl bg-[#DED0BD] border border-[#111111]/20 flex items-center gap-2 text-xs font-bold text-[#111111]">
                <CheckCircle2 className="w-4 h-4" />
                <span>CSV file generated and downloaded successfully!</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF View</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
