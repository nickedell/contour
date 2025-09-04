import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

/**
 * KpiConfig
 * - Shows all KPI keys found in the dataset
 * - For each key: min, max, higherIsBetter
 * - Allows "Infer" to prefill min/max from current data
 * - Saves config back to parent as { [key]: { min, max, higherIsBetter } }
 */
export default function KpiConfig({ open, onClose, kpiKeys, inferred, value, onSave }){
  const [rows, setRows] = useState({});

  useEffect(()=>{
    if (open) {
      setRows(value || {});
    }
  }, [open, value]);

  const applyInfer = () => {
    const next = { ...(rows||{}) };
    kpiKeys.forEach(k => {
      const d = inferred?.[k];
      if (!d) return;
      next[k] = { ...(next[k]||{}), min: d.min, max: d.max, higherIsBetter: (next[k]?.higherIsBetter ?? true) };
    });
    setRows(next);
  };

  const update = (k, patch) => setRows(prev => ({ ...(prev||{}), [k]: { ...(prev?.[k]||{}), ...patch } }));

  const save = () => onSave(rows);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none opacity-0'} transition-opacity`}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-neutral-500">KPI Normaliser</div>
            <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900"><X className="h-4 w-4"/></button>
          </div>

          <div className="p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Define how raw KPI values map to a 0–1 score for the heatmap. Use <strong>Infer</strong> to prefill min/max from your current dataset; adjust and toggle "Higher is better" for metrics like time or errors.
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button onClick={applyInfer} className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">Infer min/max</button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-1">
              <div className="col-span-4">KPI</div>
              <div className="col-span-3">Min</div>
              <div className="col-span-3">Max</div>
              <div className="col-span-2">Higher better</div>
            </div>

            {(kpiKeys||[]).map(k => {
              const r = rows[k] || { min: '', max: '', higherIsBetter: true };
              return (
                <div key={k} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <div className="col-span-4 text-sm">{k}</div>
                  <div className="col-span-3">
                    <input type="number" step="any" value={r.min} onChange={e=>update(k,{min: parseFloat(e.target.value)})} className="w-full px-2 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"/>
                  </div>
                  <div className="col-span-3">
                    <input type="number" step="any" value={r.max} onChange={e=>update(k,{max: parseFloat(e.target.value)})} className="w-full px-2 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"/>
                  </div>
                  <div className="col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={r.higherIsBetter ?? true} onChange={e=>update(k,{higherIsBetter: e.target.checked})} />
                      <span>Yes</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
