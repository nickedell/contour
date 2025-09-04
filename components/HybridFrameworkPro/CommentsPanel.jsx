import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';

/**
 * CommentsPanel
 * Props:
 * - momentId
 * - dataComments: { [momentId]: Comment[] }
 * - onAdd(text)  -> parent will wire storage/persistence
 * - onDelete(commentId)
 * - currentUser (string) optional; if falsy, author shown as 'You'
 */
export default function CommentsPanel({ momentId, dataComments, onAdd, onDelete, currentUser }){
  const [text, setText] = useState('');
  const list = useMemo(() => (dataComments?.[momentId] || []).slice().sort((a,b)=> (a.ts||'').localeCompare(b.ts||'')), [dataComments, momentId]);

  const submit = (e) => {
    e?.preventDefault?.();
    const body = text.trim();
    if (!body) return;
    onAdd(body);
    setText('');
  };

  return (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Comments</div>
      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        />
        <button type="submit" className="px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">Post</button>
      </form>

      <div className="space-y-2">
        {list.length === 0 && <div className="text-xs text-neutral-500">No comments yet.</div>}
        {list.map(c => (
          <div key={c.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 p-2">
            <div className="text-xs text-neutral-500 flex items-center justify-between">
              <span>{c.author || currentUser || 'You'} • {formatTs(c.ts)}</span>
              <button onClick={()=>onDelete(c.id)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900" title="Delete comment"><Trash2 className="h-3.5 w-3.5"/></button>
            </div>
            <div className="text-sm whitespace-pre-wrap mt-1">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTs(ts){
  try {
    const d = new Date(ts);
    if (!isFinite(d)) return ts;
    return d.toLocaleString();
  } catch { return ts; }
}
