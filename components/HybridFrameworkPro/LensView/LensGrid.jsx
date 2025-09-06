/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential. See /COPYRIGHT.txt.
 */

// components/HybridFrameworkPro/LensView/LensGrid.jsx
import React, { useMemo, useState, useEffect } from 'react';

export default function LensGrid({
  lanes = [],
  visibleLanes = {},
  moments = [],
  stages = [],
  onOpen,
  kpiKey,
  heatmapOn,
  kpiConfig,
}) {
  // Which lanes are visible (safe defaults)
  const vis = {
    experience: true,
    ai: true,
    behaviour: true,
    governance: true,
    ...(visibleLanes || {}),
  };

  // Stage helpers: letter + title maps
  const letterFor = (pos) => String.fromCharCode(65 + (pos % 26)); // 0->A
  const titleMap = useMemo(
    () => Object.fromEntries((stages || []).map(s => [s.key, s.title || s.label || s.key])),
    [stages]
  );
  const letterMap = useMemo(
    () => Object.fromEntries((stages || []).map((s, i) => {
      const pos = Number.isFinite(+s.order) && +s.order > 0 ? (+s.order - 1) : i;
      return [s.key, letterFor(pos)];
    })),
    [stages]
  );

  // Moments grouped by stageKey (order by column then title)
  const byStage = useMemo(() => {
    const out = Object.fromEntries((stages || []).map(s => [s.key, []]));
    for (const m of (moments || [])) {
      const k = m.stageKey || m.stage;
      (out[k] ||= []).push(m);
    }
    Object.keys(out).forEach(k => {
      out[k].sort((a, b) => (a.column || 1) - (b.column || 1) || String(a.title).localeCompare(String(b.title)));
    });
    return out;
  }, [stages, moments]);

  // Per-stage collapsed state (expanded by default)
  const [collapsed, setCollapsed] = useState(() =>
    Object.fromEntries((stages || []).map(s => [s.key, false]))
  );
  useEffect(() => {
    setCollapsed(prev => {
      const next = { ...prev };
      (stages || []).forEach(s => { if (!(s.key in next)) next[s.key] = false; });
      Object.keys(next).forEach(k => { if (!(stages || []).find(s => s.key === k)) delete next[k]; });
      return next;
    });
  }, [stages]);

  const toggleStage = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const heatOf = (m) => {
    if (!heatmapOn || !kpiKey) return 0;
    const v = Number(m?.metrics?.[kpiKey] ?? 0);
    return isFinite(v) ? Math.max(0, Math.min(100, v * 100)) : 0;
  };

  return (
    <div className="grid grid-cols-12 gap-6 mt-2">
      {lanes.map((ln) => {
        if (!ln?.key || !vis[ln.key]) return null;

        // Split stages into collapsed vs expanded for this lane’s section
        const collapsedStages = (stages || []).filter(s => collapsed[s.key]);
        const expandedStages  = (stages || []).filter(s => !collapsed[s.key]);

        return (
          <div key={ln.key} className="col-span-12">
            <div className={`rounded-2xl border ${ln.accent} p-4 md:p-5 bg-white/70 dark:bg-neutral-900/60 shadow-sm`}>
              <div className="flex items-baseline justify-between">
                <h2 className="uppercase tracking-widest text-xs md:text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">
                  {ln.label}
                </h2>
              </div>

              {/* ---------- Collapsed previews: ONE HORIZONTAL ROW ---------- */}
              {collapsedStages.length > 0 && (
                <div className="mt-4 overflow-x-auto -mx-1 px-1">
                  <div className="flex flex-nowrap gap-3 pb-1">
                    {collapsedStages.map((stage, i) => {
                      const stageKey    = stage.key;
                      const stageTitle  = titleMap[stageKey];
                      const stageLetter = letterMap[stageKey] || letterFor(i);
                      const count       = (byStage[stageKey] || []).length;
                      return (
                        <StageStackPreview
                          key={`${ln.key}-preview-${stageKey}`}
                          stageLetter={stageLetter}
                          stageTitle={stageTitle}
                          count={count}
                          onExpand={() => toggleStage(stageKey)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------- Expanded stages: each becomes its own strip below ---------- */}
              <div className={collapsedStages.length ? 'mt-6 space-y-6' : 'mt-4 space-y-6'}>
                {expandedStages.map((stage, idx) => {
                  const stageKey    = stage.key;
                  const stageTitle  = titleMap[stageKey];
                  const stageLetter = letterMap[stageKey];
                  const list        = byStage[stageKey] || [];

                  return (
                    <section key={`${ln.key}-${stageKey}`}>
                      {/* Stage row header with minimise */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
                            {stageLetter}
                          </span>
                          <h3 className="text-sm font-semibold">{stageTitle}</h3>
                        </div>
                        <button
                          onClick={() => toggleStage(stageKey)}
                          className="text-[10px] uppercase tracking-widest text-neutral-500 hover:underline"
                          title="Minimise"
                        >
                          Minimise
                        </button>
                      </div>

                      {/* Single-row moments strip */}
                      <div className="mt-3 overflow-x-auto -mx-1 px-1">
                        <div className="flex flex-nowrap gap-3">
                          {list.map((m) => (
                            <div key={`${ln.key}-${stageKey}-${m.id}`} className="w-[260px] shrink-0">
                              <MomentCard
                                moment={m}
                                stageLetter={stageLetter}
                                stageTitle={stageTitle}
                                onOpen={onOpen}
                                heat={heatOf(m)}
                              />
                            </div>
                          ))}
                          {!list.length && (
                            <div className="text-xs text-neutral-500 px-2 py-3">No moments in this stage.</div>
                          )}
                        </div>
                      </div>
                    </section>
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

/* ---------- Small presentational pieces ----------

Peek offset: change offsetPx (10 → 8/12).
Depth fade: tweak opacities = [0.8, 0.6, 0.4, 0.2].
Front card tone: nudge dark:bg-[#1a1e24] slightly up/down.
Border tone: adjust dark:border-[#2a2f36].

 */

// Replace ONLY StageStackPreview in components/HybridFrameworkPro/LensView/LensGrid.jsx
// Lens only
function StageStackPreview({ stageLetter, stageTitle, count, onExpand }) {
  // how many “ghost” layers we show behind the front summary card
  const ghosts = Math.min(4, Math.max(0, count - 1));
  const opacities = [0.8, 0.6, 0.4, 0.2]; // 2nd → 5th layers
  const offsetPx  = 5;                    // horizontal peek per layer (px)

  return (
    <button
      onClick={onExpand}
      className="relative block w-[260px] h-[130px] shrink-0 text-left"
      title="Expand stage"
    >
      {/* --- Ghost layers (FULL SIZE), same base bg as front, fade by opacity.
           They sit BEHIND the front frame (zIndex descending) and peek RIGHT. --- */}
      {Array.from({ length: ghosts }).map((_, i) => (
        <div
          key={i}
          className="
            absolute inset-0 rounded-xl
            border border-neutral-200 dark:border-[#2a2f36]
            bg-white dark:bg-[#1a1e24]
            pointer-events-none
          "
          style={{
            transform: `translateX(${(i + 1) * offsetPx}px)`,
            opacity: opacities[i] ?? 0.2, // 0.8 → 0.2
            zIndex: 10 - i,               // further back as i increases
          }}
          aria-hidden
        />
      ))}

      {/* --- Front frame (ON TOP): slightly lighter than active moment cards --- */}
      <div
        className="
          absolute inset-0 rounded-xl p-3 shadow-sm
          border border-neutral-200 dark:border-[#2a2f36]
          bg-white dark:bg-[#1a1e24]
        "
        style={{ zIndex: 50 }}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex h-5 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
            {stageLetter}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">
            {stageTitle}
          </span>
        </div>
        <h4 className="mt-2 font-semibold text-sm leading-tight line-clamp-2">{stageTitle}</h4>
        <p className="mt-1 text-xs text-neutral-500">
          {count} {count === 1 ? 'moment' : 'moments'}
        </p>
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-neutral-500">
          <span>Expand</span>
          <span>›</span>
        </div>
      </div>
    </button>
  );
}





function MomentCard({ moment, stageLetter, stageTitle, onOpen, heat = 0 }) {
  return (
    <div
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow transition cursor-pointer"
      onClick={() => onOpen?.(moment.id)}
      title={`${moment.title} — ${stageTitle}`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-5 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
            {stageLetter}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">
            {stageTitle}
          </span>
        </div>

        <h4 className="mt-2 font-semibold text-sm leading-tight">{moment.title}</h4>

        {moment.experience?.momentsOfTruth?.length ? (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {moment.experience.momentsOfTruth.join(' • ')}
          </p>
        ) : null}

        {heat > 0 && (
          <div className="mt-2 h-[6px] rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-neutral-700 dark:bg-neutral-200" style={{ width: `${heat}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
