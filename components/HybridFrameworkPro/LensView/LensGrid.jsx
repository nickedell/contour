// components/HybridFrameworkPro/LensView/LensGrid.jsx
import React from 'react';

export default function LensGrid({
  lanes = [],
  visibleLanes = {},
  moments = [],
  stages = [],          // make sure your page passes this in
  onOpen,
  kpiKey,
  heatmapOn,
  kpiConfig,
}) {
  // Visibility with safe defaults
  const vis = {
    experience: true,
    ai: true,
    behaviour: true,
    governance: true,
    ...(visibleLanes || {}),
  };

  // Map stage key -> title and letter (A/B/C/… based on order or index)
  const letterFor = (pos) => String.fromCharCode(65 + (pos % 26)); // 0->A
  const titleMap  = Object.fromEntries((stages || []).map((s) => [s.key, s.title || s.label || s.key]));
  const letterMap = Object.fromEntries(
    (stages || []).map((s, i) => {
      const pos = Number.isFinite(+s.order) && +s.order > 0 ? (+s.order - 1) : i;
      return [s.key, letterFor(pos)];
    })
  );

  return (
    <div className="grid grid-cols-12 gap-6 mt-2">
      {lanes.map((ln) => {
        if (!ln?.key || !vis[ln.key]) return null;

        return (
          <div key={ln.key} className="col-span-12">
            <div className={`rounded-2xl border ${ln.accent} p-4 md:p-5 bg-white/70 dark:bg-neutral-900/60 shadow-sm`}>
              <div className="flex items-baseline justify-between">
                <h2 className="uppercase tracking-widest text-xs md:text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">
                  {ln.label}
                </h2>
              </div>

              <div className="grid grid-cols-12 gap-6 mt-4">
                {(moments || []).map((m) => {
                  if (!m || typeof m !== 'object') return null;

                  const colStart   = Math.min(12, Math.max(1, Number(m.column) || 1));
                  const stageKey   = m.stageKey || m.stage;
                  const stageTitle = titleMap[stageKey]  || (typeof m.stage === 'string' ? m.stage : stageKey);
                  const stageLetter= letterMap[stageKey] || '•';

                  const heat = getHeat(m, kpiKey, kpiConfig, heatmapOn);

                  return (
                    <div key={`${ln.key}-${m.id || Math.random()}`} className="col-span-2" style={{ gridColumnStart: colStart }}>
                      <div
                        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow transition cursor-pointer"
                        onClick={() => onOpen?.(m.id)}
                        title={`${m.title} — ${stageTitle}`}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            {/* LEFT: column letter lozenge */}
                            <span className="inline-flex h-5 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
                              {stageLetter}
                            </span>
                            {/* RIGHT: section title (small caps) */}
                            <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                              {stageTitle}
                            </span>
                          </div>

                          <h4 className="mt-2 font-semibold text-sm leading-tight">{m.title}</h4>

                          {m.experience?.momentsOfTruth?.length ? (
                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {m.experience.momentsOfTruth.join(' • ')}
                            </p>
                          ) : null}

                          {heat > 0 && (
                            <div className="mt-2 h-[6px] rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                              <div className="h-full bg-neutral-700 dark:bg-neutral-200" style={{ width: `${Math.min(100, heat)}%` }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getHeat(moment, kpiKey, kpiConfig, heatmapOn) {
  if (!heatmapOn || !kpiKey) return 0;
  const val = Number(moment?.metrics?.[kpiKey] ?? 0);
  return isFinite(val) ? val * 100 : 0;
}
