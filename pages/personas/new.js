/**
 * Contour — Personas New Team
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import PersonaLayout from '@/components/personas/PersonaLayout';
import * as React from 'react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getCandidates, researchKnownIndividuals, saveTeam } from '../../lib/n8n';
import PageHeader from '@/components/personas/PageHeader';


function cls(...xs) { return xs.filter(Boolean).join(' '); }
function parseTags(s) { return (s || '').split(/[,#]/g).map(t => t.trim()).filter(Boolean); }

export default function NewPersonaTeam() {
  const [mode, setMode] = useState('B');
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('New Team');
  const [context, setContext] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Mode B
  const [role, setRole] = useState('Marketer');
  const [sector, setSector] = useState('Marine');
  const [geo, setGeo] = useState('EU');
  const [orgType, setOrgType] = useState('Energy');
  const [limit, setLimit] = useState(20);

  // Mode A
  const [people, setPeople] = useState([{ name: '', linkedin_url: '' }]);

  // Candidates + selection
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState({});
  const selectedCandidates = useMemo(() => candidates.filter((_, i) => selected[i]), [candidates, selected]);

  // Personas preview
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [personasPreview, setPersonasPreview] = useState([]);

  // Save
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [error, setError] = useState(null);

  async function onFetchCandidates(e) {
	e?.preventDefault?.();
	setError(null);
	setLoadingCandidates(true);
	try {
	  const out = await getCandidates({ role, sector, geo, org_type: orgType, limit: Number(limit) || 20 });
	  const list = Array.isArray(out?.candidates) ? out.candidates : [];
	  setCandidates(list);
	  const seed = {};
	  list.slice(0, Math.min(list.length, 6)).forEach((_, i) => { seed[i] = true; });
	  setSelected(seed);
	  setStep(2);
	} catch (err) {
	  setError(err?.message || 'Failed to fetch candidates');
	} finally {
	  setLoadingCandidates(false);
	}
  }

  async function onGeneratePersonas() {
	setError(null);
	setLoadingResearch(true);
	try {
	  let payload;
	  if (mode === 'B') {
		const peoplePayload = selectedCandidates.map(c => ({ name: c.name || '', linkedin_url: c.linkedin_url || '' }));
		if (peoplePayload.length === 0) throw new Error('Select at least one candidate.');
		payload = { people: peoplePayload, role_keywords: [role].filter(Boolean), sector, geo, similar_profiles_count: Math.max(6, peoplePayload.length), evidence_mode: true };
	  } else {
		const peoplePayload = people.filter(p => p.name || p.linkedin_url);
		if (peoplePayload.length === 0) throw new Error('Add at least one person for Mode A.');
		payload = { people: peoplePayload, role_keywords: [], sector, geo, similar_profiles_count: Math.min(peoplePayload.length * 2, 12), evidence_mode: true };
	  }
	  const resp = await researchKnownIndividuals(payload);
	  const raw = Array.isArray(resp?.personas) ? resp.personas : [];
	  const preview = raw.map(p => ({ name: p.display_name || p.name || 'Persona', role: p.role || role || '—', tags: [], data: p }));
	  setPersonasPreview(preview);
	  setStep(3);
	} catch (err) {
	  setError(err?.message || 'Failed to generate personas');
	} finally {
	  setLoadingResearch(false);
	}
  }

  async function onSave() {
	setError(null);
	setSaving(true);
	try {
	  const tags = parseTags(tagsInput);
	  const res = await saveTeam({ set: { name: teamName, context, tags }, personas: personasPreview.map(p => ({ name: p.name, role: p.role, tags: p.tags || [], data: p.data })) });
	  setSaveResult(res);
	} catch (err) {
	  setError(err?.message || 'Save failed');
	} finally {
	  setSaving(false);
	}
  }

  function updatePerson(i, field, val) { setPeople(prev => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))); }
  function addPersonRow() { setPeople(prev => [...prev, { name: '', linkedin_url: '' }]); }
  function removePersonRow(i) { setPeople(prev => prev.filter((_, idx) => idx !== i)); }

  return (
	<PersonaLayout
	  titleSuffix="Personas"
	  breadcrumbs={[{ label: 'Library', href: '/personas' }, { label: 'New Team' }]}
	>
	  {/* === IDENTICAL WRAPPER START (matches /personas) === */}
	  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<div
		  className="mt-6 rounded-2xl border shadow-sm"
		  style={{ background: '#121417', borderColor: 'rgba(255,255,255,0.06)' }}
		>
		  
		  <PageHeader
			title="Personas / New"
			
		  />

		  {/* Page content */}
		  <div className="px-5 sm:px-6 lg:px-8 py-6">
			<div className="flex items-center justify-between gap-4">
			  <h1 className="text-xl sm:text-xl font-bold">New Team</h1>
			  <Link href="/personas" className="text-sm px-3 py-1.5 rounded-md border border-neutral-700 hover:bg-neutral-900">
				← Back to Library
			  </Link>
			</div>

			{/* Meta + Mode row */}
			<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
			  <div className="md:col-span-2 p-4 rounded-xl border border-neutral-800 bg-neutral-950">
				<div className="flex items-center gap-3 mb-3">
				  <label className="text-sm font-medium">Team Name</label>
				  <span className="text-xs text-neutral-500">(public display)</span>
				</div>
				<input className="w-full rounded-md px-3 py-2 bg-neutral-950 border border-neutral-800" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g., Marine Bunkering Team v1" />
				<div className="mt-4">
				  <div className="flex items-center gap-3 mb-2">
					<label className="text-sm font-medium">Context</label>
					<span className="text-xs text-neutral-500">(optional)</span>
				  </div>
				  <input className="w-full rounded-md px-3 py-2 bg-neutral-950 border border-neutral-800" value={context} onChange={e => setContext(e.target.value)} placeholder="e.g., Desk Ops EU" />
				</div>
				<div className="mt-4">
				  <div className="flex items-center gap-3 mb-2">
					<label className="text-sm font-medium">Tags</label>
					<span className="text-xs text-neutral-500">(comma or # separated)</span>
				  </div>
				  <input className="w-full rounded-md px-3 py-2 bg-neutral-950 border border-neutral-800" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="#marine, #eu" />
				</div>
			  </div>

			  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950">
				<div className="text-sm font-medium mb-3">Mode</div>
				<div className="flex gap-2">
				  <button onClick={() => { setMode('A'); setStep(1); }} className={cls('px-3 py-2 rounded-md text-sm border', mode === 'A' ? 'bg-white text-black border-white' : 'border-neutral-700 hover:bg-neutral-900')}>A — Known Individuals</button>
				  <button onClick={() => { setMode('B'); setStep(1); }} className={cls('px-3 py-2 rounded-md text-sm border', mode === 'B' ? 'bg-white text-black border-white' : 'border-neutral-700 hover:bg-neutral-900')}>B — Role / Domain</button>
				</div>
				<div className="text-xs text-neutral-500 mt-3">Step {step} of 3</div>
			  </div>
			</div>

			{/* Mode sections */}
			<div className="mt-6 grid grid-cols-1 gap-4">
			  {mode === 'B' ? (
				<div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950">
				  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
					<Field label="Role"><input className="input" value={role} onChange={e => setRole(e.target.value)} /></Field>
					<Field label="Sector"><input className="input" value={sector} onChange={e => setSector(e.target.value)} /></Field>
					<Field label="Geo"><input className="input" value={geo} onChange={e => setGeo(e.target.value)} /></Field>
					<Field label="Org Type"><input className="input" value={orgType} onChange={e => setOrgType(e.target.value)} /></Field>
					<Field label="Limit"><input className="input" type="number" value={limit} onChange={e => setLimit(e.target.value)} /></Field>
				  </div>

				  {step === 1 && (
					<div className="mt-4">
					  <button onClick={onFetchCandidates} disabled={loadingCandidates} className="btn">
						{loadingCandidates ? 'Loading…' : 'Find Candidates'}
					  </button>
					</div>
				  )}

				  {step >= 2 && (
					<>
					  <div className="mt-5 text-sm font-medium">Candidates</div>
					  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{candidates.map((c, idx) => (
						  <label key={idx} className={cls('rounded-lg border p-3 cursor-pointer', selected[idx] ? 'border-white bg-neutral-900/50' : 'border-neutral-800')}>
							<input type="checkbox" className="mr-2" checked={!!selected[idx]} onChange={() => setSelected(s => ({ ...s, [idx]: !s[idx] }))} />
							<div className="font-medium text-sm">{c.name || '—'}</div>
							<div className="text-xs text-neutral-500">{c.title || '—'}</div>
							<div className="text-xs text-neutral-500">{c.company || '—'}</div>
							{c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">LinkedIn</a>}
						  </label>
						))}
					  </div>

					  <div className="mt-4">
						<button onClick={onGeneratePersonas} disabled={loadingResearch || selectedCandidates.length === 0} className="btn">
						  {loadingResearch ? 'Generating…' : 'Generate Personas'}
						</button>
					  </div>
					</>
				  )}
				</div>
			  ) : (
				<div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950">
				  <div className="text-sm font-medium mb-3">Known Individuals</div>
				  {people.map((p, i) => (
					<div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2 items-center">
					  <div className="md:col-span-2">
						<label className="label">Name</label>
						<input className="input" value={p.name} onChange={e => updatePerson(i, 'name', e.target.value)} placeholder="Jane Doe" />
					  </div>
					  <div className="md:col-span-3">
						<label className="label">LinkedIn URL</label>
						<input className="input" value={p.linkedin_url} onChange={e => updatePerson(i, 'linkedin_url', e.target.value)} placeholder="https://www.linkedin.com/in/…" />
					  </div>
					  <div className="md:col-span-5 flex justify-end">
						{people.length > 1 && <button className="text-xs text-red-400 hover:underline" onClick={() => removePersonRow(i)}>Remove</button>}
					  </div>
					</div>
				  ))}
				  <div className="mt-2 flex gap-2">
					<button className="btn-secondary" onClick={addPersonRow}>+ Add Person</button>
					<button className="btn" onClick={onGeneratePersonas} disabled={loadingResearch}>
					  {loadingResearch ? 'Generating…' : 'Generate Personas'}
					</button>
				  </div>
				</div>
			  )}
			</div>

			{/* Preview + Save */}
			{step === 3 && (
			  <div className="mt-6 p-4 rounded-xl border border-neutral-800 bg-neutral-950">
				<div className="flex items-center justify-between">
				  <div className="text-sm font-medium">Preview ({personasPreview.length})</div>
				  <button className="text-xs underline" onClick={() => setStep(2)}>← Back</button>
				</div>
				<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				  {personasPreview.map((p, i) => (
					<div key={i} className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
					  <div className="font-semibold text-sm">{p.name}</div>
					  <div className="text-xs text-neutral-500">{p.role}</div>
					  <div className="text-xs mt-2 line-clamp-3 text-neutral-400">
						{p?.data?.snapshot?.elevator || p?.data?.snapshot?.one_line || '—'}
					  </div>
					</div>
				  ))}
				</div>
				<div className="mt-4">
				  <button className="btn" onClick={onSave} disabled={saving || personasPreview.length === 0}>
					{saving ? 'Saving…' : 'Save Team'}
				  </button>
				  {saveResult && (
					<div className="mt-3 text-sm text-green-400">
					  Saved! Team ID: <code className="px-1 bg-neutral-900 rounded">{saveResult.set_id}</code>
					</div>
				  )}
				</div>
			  </div>
			)}

			{error && <div className="mt-4 text-sm text-red-400">{String(error)}</div>}
		  </div>
		</div>
	  </div>
	  {/* === IDENTICAL WRAPPER END === */}

	  {/* Local styles for inputs/buttons */}
	  <style jsx>{`
		.btn { font-weight: 600; border: 1px solid rgba(255,255,255,.12); padding: 8px 12px; border-radius: 8px; background: #fff; color: #000; }
		.btn-secondary { font-weight: 600; border: 1px dashed rgba(255,255,255,.18); padding: 8px 12px; border-radius: 8px; color: #fff; }
		.label { font-size: 12px; color: rgba(255,255,255,.55); margin-bottom: 6px; display:block; }
		.input { width: 100%; border: 1px solid rgba(255,255,255,.12); background: #0b0d10; border-radius: 8px; padding: 8px 10px; }
	  `}</style>
	</PersonaLayout>
  );
}

function Field({ label, children }) {
  return (
	<div>
	  <div className="label">{label}</div>
	  {children}
	  <style jsx>{`
		.label { font-size: 12px; color: rgba(255,255,255,.55); margin-bottom: 6px; }
	  `}</style>
	</div>
  );
}