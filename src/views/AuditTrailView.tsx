import React, { useState } from 'react';
import { ShieldCheck, Clock, User, Filter, ArrowDownUp } from 'lucide-react';
import { DatabaseState } from '../services/dataStore';

interface AuditTrailViewProps {
  database: DatabaseState;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ database }) => {
  const { auditLogs } = database;
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action.toLowerCase().includes(filterAction.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50 block">
            REGULATORY IMMUTABLE LOG
          </span>
          <h2 className="text-2xl font-black text-[#111111] font-['Cabinet_Grotesk']">
            Security & Progression Audit Trail
          </h2>
          <p className="text-xs text-[#111111]/70 mt-1 max-w-xl">
            Cryptographic ledger tracking every capability assessment, lab demonstration, supervisor endorsement, and outcome milestone in the system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-mono font-bold bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white rounded-xl tabular-nums shadow-2xs">
            {auditLogs.length} Events Recorded
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-1.5 rounded-2xl virt-glass flex flex-wrap items-center gap-1">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'assessment', label: 'Assessments' },
          { id: 'challenge', label: 'Challenges' },
          { id: 'workplace', label: 'Workplace Practice' },
          { id: 'verification', label: 'Verifications' },
          { id: 'outcome', label: 'Outcomes' },
          { id: 'resume', label: 'Resume' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterAction(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filterAction === tab.id
                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-sm font-semibold'
                : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#DED0BD]/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl virt-surface border border-[#111111]/12 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#DED0BD]/70 border-b border-[#111111]/10 text-[#111111] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Event & Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Affected Entity</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/08">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5EEE4]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#111111]">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-[#111111]">
                    <span className="font-semibold">{log.actorName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#111111]/80">
                    {log.entityType} ({log.entityId ? log.entityId.slice(0, 10) : 'SYS'})
                  </td>
                  <td className="py-3.5 px-4 text-[#111111]/80 max-w-sm truncate">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[#111111]/60 tabular-nums">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
