/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential. See /COPYRIGHT.txt.
 */

// components/HybridFrameworkPro/JourneyView/JourneyTrack.jsx

/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential. See /COPYRIGHT.txt.
 */



import React, { useRef, useState, useEffect } from 'react';
import StageRail from './StageRail';

export default function JourneyTrack({
  stages = [],
  moments = [],
  onOpen,
  enableDrag = false,
  onDragStart,
  kpiKey,
  heatmapOn,
  kpiConfig,
  showRail = true,
}) {
  // Group moments by stageKey
  const byStage = Object.fromEntries((stages || []).map((s) => [s.key, []]));
  for (const m of moments) {
    const k = m.stageKey || m.stage;
    (byStage[k] ||= []).push(m);
  }
  // Stable order within a stage – by column then title
  Object.keys(byStage).forEach((k) => {
    byStage[k].sort(
      (a, b) =>
        (a.column || 1) - (b.column || 1) ||
        String(a.title).localeCompare(String(b.title))
    );
  });

  // Track which stage column is most visible (for StageRail highlight)
  const stageRefs = useRef({});
  const [active, setActive] = useState(stages?.[0]?.key);

  useEffect(() => {
    const onScroll = () => {
      let bestKey = active;
      let bestWidth = 0;
      for (const [key, el] of Object.entries(stageRefs.current)) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const visible =
          Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
        if (visible > bestWidth) {
          bestWidth = visible;
          bestKey = key;
        }
      }
      if (bestKey && bestKey !== active) setActive(bestKey);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active]);

  const scrollToStage = (key) => {
    const el = stageRefs.current[key];
    if (!el) return;
    const x = el.getBoundingClientRect().left + window.scrollX - 24;
    window.scrollTo({ left: x, behavior: 'smooth' });
  };

  // A, B, C… (fallback: derive from order or index)
  const letterFor = (stage, idx) => {
    const pos =
      Number.isFinite(Number(stage?.order)) && Number(stage.order) > 0
        ? Number(stage.order) - 1
        : idx;
    return String.fromCharCode(65 + (pos % 26)); // 0->A
  };

  // Per-stage collapsed state (expanded by default)
  const [collapsed, setCollapsed] = useState(() =>
    Object.fromEntries((stages || []).map((s) => [s.key, false]))
  );
  // Keep keys in sync when stages change
  useEffect(() => {
    setCollapsed((prev) => {
      const next = { ...prev };
      (stages || []).forEach((s) => {
        if (!(s.key in next)) next[s.key] = false;
      });
      Object.keys(next).forEach((k) => {
        if (!(stages || []).find((s) => s.key === k)) delete next[k];
      });
      return next;
    });
  }, [stages]);

  const toggleStage = (key) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="relative">
      {showRail && (
        <StageRail stages={stages} active={active} onJump={scrollToStage} />
      )}

      <div
        className="grid gap-6 px-4 mt-6"
        style={{
          gridTemplateColumns: `repeat(${
            stages.length || 1
          }, minmax(280px, 1fr))`,
        }}
      >
        {stages.map((stage, idx) => {
          const stageLetter = stage.letter || letterFor(stage, idx);
          const stageTitle = stage.title || stage.label || stage.key;
          const list = byStage[stage.key] || [];

          return (
            <section
              key={stage.key}
              ref={(el) => (stageRefs.current[stage.key] = el)}
              className="relative scroll-mt-[140px]"
            >
              {/* Column header */}
              <div className="border-b border-neutral-200 dark:border-neutral-800 px-2 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
                      {stageLetter}
                    </span>
                    <h3 className="text-sm font-semibold">{stageTitle}</h3>
                  </div>
                  <button
                    onClick={() => toggleStage(stage.key)}
                    className="text-[10px] uppercase tracking-widest text-neutral-500 hover:underline"
                    title={collapsed[stage.key] ? 'Expand' : 'Minimise'}
                  >
                    {collapsed[stage.key] ? 'Expand' : 'Minimise'}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="pt-4">
                {collapsed[stage.key] ? (
                  <StageStackPreview
                    stageLetter={stageLetter}
                    stageTitle={stageTitle}
                    count={list.length}
                    onExpand={() => toggleStage(stage.key)}
                    moments={list}
                  />
                ) : (
                  <div className="pt-5 space-y-3">
                    {list.map((m) => (
                      <MomentCard
                        key={m.id}
                        moment={m}
                        stageLetter={stageLetter}
                        stageTitle={stageTitle}
                        onOpen={onOpen}
                        enableDrag={enableDrag}
                        onDragStart={onDragStart}
                        kpiKey={kpiKey}
                        heatmapOn={heatmapOn}
                        kpiConfig={kpiConfig}
                      />
                    ))}
                    {!list.length && (
                      <div className="text-xs text-neutral-500 p-3">
                        No moments in this stage.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function StageStackPreview({
  stageLetter,
  stageTitle,
  count,
  onExpand,
  moments = [],
}) {
  // Show up to 4 tucked "ghost" cards behind the header card (peek RIGHT)
  const ghostCount = Math.min(4, Math.max(0, count - 1));
  const offsets = Array.from({ length: ghostCount }, (_, i) => (i + 1) * 10); // 10px, 20px…

  return (
    <button
      onClick={onExpand}
      className="relative block w-[260px] h-[130px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm text-left hover:shadow transition"
      title="Expand stage"
    >
      {/* Ghost layers (behind), full size, fade with depth */}
      {offsets.map((dx, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-xl border border-neutral-200 dark:border-[#2a2f36] bg-white dark:bg-[#1a1e24] pointer-events-none"
          style={{
            transform: `translateX(${dx}px)`,
            opacity: [0.8, 0.6, 0.4, 0.2][i] ?? 0.2,
            zIndex: 10 - i,
          }}
          aria-hidden
        />
      ))}

      {/* Front frame */}
      <div
        className="absolute inset-0 p-3 rounded-xl border border-neutral-200 dark:border-[#2a2f36] bg-white dark:bg-[#1a1e24] shadow-sm"
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
        <h4 className="mt-2 font-semibold text-sm leading-tight line-clamp-2">
          {stageTitle}
        </h4>
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

function MomentCard({
  moment,
  stageLetter,
  stageTitle,
  onOpen,
  enableDrag,
  onDragStart,
  kpiKey,
  heatmapOn,
  kpiConfig,
}) {
  const heat =
    heatmapOn && kpiKey && typeof getHeat === 'function'
      ? getHeat(moment, kpiKey, kpiConfig)
      : 0;

  // Prefer new moment.tags; fall back to legacy moment.layers
  const tags = Array.isArray(moment?.tags) && moment.tags.length
    ? moment.tags
    : (Array.isArray(moment?.layers) ? moment.layers : []);

  return (
    <div
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow transition cursor-pointer"
      onClick={() => onOpen?.(moment.id)}
      onMouseDown={(e) => {
        if (enableDrag) onDragStart?.(e, moment);
      }}
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

        <h4 className="mt-2 font-semibold text-sm leading-tight">
          {moment.title}
        </h4>

        {moment.experience?.momentsOfTruth?.length ? (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {moment.experience.momentsOfTruth.join(' • ')}
          </p>
        ) : null}

        {heat > 0 && (
          <div className="mt-2 h-[6px] rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-700 dark:bg-neutral-200"
              style={{ width: `${Math.min(100, heat)}%` }}
            />
          </div>
        )}

        {/* Tags */}
        {tags.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 6).map((t) => (
              <span
                key={String(t)}
                className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
              >
                #{String(t)}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="px-2 py-[2px] text-[10px] rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                +{tags.length - 6}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getHeat(moment, kpiKey, kpiConfig) {
  const val = Number(moment?.metrics?.[kpiKey] ?? 0);
  return Number.isFinite(val) ? val * 100 : 0;
}
