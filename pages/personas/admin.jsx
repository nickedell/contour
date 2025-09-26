// pages/personas/admin.js
/**
 * Contour — Personas Admin (file-first, no-DB)
 * - Import a JSON
 * - Edit Teams (Sets) + Personas
 * - Export JSON
 *
 * Expected shape (flat, portable):
 * {
 *   "sets": [
 *     { "id":"uuid", "name":"Team A", "context":"...", "tags":["..."], "meta":{...} }
 *   ],
 *   "personas": [
 *     { "id":"uuid", "set_id":"uuid", "name":"...", "role":"...", "tags":["..."], "data":{ "summary":"..." } }
 *   ]
 * }
 */

import * as React from 'react';
import withPersonaLayout from '@/components/personas/withPersonaLayout';
import Link from 'next/link';

const emptyDoc = { sets: [], personas: [] };

// --- Tiny utils --------------------------------------------------------------

const uid = () => crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function parseJsonSafe(txt) {
  try { return JSON.parse(txt); } catch { return null; }
}

function validateDoc(doc) {
  const errs = [];
  if (!doc || typeof doc !== 'object') { errs.push('Root is not an object.'); return errs; }
  if (!Array.isArray(doc.sets)) errs.push('Missing "sets" array.');
  if (!Array.isArray(doc.personas)) errs.push('Missing "personas" array.');
  const setIds = new Set((doc.sets || []).map(s => s.id));
  (doc.sets || []).forEach((s, i) => {
	if (!s.id) errs.push(`sets[${i}] missing id`);
	if (!s.name) errs.push(`sets[${i}] missing name`);
	if (s.tags && !Array.isArray(s.tags)) errs.push(`sets[${i}].tags must be array`);
  });
  (doc.personas || []).forEach((p, i) => {
	if (!p.id) errs.push(`personas[${i}] missing id`);
	if (!p.name) errs.push(`personas[${i}] missing name`);
	if (!p.set_id) errs.push(`personas[${i}] missing set_id`);
	if (p.set_id && !setIds.has(p.set_id)) errs.push(`personas[${i}].set_id does not match any set`);
	if (p.tags && !Array.isArray(p.tags)) errs.push(`personas[${i}].tags must be array`);
  });
  return errs;
}

// --- Row editors -------------------------------------------------------------

function SetRow({ s, onChange, onDelete }) {
  const [local, setLocal] = React.useState(() => ({
	name: s.name || '',
	context: s.context || '',
	tags: (s.tags || []).join(', '),
  }));
  React.useEffect(() => {
	setLocal({ name: s.name || '', context: s.context || '', tags: (s.tags || []).join(', ') });
  }, [s.id]);

  return (
	<div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4">
	  <div className="grid gap-3 md:grid-cols-3">
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Team name</div>
		  <input
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.name}
			onChange={(e) => setLocal({ ...local, name: e.target.value })}
			onBlur={() => onChange({ ...s, name: local.name })}
			placeholder="e.g. Marine Bunkering Team v1"
		  />
		</div>
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Context</div>
		  <input
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.context}
			onChange={(e) => setLocal({ ...local, context: e.target.value })}
			onBlur={() => onChange({ ...s, context: local.context })}
			placeholder="Desk Ops EU"
		  />
		</div>
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Tags (comma)</div>
		  <input
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.tags}
			onChange={(e) => setLocal({ ...local, tags: e.target.value })}
			onBlur={() => onChange({ ...s, tags: toArray(local.tags) })}
			placeholder="marine, eu"
		  />
		</div>
	  </div>
	  <div className="mt-3 text-xs flex items-center justify-between">
		<span className="text-neutral-500">ID: {s.id}</span>
		<button className="text-red-300 hover:underline" onClick={() => onDelete(s.id)}>Delete team</button>
	  </div>
	</div>
  );
}

