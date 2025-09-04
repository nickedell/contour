import MomentCard from './MomentCard';

export default function LensGrid({
  lanes = [],
  visibleLanes = {},
  moments = [],
  onOpen,
  kpiKey,
  heatmapOn,
  kpiConfig,
}) {
  // Ensure we always have a complete visibility object
  const vis = {
    experience: true,
    ai: true,
    behaviour: true,
    governance: true,
    ...(visibleLanes || {}),
  };

  // Group moments into 12-col grid positions per lane
  return (
    <div className="grid grid-cols-12 gap-6 mt-2">
      {lanes.map((ln) => {
        if (!ln || !ln.key) return null;
        if (!vis[ln.key]) return null;

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
                  // Guard against missing props
                  const colStart = Math.min(12, Math.max(1, Number(m.column) || 1));

                  return (
                    <div key={`${ln.key}-${m.id || Math.random()}`} className="col-span-2" style={{ gridColumnStart: colStart }}>
                      <MomentCard
                        lane={ln.key}
                        moment={m}
                        onOpen={onOpen}
                        kpiKey={kpiKey}
                        heatmapOn={heatmapOn}
                        kpiConfig={kpiConfig}
                      />
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
