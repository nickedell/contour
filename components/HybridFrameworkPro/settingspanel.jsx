import { X } from 'lucide-react';
 
export default function SettingsPanel({
  open, onClose,
  commentMode, setCommentMode,
  currentUser, setCurrentUser,
  heatmapOn, setHeatmapOn,
  kpiKey, setKpiKey, kpiKeys,
  onOpenKpiConfig,
  showGrid, setShowGrid,
}) {
  return (
	<aside className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none opacity-0'} transition-opacity`}>
	  <div className="absolute inset-0 bg-black/30" onClick={onClose} />
	  <div className={`absolute inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-neutral-950
		border-l border-neutral-200 dark:border-neutral-800 shadow-xl transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
		<div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
		  <div className="text-xs uppercase tracking-widest text-neutral-500">Settings</div>
		<button
		  onClick={onClose}
		  className="h-7 w-7 flex items-center justify-center rounded-md
					 bg-white/90 text-neutral-900 dark:bg-neutral-900/90 dark:text-neutral-100
					 shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition focus:outline-none"
		  title="Close settings"
		  aria-label="Close settings"
		>
		  {'>'}
		</button>

		</div>

		<div className="p-4 space-y-4 text-sm">
		  {/* Comments */}
		  <section className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
			<div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Comments</div>
			<label className="flex items-center gap-2">
			  <input type="checkbox" checked={commentMode} onChange={(e)=>setCommentMode(e.target.checked)} />
			  Enable comment mode
			</label>
			<div className="mt-2">
			  <div className="text-xs text-neutral-500 mb-1">Display name</div>
			  <input value={currentUser} onChange={(e)=>setCurrentUser(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
			</div>
		  </section>

		  {/* Heatmap */}
		  <section className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
			<div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Heatmap</div>
			<label className="flex items-center gap-2">
			  <input type="checkbox" checked={heatmapOn} onChange={(e)=>setHeatmapOn(e.target.checked)} />
			  Heatmap on
			</label>
			<div className="mt-2">
			  <div className="text-xs text-neutral-500 mb-1">Metric</div>
			  <select disabled={!heatmapOn} value={kpiKey} onChange={(e)=>setKpiKey(e.target.value)} className="w-full px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 disabled:opacity-50">
				{kpiKeys.map(k => <option key={k} value={k}>{k}</option>)}
			  </select>
			  <button onClick={onOpenKpiConfig} className="mt-2 px-2 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">
				KPI Config…
			  </button>
			</div>
		  </section>

		  {/* Grid */}
		  <section className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
			<div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Canvas</div>
			<label className="flex items-center gap-2">
			  <input type="checkbox" checked={showGrid} onChange={(e)=>setShowGrid(e.target.checked)} />
			  Show 12-col grid
			</label>
		  </section>
		</div>
	  </div>
	</aside>
  );
}
