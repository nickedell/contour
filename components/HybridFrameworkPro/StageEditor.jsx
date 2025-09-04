import { useMemo, useState } from 'react';
import { X, ArrowUp, ArrowDown, Plus, Trash } from 'lucide-react';

/**
 * StageEditor
 * - View & edit stages: rename, reorder, add, delete
 * - On save, returns updated stages and a function to map old->new keys
 * - If a stage is deleted, user must pick a fallback stage for its moments
 */
export default function StageEditor({ open, onClose, stages, onSave }) {
  const [rows, setRows] = useState(() =>
    (stages || []).map(s => ({ key: s.key, label: s.label, color: s.color || '#6B7280' }))
  );
  const [deleted, setDeleted] = useState([]); // {key, label, reassignTo}
  const stageKeys = useMemo(() => rows.map(r => r.key), [rows]);

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const copy = rows.slice();
    const [it] = copy.splice(i, 1);
    copy.splice(j, 0, it);
    setRows(copy);
  };

  const update = (i, patch) => {
    const copy = rows.slice();
    copy[i] = { ...copy[i], ...patch };
    setRows(copy);
  };

  const addRow = () => setRows([...rows, { key: suggestKey('S' + (rows.length+1), stageKeys), label: 'New Stage', color: '#6B7280' }]);
  const removeRow = (i) => {
    const r = rows[i];
    setDeleted(d => [...d, { key: r.key, label: r.label, reassignTo: rows[0]?.key || '' }]);
    setRows(rows.filter((_, idx) => idx !== i));
  };

  const save = () => {
    // Build new stages with order
    const updated = rows.map((r, idx) => ({ key: r.key, label: r.label, order: idx + 1, color: r.color || '#6B7280' }));
    onSave(updated, deleted);
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none opacity-0'} transition-opacity`}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-neutral-500">Stage Editor</div>
            <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900"><X className="h-4 w-4"/></button>
          </div>

          <div className="p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Rename, reorder, add or delete stages. Deleting requires choosing a fallback stage for its moments.</div>

            <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-1">
              <div className="col-span-1">Order</div>
              <div className="col-span-3">Key</div>
              <div className="col-span-6">Label</div>
              <div className="col-span-2">Actions</div>
            </div>

            {rows.map((r, i) => (
              <div key={r.key} className="grid grid-cols-12 gap-2 items-center mb-2">
                <div className="col-span-1 flex items-center gap-1">
                  <button onClick={()=>move(i,-1)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900" title="Move up"><ArrowUp className="h-4 w-4"/></button>
                  <button onClick={()=>move(i, 1)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900" title="Move down"><ArrowDown className="h-4 w-4"/></button>
                </div>
                <div className="col-span-3">
                  <input value={r.key} onChange={e=>update(i,{key:e.target.value})} className="w-full px-2 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"/>
                </div>
                <div className="col-span-6">
                  <input value={r.label} onChange={e=>update(i,{label:e.target.value})} className="w-full px-2 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"/>
                </div>
                <div className="col-span-2 flex gap-2">
                  <button onClick={()=>removeRow(i)} className="px-2 py-1 text-xs rounded-md border border-rose-300 text-rose-600 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash className="h-3 w-3"/></button>
                </div>
              </div>
            ))}

            <div className="mt-3">
              <button onClick={addRow} className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 inline-flex items-center gap-1"><Plus className="h-4 w-4"/> Add Stage</button>
            </div>

            {deleted.length > 0 && (
              <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Reassign deleted stages</div>
                <div className="space-y-2">
                  {deleted.map((d, i) => (
                    <div key={d.key} className="flex items-center gap-2">
                      <div className="text-sm">{d.label} ({d.key}) →</div>
                      <select value={d.reassignTo} onChange={(e)=>{
                        const copy = deleted.slice(); copy[i] = { ...copy[i], reassignTo: e.target.value }; setDeleted(copy);
                      }} className="px-2 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                        {rows.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

function suggestKey(base, taken) {
  let k = base;
  let i = 1;
  while (taken.includes(k)) {
    k = base + i; i++;
  }
  return k;
}