function PersonaRow({ p, sets, onChange, onDelete }) {
  const [local, setLocal] = React.useState(() => ({
	name: p.name || '',
	role: p.role || '',
	set_id: p.set_id || '',
	tags: (p.tags || []).join(', '),
	summary: p?.data?.summary || '',
  }));
  React.useEffect(() => {
	setLocal({
	  name: p.name || '',
	  role: p.role || '',
	  set_id: p.set_id || '',
	  tags: (p.tags || []).join(', '),
	  summary: p?.data?.summary || '',
	});
  }, [p.id]);

  const apply = () => {
	onChange({
	  ...p,
	  name: local.name,
	  role: local.role,
	  set_id: local.set_id,
	  tags: toArray(local.tags),
	  data: { ...(p.data || {}), summary: local.summary },
	});
  };

  return (
	<div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4">
	  <div className="grid gap-3 md:grid-cols-5">
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Name</div>
		  <input
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.name}
			onChange={(e) => setLocal({ ...local, name: e.target.value })}
			onBlur={apply}
			placeholder="Analyst (EU)"
		  />
		</div>
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Role</div>
		  <input
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.role}
			onChange={(e) => setLocal({ ...local, role: e.target.value })}
			onBlur={apply}
			placeholder="Analyst"
		  />
		</div>
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Team</div>
		  <select
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.set_id}
			onChange={(e) => setLocal({ ...local, set_id: e.target.value })}
			onBlur={apply}
		  >
			<option value="">— choose a team —</option>
			{sets.map((s) => (<option key={s.id} value={s.id}>{s.name || 'Untitled team'}</option>))}
		  </select>
		</div>
		<div>
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Tags (comma)</div>
		  <input
			className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm"
			value={local.tags}
			onChange={(e) => setLocal({ ...local, tags: e.target.value })}
			onBlur={apply}
			placeholder="analyst, eu"
		  />
		</div>
		<div className="md:col-span-1">
		  <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">&nbsp;</div>
		  <button className="w-full rounded-md border border-neutral-700 px-2 py-1.5 text-sm hover:bg-neutral-900" onClick={() => onDelete(p.id)}>
			Delete
		  </button>
		</div>
	  </div>
	  <div className="mt-3">
		<div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Summary</div>
		<textarea
		  className="w-full rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm min-h-[80px]"
		  value={local.summary}
		  onChange={(e) => setLocal({ ...local, summary: e.target.value })}
		  onBlur={apply}
		  placeholder="Short one-paragraph summary…"
		/>
	  </div>
	  <div className="mt-3 text-xs text-neutral-500">ID: {p.id}</div>
	</div>
  );
}

// --- Main page ---------------------------------------------------------------

