/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || process.env.N8N_BASE_URL || '';
const CANDIDATES_PATH = process.env.NEXT_PUBLIC_N8N_PERSONAS_CANDIDATES_PATH || process.env.N8N_PERSONAS_CANDIDATES_PATH || '/contour/personas/candidates';
const SAVE_PATH = process.env.NEXT_PUBLIC_N8N_PERSONAS_SAVE_PATH || process.env.N8N_PERSONAS_SAVE_PATH || '/contour/personas/save';
const GENERATE_PATH = process.env.NEXT_PUBLIC_N8N_PERSONAS_GENERATE_PATH || process.env.N8N_PERSONAS_GENERATE_PATH || ''; // optional

export default function PersonaSetBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('B'); // 'A' or 'B'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Set meta
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [tags, setTags] = useState('');

  // Mode A: known individuals
  const [peopleText, setPeopleText] = useState(''); // one per line: Name, LinkedIn URL

  // Mode B: role/domain
  const [role, setRole] = useState('');
  const [sector, setSector] = useState('');
  const [geo, setGeo] = useState('');
  const [orgType, setOrgType] = useState('');
  const [limit, setLimit] = useState(16);

  const [candidates, setCandidates] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(new Set());

  const doFetchCandidates = async () => {
	setError('');
	try {
	  const url = `${N8N_BASE}${CANDIDATES_PATH}`;
	  const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ role, sector, geo, org_type: orgType, limit }),
	  });
	  const json = await res.json();
	  setCandidates(json?.candidates || []);
	} catch (e) {
	  setError('Failed to fetch candidates');
	}
  };

  const toggleSelect = (i) => {
	const next = new Set(selectedIdx);
	next.has(i) ? next.delete(i) : next.add(i);
	setSelectedIdx(next);
  };

  const buildPayload = async () => {
	// Persona set
	const set = {
	  name: name || 'Untitled Persona Set',
	  context,
	  tags: tags.split(',').map(s => s.trim()).filter(Boolean),
	  meta: { role, sector, geo, org_type: orgType }
	};

	// Personas
	let personas = [];

	if (mode === 'A') {
	  const lines = peopleText.split('\n').map(l => l.trim()).filter(Boolean);
	  personas = lines.map((line) => {
		const [n, url] = line.split(',').map(s => s.trim());
		return {
		  name: n || 'Unknown',
		  role: role || '',
		  tags: [],
		  data: { sources: [{ type: 'linkedin', url }] }
		};
	  });

	  // Optional: call GENERATE to synthesize from sources
	  if (GENERATE_PATH) {
		try {
		  const url = `${N8N_BASE}${GENERATE_PATH}`;
		  const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ mode: 'A', set, personas }),
		  });
		  const json = await res.json();
		  if (Array.isArray(json?.personas)) personas = json.personas;
		} catch {}
	  }
	} else {
	  const chosen = candidates.filter((_, i) => selectedIdx.has(i));
	  personas = chosen.map((c) => ({
		name: c.name || 'Candidate',
		role: c.title || role || '',
		tags: [],
		data: {
		  company: c.company || '',
		  sources: c.linkedin_url ? [{ type: 'linkedin', url: c.linkedin_url }] : []
		}
	  }));

	  if (GENERATE_PATH) {
		try {
		  const url = `${N8N_BASE}${GENERATE_PATH}`;
		  const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ mode: 'B', set, candidates: chosen }),
		  });
		  const json = await res.json();
		  if (Array.isArray(json?.personas)) personas = json.personas;
		} catch {}
	  }
	}

	return { set, personas };
  };

  const doSave = async () => {
	setSaving(true);
	setError('');
	try {
	  const payload = await buildPayload();
	  const url = `${N8N_BASE}${SAVE_PATH}`;
	  const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	  });
	  const json = await res.json();
	  if (!res.ok || json.error) throw new Error(json.error || 'Save failed');
	  // Redirect to the set detail
	  if (json.set_id) router.push(`/personas/set/${json.set_id}`);
	  else router.push('/personas');
	} catch (e) {
	  setError(e?.message || 'Failed to save');
	} finally {
	  setSaving(false);
	}
  };

  return (
	<div className="min-h-screen bg-white dark:bg-[#121417] text-black dark:text-white px-6 py-8">
	  <h1 className="text-xl font-extrabold tracking-tight">New Persona Set</h1>

	  {/* Step 1: Meta */}
	  <section className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
		<div className="text-sm font-semibold mb-3">1) Set details</div>
		<div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
		  <label className="text-sm">Name
			<input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Marine Bunkering Team v1" />
		  </label>
		  <label className="text-sm">Context
			<input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={context} onChange={e=>setContext(e.target.value)} placeholder="Desk Ops, EU" />
		  </label>
		  <label className="text-sm sm:col-span-2">Tags (comma separated)
			<input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={tags} onChange={e=>setTags(e.target.value)} placeholder="marine, eu, team-v1" />
		  </label>
		</div>
	  </section>

	  {/* Step 2: Mode */}
	  <section className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
		<div className="text-sm font-semibold mb-3">2) Choose mode</div>
		<div className="flex gap-3">
		  <button onClick={() => setMode('A')} className={`px-3 py-2 text-sm rounded-md border ${mode==='A'?'border-neutral-900 dark:border-neutral-200':'border-neutral-300 dark:border-neutral-700'}`}>Mode A — Known Individuals</button>
		  <button onClick={() => setMode('B')} className={`px-3 py-2 text-sm rounded-md border ${mode==='B'?'border-neutral-900 dark:border-neutral-200':'border-neutral-300 dark:border-neutral-700'}`}>Mode B — Role/Domain</button>
		</div>
	  </section>

	  {/* Step 3: Inputs */}
	  {mode === 'A' ? (
		<section className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
		  <div className="text-sm font-semibold mb-3">3) Known individuals</div>
		  <p className="text-xs text-neutral-500 mb-2">One per line: <code>Name, LinkedIn URL</code></p>
		  <textarea value={peopleText} onChange={e=>setPeopleText(e.target.value)} rows={8} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 font-mono text-xs" placeholder={`Jane Doe, https://www.linkedin.com/in/...`}/>
		</section>
	  ) : (
		<section className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
		  <div className="text-sm font-semibold mb-3">3) Role/Domain</div>
		  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
			<label className="text-sm">Role
			  <input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={role} onChange={e=>setRole(e.target.value)} placeholder="Originator" />
			</label>
			<label className="text-sm">Sector
			  <input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={sector} onChange={e=>setSector(e.target.value)} placeholder="Marine" />
			</label>
			<label className="text-sm">Geo
			  <input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={geo} onChange={e=>setGeo(e.target.value)} placeholder="EU" />
			</label>
			<label className="text-sm">Org type
			  <input className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={orgType} onChange={e=>setOrgType(e.target.value)} placeholder="Energy" />
			</label>
			<label className="text-sm">Limit
			  <input type="number" min={1} max={50} className="mt-1 w-28 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2" value={limit} onChange={e=>setLimit(Number(e.target.value))} />
			</label>
		  </div>

		  <div className="mt-3">
			<button onClick={doFetchCandidates} className="px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">Fetch candidates</button>
		  </div>

		  {candidates.length ? (
			<div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			  {candidates.map((c, i) => {
				const selected = selectedIdx.has(i);
				return (
				  <button key={i} onClick={() => toggleSelect(i)} className={`text-left rounded-xl border p-3 ${selected ? 'border-neutral-900 dark:border-neutral-200 bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950'}`}>
					<div className="font-semibold text-sm">{c.name || 'Candidate'}</div>
					<div className="text-xs text-neutral-500">{c.title || '—'}</div>
					<div className="text-xs text-neutral-500 truncate">{c.company || '—'}</div>
					{c.linkedin_url ? <div className="text-xs text-blue-600 mt-1 truncate">{c.linkedin_url}</div> : null}
				  </button>
				);
			  })}
			</div>
		  ) : null}
		</section>
	  )}

	  {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

	  <div className="mt-6 flex gap-3">
		<button onClick={() => setStep(step-1)} disabled={step<=1} className="px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 disabled:opacity-50">Back</button>
		<button onClick={doSave} disabled={saving} className="px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">
		  {saving ? 'Saving…' : 'Generate & Save'}
		</button>
	  </div>
	</div>
  );
}
