import { Brain, Users, ShieldAlert, Gauge, Info } from 'lucide-react';

import { getNormalizedKpiValue } from '@/lib/kpi.js';

export default function JourneyCard({ moment, onOpen, kpiKey, heatmapOn, onDragStart, kpiConfig }) {
  const has = { experience: !!moment.experience, ai: !!moment.ai, behaviour: !!moment.behaviour, governance: !!moment.governance };
  const colStart = Math.min(12, Math.max(1, moment.column || 1));
  const v = heatmapOn ? getNormalizedKpiValue(moment, kpiKey, kpiConfig) : null;
  const tint = v==null ? '' :
    v > 0.75 ? 'ring-2 ring-emerald-500/70 bg-emerald-500/10' :
    v > 0.5  ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10' :
    v > 0.25 ? 'ring-2 ring-amber-400/60 bg-amber-400/10' :
               'ring-2 ring-rose-400/60 bg-rose-400/10';

  return (
    <div
      className={`col-span-2 min-h-[100px] rounded-xl border border-neutral-300/70 dark:border-neutral-700/70 bg-white dark:bg-neutral-950/70 hover:shadow transition group cursor-pointer ${tint}`}
      style={{ gridColumnStart: colStart }}
      onClick={() => onOpen(moment.id)}
      title={moment.title}
    >
      <div className="p-3">
        <div className="-mt-2 mb-1 flex justify-center opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing"
             onMouseDown={(e)=>{ e.stopPropagation(); onDragStart?.(e, moment); }}>
          <div className="h-1 w-12 rounded bg-neutral-300 dark:bg-neutral-700" title="Drag horizontally to reposition column" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">{moment.stage || moment.stageKey}</span>
          <div className="flex items-center gap-1 opacity-80">
            {has.ai && <Brain className="h-3.5 w-3.5" />}
            {has.experience && <Users className="h-3.5 w-3.5" />}
            {has.behaviour && <Gauge className="h-3.5 w-3.5" />}
            {has.governance && <ShieldAlert className="h-3.5 w-3.5" />}
          </div>
        </div>
        <h3 className="mt-1 font-semibold text-sm leading-tight">{moment.title}</h3>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{moment.description}</p>
        <div className="mt-2 text-[10px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 flex items-center gap-1">
          <Info className="h-3 w-3" /> Details
        </div>
      </div>
    </div>
  );
}