function PersonasAdminPage() {
  const [doc, setDoc] = React.useState(emptyDoc);
  const [errors, setErrors] = React.useState([]);
  const [tab, setTab] = React.useState('sets'); // 'sets' | 'personas'
  const fileRef = React.useRef(null);

  // load from localStorage draft (nice safety)
  React.useEffect(() => {
	try {
	  const raw = localStorage.getItem('personas:admin:draft');
	  if (raw) {
		const parsed = parseJsonSafe(raw);
		if (parsed) { setDoc(parsed); setErrors(validateDoc(parsed)); }
	  }
	} catch {}
  }, []);
  React.useEffect(() => {
	try { localStorage.setItem('personas:admin:draft', JSON.stringify(doc)); } catch {}
  }, [doc]);

  const sets = doc.sets || [];
  const personas = doc.personas || [];

  // CRUD — sets
  const addSet = () => {
	const s = { id: uid(), name: 'New Team', context: '', tags: [] };
	setDoc(d => ({ ...d, sets: [s, ...(d.sets || [])] }));
  };
  const changeSet = (next) => {
	setDoc(d => ({ ...d, sets: (d.sets || []).map(s => s.id === next.id ? next : s) }));
  };
  const deleteSet = (id) => {
	// also detach personas that pointed to it
	setDoc(d => ({
	  ...d,
	  sets: (d.sets || []).filter(s => s.id !== id),
	  personas: (d.personas || []).map(p => p.set_id === id ? { ...p, set_id: '' } : p),
	}));
  };

  // CRUD — personas
  const addPersona = () => {
	const p = { id: uid(), set_id: sets[0]?.id || '', name: 'New Persona', role: '', tags: [], data: { summary: '' } };
	setDoc(d => ({ ...d, personas: [p, ...(d.personas || [])] }));
  };
  const changePersona = (next) => {
	setDoc(d => ({ ...d, personas: (d.personas || []).map(p => p.id === next.id ? next : p) }));
  };
  const deletePersona = (id) => {
	setDoc(d => ({ ...d, personas: (d.personas || []).filter(p => p.id !== id) }));
  };

  // import / export
  const onPick = (e) => {
	const f = e.target.files?.[0];
	if (!f) return;
	const rd = new FileReader();
	rd.onload = () => {
	  const parsed = parseJsonSafe(String(rd.result || ''));
	  if (!parsed) { setErrors(['Invalid JSON']); return; }
	  const errs = validateDoc(parsed);
	  setDoc(parsed);
	  setErrors(errs);
	};
	rd.readAsText(f);
	e.target.value = '';
  };

  const onDrop = (e) => {
	e.preventDefault();
	const f = e.dataTransfer.files?.[0];
	if (!f) return;
	const rd = new FileReader();
	rd.onload = () => {
	  const parsed = parseJsonSafe(String(rd.result || ''));
	  if (!parsed) { setErrors(['Invalid JSON']); return; }
	  const errs = validateDoc(parsed);
	  setDoc(parsed);
	  setErrors(errs);
	};
	rd.readAsText(f);
  };

  const exportDoc = () => {
	const errs = validateDoc(doc);
	setErrors(errs);
	if (errs.length) return;
	download('personas.json', JSON.stringify(doc, null, 2));
  };

  return (
	<section onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
	  {/* Top bar: actions */}
	  <div className="mb-4 flex flex-wrap items-center gap-2">
		<div className="flex items-center gap-2 rounded-md border border-neutral-800/70 bg-neutral-950/60 p-2">
		  <button
			className={`px-3 py-1.5 text-sm rounded-md ${tab === 'sets' ? 'bg-white/10' : ''}`}
			onClick={() => setTab('sets')}
			title="Teams"
		  >
			Teams
		  </button>
		  <button
			className={`px-3 py-1.5 text-sm rounded-md ${tab === 'personas' ? 'bg-white/10' : ''}`}
			onClick={() => setTab('personas')}
			title="Personas"
		  >
			Personas
		  </button>
		</div>

		<div className="ml-auto flex items-center gap-2">
		  <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onPick} />
		  <button
			className="px-3 py-1.5 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900"
			onClick={() => fileRef.current?.click()}
		  >
			Import JSON
		  </button>
		  <button
			className="px-3 py-1.5 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900"
			onClick={exportDoc}
			title="Validate & download personas.json"
		  >
			Export JSON
		  </button>
		  <Link
			href="/personas"
			className="px-3 py-1.5 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900"
		  >
			Exit
		  </Link>
		</div>
	  </div>

	  {/* Validation */}
	  {errors.length > 0 && (
		<div className="mb-4 rounded-lg border border-amber-600/40 bg-amber-950/30 p-3">
		  <div className="text-sm font-semibold text-amber-300">Schema warnings</div>
		  <ul className="mt-1 text-sm text-amber-200 list-disc pl-5 space-y-1">
			{errors.map((e, i) => (<li key={i}>{e}</li>))}
		  </ul>
		</div>
	  )}

	  {/* Drag & drop hint */}
	  <div className="mb-4 rounded-lg border border-neutral-800/70 bg-neutral-950/40 p-3 text-sm text-neutral-400">
		Drop a <code>personas.json</code> anywhere on the page to load. Your edits autosave to <code>localStorage</code> until you export.
	  </div>

	  {/* Content */}
	  {tab === 'sets' ? (
		<div>
		  <div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Teams</div>
		  <div className="mb-3">
			<button className="px-3 py-1.5 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900" onClick={addSet}>
			  + Add Team
			</button>
		  </div>
		  {sets.length === 0 ? (
			<div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
			  No teams yet. Import JSON or create your first team.
			</div>
		  ) : (
			<ul className="space-y-3">
			  {sets.map((s) => (
				<li key={s.id}><SetRow s={s} onChange={changeSet} onDelete={deleteSet} /></li>
			  ))}
			</ul>
		  )}
		</div>
	  ) : (
		<div>
		  <div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Personas</div>
		  <div className="mb-3">
			<button className="px-3 py-1.5 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900" onClick={addPersona}>
			  + Add Persona
			</button>
		  </div>
		  {personas.length === 0 ? (
			<div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
			  No personas yet. Import JSON or create your first persona.
			</div>
		  ) : (
			<ul className="space-y-3">
			  {personas.map((p) => (
				<li key={p.id}><PersonaRow p={p} sets={sets} onChange={changePersona} onDelete={deletePersona} /></li>
			  ))}
			</ul>
		  )}
		</div>
	  )}
	</section>
  );
}

// Breadcrumbs: Personas / Admin
export default withPersonaLayout(PersonasAdminPage, [
  { label: 'Personas' },
  { label: 'Admin' },
]);
