import React from 'react';
import { UserSkillCapability, RoleRequirement } from '../types';
import { getScoreForLevel } from '../services/progressionEngine';

interface CapabilityRadarChartProps {
  capabilities: UserSkillCapability[];
  requirements: RoleRequirement[];
}

export const CapabilityRadarChart: React.FC<CapabilityRadarChartProps> = ({
  capabilities,
  requirements,
}) => {
  const size = 320;
  const center = size / 2;
  const radius = center - 45;

  const skillsList = requirements.slice(0, 7);
  const total = skillsList.length || 1;
  const angleStep = (Math.PI * 2) / total;

  // Grid circles for levels 1 to 5
  const levels = [1, 2, 3, 4, 5];

  // Helper for polar to cartesian
  const getCoordinates = (angle: number, value: number) => {
    const r = (value / 5) * radius;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return { x, y };
  };

  // Required Polygon Points
  const requiredPoints = skillsList
    .map((req, i) => {
      const angle = i * angleStep;
      const score = getScoreForLevel(req.requiredLevel);
      const { x, y } = getCoordinates(angle, score);
      return `${x},${y}`;
    })
    .join(' ');

  // Current Capability Polygon Points
  const currentPoints = skillsList
    .map((req, i) => {
      const angle = i * angleStep;
      const cap = capabilities.find((c) => c.skillId === req.skillId);
      const score = cap ? getScoreForLevel(cap.currentLevel) : 0;
      const { x, y } = getCoordinates(angle, score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Level Circles & Polygons */}
        {levels.map((lvl) => {
          const r = (lvl / 5) * radius;
          return (
            <circle
              key={lvl}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(17,17,17,0.12)"
              strokeDasharray={lvl < 5 ? '3 3' : 'none'}
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        {skillsList.map((_, i) => {
          const angle = i * angleStep;
          const { x, y } = getCoordinates(angle, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(17,17,17,0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Target Benchmark Polygon (Dashed Black Line) */}
        <polygon
          points={requiredPoints}
          fill="rgba(222,208,189,0.4)"
          stroke="#111111"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Current User Capability Polygon (Solid Black Fill & Line) */}
        <polygon
          points={currentPoints}
          fill="rgba(17,17,17,0.35)"
          stroke="#111111"
          strokeWidth="2"
        />

        {/* Points & Labels */}
        {skillsList.map((req, i) => {
          const angle = i * angleStep;
          const cap = capabilities.find((c) => c.skillId === req.skillId);
          const currentScore = cap ? getScoreForLevel(cap.currentLevel) : 0;
          const { x: curX, y: curY } = getCoordinates(angle, currentScore);
          const { x: labelX, y: labelY } = getCoordinates(angle, 5.8);

          return (
            <g key={i}>
              <circle cx={curX} cy={curY} r="3.5" fill="#111111" stroke="#F5EEE4" strokeWidth="1.5" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold fill-[#111111]"
              >
                {req.skillName.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend in pure Beige + Black */}
      <div className="flex items-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#111111] opacity-70" />
          <span className="font-semibold text-[#111111]">Current Verified Capability</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-[#111111] border-dashed rounded-sm bg-[#DED0BD]" />
          <span className="font-medium text-[#111111]/80">Target Role Requirement</span>
        </div>
      </div>
    </div>
  );
};
