// src/components/JourneyView/JourneyTrack.jsx
import React, { useRef, useState, useEffect } from 'react';
import StageRail from './StageRail';

/**
 * JourneyTrack — stages as columns left→right; moments stack top→bottom.
 * Props: stages, moments, onOpen, enableDrag=false, onDragStart, kpiKey, heatmapOn, kpiConfig, showRail
 */
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
  // group by stageKey
  const byStage = Object.fromEntries(stages.map((s) => [s.key, []]));
  for (const m of moments) {
    const k = m.stageKey || m.stage;
    (byStage[k] ||= []).push(m);
  }
  Object.keys(byStage).forEach((k) => {
    byStage[k].sort(
      (a, b) =>
        (a.column || 1) - (b.column || 1) || a.title.localeCompare(b.title)
    );
  });

  // track refs for each stage + active highlight for rail
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
    const x = el.getBoundingClientRect().left + window.scrollX - 24; // left padding offset
    window.scrollTo({ left: x, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {showRail && (
        <StageRail stages={stages} active={active} onJump={scrollToStage} />
      )}

      {/* Columns — Added mt-6 for spacing below sticky header */}
      <div
        className="grid gap-6 px-4 mt-6"
        style={{
          gridTemplateColumns: `repeat(${stages.length || 1}, minmax(280px, 1fr))`,
        }}
      >
        {stages.map((stage) => (
          <section
            key={stage.key}
            ref={(el) => (stageRefs.current[stage.key] = el)}
            className="relative scroll-mt-[140px]" // aligns column top below both sticky bars when jumped to
          >
            {/* Column header - NOT sticky anymore */}
            <div
              className="border-b border-neutral-200 dark:border-neutral-800 px-2 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
                  {stage.letter}
                </span>
                <h3 className="text-sm font-semibold">{stage.label}</h3>
              </div>
            </div>

            {/* moments stack — pt-5 provides spacing below the header */}
            <div className="pt-5 space-y-3">
              {(byStage[stage.key] || []).map((m) => (
                <MomentCard
                  key={m.id}
                  moment={m}
                  stageLetter={stage.letter}
                  onOpen={onOpen}
                  enableDrag={enableDrag}
                  onDragStart={onDragStart}
                  kpiKey={kpiKey}
                  heatmapOn={heatmapOn}
                  kpiConfig={kpiConfig}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MomentCard({
  moment,
  stageLetter,
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

  return (
    <div
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow transition cursor-pointer"
      onClick={() => onOpen?.(moment.id)}
      onMouseDown={(e) => {
        if (enableDrag) onDragStart?.(e, moment);
      }}
      title={`${moment.title} — ${moment.stage || moment.stageKey}`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-5 px-2 items-center justify-center rounded-full text-[11px] font-bold border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100">
            {stageLetter}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">
            {moment.stage || moment.stageKey}
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
      </div>
    </div>
  );
}

function getHeat(moment, kpiKey, kpiConfig) {
  const val = Number(moment?.metrics?.[kpiKey] ?? 0);
  return isFinite(val) ? val * 100 : 0;
}