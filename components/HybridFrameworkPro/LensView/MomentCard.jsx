import { Info } from 'lucide-react';

const laneStyles = {
  experience: { border: 'border-emerald-300/60 dark:border-emerald-500/50', dot: 'bg-emerald-500' },
  ai:         { border: 'border-sky-300/60 dark:border-sky-500/50',         dot: 'bg-sky-500' },
  behaviour:  { border: 'border-amber-300/60 dark:border-amber-500/50',     dot: 'bg-amber-500' },
  governance: { border: 'border-rose-300/60 dark:border-rose-500/50',       dot: 'bg-rose-500' },
};

import { getNormalizedKpiValue } from '@/lib/kpi.js';

export default function MomentCard({ lane, moment, onOpen, kpiKey, heatmapOn, kpiConfig }) {
  const styles = laneStyles[lane] || laneStyles.experience;
  const colStart = Math.min(12, Math.max(1, moment.column || 1));

  const v = heatmapOn ? getNormalizedKpiValue(moment, kpiKey, kpiConfig) : null;
  const tint = v==null ? '' :
    v > 0.75 ? 'ring-2 ring-emerald-500/70 bg-emerald-500/10' :
    v > 0.5  ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10' :
    v > 0.25 ? 'ring-2 ring-amber-400/60 bg-amber-400/10' :
               'ring-2 ring-rose-400/60 bg-rose-400/10';

  const summary = (() => {
    if (lane === 'experience' && moment.experience?.momentsOfTruth) return moment.experience.momentsOfTruth.join(' • ');
    if (lane === 'ai' && moment.ai?.models) return moment.ai.models.join(', ');
    if (lane === 'behaviour' && moment.behaviour?.nudges) return moment.behaviour.nudges.join(', ');
    if (lane === 'governance' && moment.governance?.checks) return moment.governance.checks.join(', ');
    return moment.description || '';
  })();

  return (
    <div
      className={`col-span-2 min-h-[90px] rounded-xl border ${styles.border} bg-white dark:bg-neutral-950/70 hover:shadow transition group cursor-pointer ${tint}`}
      style={{ gridColumnStart: colStart }}
      onClick={() => onOpen(moment.id)}
      title={moment.title}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className={`h-2 w-2 rounded-full ${styles.dot}`} />
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">{moment.stage || moment.stageKey}</span>
        </div>
        <h3 className="mt-2 font-semibold text-sm leading-tight">{moment.title}</h3>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{summary}</p>
        <div className="mt-2 text-[10px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 flex items-center gap-1">
          <Info className="h-3 w-3" /> Details
        </div>
      </div>
    </div>
  );
}
