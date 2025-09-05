// components/HybridFrameworkPro/LensView/MomentCard.jsx
import React from 'react';

export default function MomentCard({
  lane,
  moment,
  stageLabel,          // ✅ full title from LensGrid
  onOpen,
  kpiKey,
  heatmapOn,
  kpiConfig,
}) {
  const heat = getHeat(moment, kpiKey, kpiConfig);

  return (
    <div
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow transition cursor-pointer"
      onClick={() => onOpen?.(moment.id)}
      title={`${moment.title}${stageLabel ? ' — ' + stageLabel : ''}`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* Left lozenge = full stage title (NOT the letter) */}
          <span className="inline-flex h-5 px-2 items-center justify-center rounded-full text-[11px] font-medium border border-neutral-300 text-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100 whitespace-nowrap">
            {stageLabel}
          </span>
          {/* Keep whatever you had on the right, or leave blank */}
        </div>

        <h4 className="mt-2 font-semibold text-sm leading-tight">{moment.title}</h4>

        {moment.experience?.momentsOfTruth?.length ? (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {moment.experience.momentsOfTruth.join(' • ')}
          </p>
        ) : null}

        {heat > 0 && (
          <div className="mt-2 h-[6px] rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-neutral-700 dark:bg-neutral-200" style={{ width: `${Math.min(100, heat)}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

function getHeat(moment, kpiKey, kpiConfig) {
  if (!kpiKey || !heatmapOnEnabled) return 0;
  const val = Number(moment?.metrics?.[kpiKey] ?? 0);
  return isFinite(val) ? val * 100 : 0;
}

// simple guard if props are omitted
function heatmapOnEnabled(flag) {
  return typeof flag === 'boolean' ? flag : false;
}
