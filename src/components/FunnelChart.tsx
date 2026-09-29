import React from 'react';
import { motion } from 'motion/react';

interface FunnelStage {
  label: string;
  count: number;
  rate: number;
  description: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ stages }) => {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-3 select-none">
      {stages.map((stage, idx) => {
        const widthPercent = Math.max(15, Math.round((stage.count / maxCount) * 100));

        return (
          <div key={idx} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#111111] flex items-center gap-2">
                <span className="text-[10px] w-4 h-4 rounded-full bg-[#111111] text-[#F5EEE4] flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span>{stage.label}</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#111111]/60 hidden sm:inline">
                  {stage.description}
                </span>
                <span className="font-extrabold text-[#111111] tabular-nums font-mono">
                  {stage.count.toLocaleString()} learners
                </span>
                <span className="text-[11px] font-semibold text-[#111111]/80 tabular-nums w-12 text-right">
                  {stage.rate}%
                </span>
              </div>
            </div>

            {/* Funnel Bar Container */}
            <div className="h-7 w-full bg-[#DED0BD]/50 rounded-xl overflow-hidden p-0.5 border border-[#111111]/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-lg transition-colors flex items-center justify-end pr-2.5 ${
                  idx === 0
                    ? 'bg-[#111111] text-[#F5EEE4]'
                    : idx === 1
                    ? 'bg-[#24211D] text-[#F5EEE4]'
                    : idx === 2
                    ? 'bg-[#3A352F] text-[#F5EEE4]'
                    : idx === 3
                    ? 'bg-[#111111] text-[#F5EEE4]'
                    : idx === 4
                    ? 'bg-[#24211D] text-[#F5EEE4]'
                    : 'bg-[#111111] text-[#F5EEE4]'
                }`}
              >
                <span className="text-[10px] font-mono tabular-nums opacity-90">
                  {stage.count}
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
