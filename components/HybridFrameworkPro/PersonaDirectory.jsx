import { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';

/**
 * PersonaDirectory
 * Props:
 * - open (bool)
 * - onClose()
 * - personasIndex: { [personaName]: { category, snapshot, goals, pains, ... } }
 * - moments: Moment[]
 * - onOpenMoment(id)
 */
export default function PersonaDirectory({ open, onClose, personasIndex = {}, moments = [], onOpenMoment }) {
  const [q, setQ] = useState('');

  const names = useMemo(() => Object.keys(personasIndex || {}).sort(), [personasIndex]);

  const personaMoments = (name) =>
    (moments || []).filter((m) => (m.experience?.personas || []).includes(name));

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return names;
    return names.filter((n) => {
      const p = personasIndex[n] || {};
      const hay = JSON.stringify({ n, ...p }).toLowerCase();
      return hay.includes(query);
    });
  }, [q, names, personasIndex]);

  return (
    <aside
      className={`fixed inset-0 z-50 bg-black/30 ${open ? '' : 'pointer-events-none opacity-0'} transition-opacity`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-y-0 right-0 w-full sm:w-[560px] md:w-[640px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-xs uppercase tracking-widest text-neutral-500">Persona Directory</div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search personas…"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto h-[calc(100%-6rem)] p-3 space-y-3">
          {filtered.length === 0 && (
            <div className="text-sm text-neutral-500 px-2">No personas match “{q}”.</div>
          )}

          {filtered.map((name) => {
            const p = personasIndex[name] || {};
            const pm = personaMoments(name);
            return (
              <div key={name} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    {p.category && (
                      <div className="text-[11px] uppercase tracking-widest text-neutral-500">{p.category}</div>
                    )}
                  </div>
                  {pm.length > 0 && (
                    <div className="text-[11px] text-neutral-500">{pm.length} linked moment{pm.length > 1 ? 's' : ''}</div>
                  )}
                </div>

                {p.snapshot && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">{p.snapshot}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {/* Goals */}
                  {p.goals && p.goals.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Goals & KPIs</div>
                      <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                        {p.goals.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pains */}
                  {p.pains && p.pains.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Pains</div>
                      <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                        {p.pains.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Linked moments */}
                {pm.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Linked Moments</div>
                    <div className="flex flex-wrap gap-2">
                      {pm.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => onOpenMoment?.(m.id)}
                          className="px-2 py-1 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          title={m.title}
                        >
                          {m.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
