// pages/personas/new.js
import * as React from 'react';
import Link from 'next/link';
import { n8n } from '../../lib/n8n';

function cls(...xs) { return xs.filter(Boolean).join(' '); }
function parseTags(s) {
  return (s || '')
	.split(/[,#]/g)
	.map(t => t.trim())
	.filter(Boolean);
}

export default function PersonaSetBuilderPage() {
  const [mode, setMode] = React.useState('B'); // 'A' | 'B'
  const [step, setStep] = React.useState(1);   // 1=form, 2=review/generate, 3=save

  // Set meta
  const [setName, setSetName] = React.useState('New Persona Set');
  const [context, setContext] = React.useState('');
  const [tagsInput, setTagsInput] = React.useState('');

  // Mode B fields
  const [role, setRole] = React.useState('Marketer');
  const [sector, setSector] = React.useState('Marine');
  const [geo, setGeo] = React.useState('EU');
  const [orgType, setOrgType] = React.useState('Energy');
  const [limit, setLimit] = React.useState(20);

  // Mode A fields
  const [people, setPeople] = React.useState([
	{ name: '', linkedin_url: '' },
  ]);

  // Candidates (Mode B)
  const [loadingCandidates, setLoadingCandidates] = React.useState(false);
  const [candidates, setCandidates] = React.useState([]);
  const [selected, setSelected] = React.useState({}); // id -> true

  // Personas preview (from research)
  const [loadingResearch, setLoadingResearch] = React.useState(false);
  const [personasPreview, setPersonasPreview] = React.useState([]); // normalized [{name, role, tags, data}, ...]

  // Save
  const [saving, setSaving] = React.useState(false);
  const [saveResult, setSaveResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const selectedCandidates = React.useMemo(
	() => candidates.filter((c, idx) => selected[idx]),
	[candidates, selected]
  );

  // Fetch Mode B candidates
  async function onFetchCandidates(e) {
	e?.preventDefault?.();
	setError(null);
	setLoadingCandidates(true);
	try {
	  const { candidates: list = [] } = await n8n.candidates({
		role, sector, geo, org_type: orgType, limit: Number(limit) || 20,
	  });
	  setCandidates(list);
	  // Preselect first 6 for convenience
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

  // Generate personas (Mode A or Mode B)
  async function onGeneratePersonas() {
	setError(null);
	setLoadingResearch(true);
	try {
	  let payload;
	  if (mode === 'B') {
		const peoplePayload = selectedCandidates.map(c => ({
		  name: c.name,
		  linkedin_url: c.linkedin_url || '',
		}));
		payload = {
		  people: peoplePayload,
		  role_keywords: [role].filter(Boolean),
		  sector, geo,
		  similar_profiles_count: peoplePayload.length || 6,
		  evidence_mode: true,
		};
	  } else {
		const peoplePayload = people.filter(p => p.name || p.linkedin_url);
		if (peoplePayload.length === 0) {
		  setLoadingResearch(false);
		  return setError('Add at least one person for Mode A.');
		}
		payload = {
		  people: peoplePayload,
		  role_keywords: [],
		  sector, geo,
		  similar_profiles_count: Math.min(peoplePayload.length * 2, 12),
		  evidence_mode: true,
		};
	  }

	  const resp = await n8n.research(payload);
	  const raw = Array.isArray(resp?.personas) ? resp.personas : [];
	  // Normalize preview
	  const preview = raw.map(p => ({
		name: p.display_name || p.name || 'Persona',
		role: p.role || role || '—',
		tags: [],
		data: p, // keep full evidence JSON
	  }));
	  setPersonasPreview(preview);
	  setStep(3);
	} catch (err) {
	  setError(err?.message || 'Failed to generate personas');
	} finally {
	  setLoadingResearch(false);
	}
  }

  // Save set + personas
  async function onSave() {
	setError(null);
	setSaving(true);
	try {
	  const tags = parseTags(tagsInput);
	  const out = await n8n.save({
		set: { name: setName, context, tags },
		personas: personasPreview.map(p => ({
		  name: p.name,
		  role: p.role,
		  tags: p.tags || [],
		  data: p.data,
		})),
	  });
	  setSaveResult(out);
	} catch (err) {
	  setError(err?.message || 'Save failed');
	} finally {
	  setSaving(false);
	}
  }

  // Helpers
  function updatePerson(i, field, val) {
	setPeople(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }
  function addPersonRow() {
	setPeople(prev => [...prev, { name: '', linkedin_url: '' }]);
  }
  function removePersonRow(i) {
	setPeople(prev => prev.filter((_, idx) => idx !== i));
  }

  return (
	<div className="min-h-screen px-5 py-6 max-w-6xl mx-auto">
	  <div className="flex items-center justify-between gap-4">
		<div>
		  <h1 className="text-2xl font-bold">New Persona Set</h1>
		  <p className="text-sm text-neutral-500 dark:text-neutral-400">
			Build personas via known individuals (Mode A) or role/domain search (Mode B).
		  </p>
		</div>
		<Link
		  href="/personas"
		  className="text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
		>
		  ← Back to Library
		</Link>
	  </div>

	  {/* Set Meta */}
	  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
		<div className="md:col-span-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
		  <div className="flex items-center gap-3 mb-3">
			<label className="text-sm font-medium">Persona Set Name</label>
			<span className="text-xs text-neutral-500">(public display)</span>
		  </div>
		  <input
			className="w-full rounded-md px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800"
			value={setName}
			onChange={e => setSetName(e.target.value)}
			placeholder="e.g., Marine Bunkering Team v1"
		  />
		  <div className="mt-4">
			<div className="flex items-center gap-3 mb-2">
			  <label className="text-sm font-medium">Context</label>
			  <span className="text-xs text-neutral-500">(optional)</span>
			</div>
			<input
			  className="w-full rounded-md px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800"
			  value={context}
			  onChange={e => setContext(e.target.value)}
			  placeholder="e.g., Desk Ops EU"
			/>
		  </div>
		  <div className="mt-4">
			<div className="flex items-center gap-3 mb-2">
			  <label className="text-sm font-medium">Tags</label>
			  <span className="text-xs text-neutral-500">(comma or # separated)</span>
			</div>
			<input
			  className="w-full rounded-md px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800"
			  value={tagsInput}
			  onChange={e => setTagsInput(e.target.value)}
			  placeholder="#marine, #eu"
			/>
		  </div>
		</div>

		<div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
		  <div className="text-sm font-medium mb-3">Mode</div>
		  <div className="flex gap-2">
			<button
			  onClick={() => { setMode('A'); setStep(1); }}
			  className={cls(
				'px-3 py-2 rounded-md text-sm border',
				mode === 'A'
				  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white'
				  : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900'
			  )}
			>
			  A — Known Individuals
			</button>
			<button
			  onClick={() => { setMode('B'); setStep(1); }}
			  className={cls(
				'px-3 py-2 rounded-md text-sm border',
				mode === 'B'
				  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white'
				  : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900'
			  )}
			>
			  B — Role / Domain
			</button>
		  </div>
		  <div className="text-xs text-neutral-500 mt-3">
			Step {step} of 3
		  </div>
		</div>
	  </div>

	  {/* Mode Forms */}
	  <div className="mt-6 grid grid-cols-1 gap-4">
		{mode === 'B' ? (
		  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
			<div className="grid grid-cols-1 md:grid-cols-5 gap-3">
			  <Field label="Role">
				<input className="input" value={role} onChange={e => setRole(e.target.value)} />
			  </Field>
			  <Field label="Sector">
				<input className="input" value={sector} onChange={e => setSector(e.target.value)} />
			  </Field>
			  <Field label="Geo">
				<input className="input" value={geo} onChange={e => setGeo(e.target.value)} />
			  </Field>
			  <Field label="Org Type">
				<input className="input" value={orgType} onChange={e => setOrgType(e.target.value)} />
			  </Field>
			  <Field label="Limit">
				<input className="input" type="number" value={limit} onChange={e => setLimit(e.target.value)} />
			  </Field>
			</div>

			{step === 1 && (
			  <div className="mt-4">
				<button
				  onClick={onFetchCandidates}
				  disabled={loadingCandidates}
				  className="btn"
				>
				  {loadingCandidates ? 'Loading…' : 'Find Candidates'}
				</button>
			  </div>
			)}

			{step >= 2 && (
			  <>
				<div className="mt-5 text-sm font-medium">Candidates</div>
				<div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				  {candidates.map((c, idx) => (
					<label
					  key={idx}
					  className={cls(
						'rounded-lg border p-3 cursor-pointer',
						selected[idx]
						  ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900/50'
						  : 'border-neutral-200 dark:border-neutral-800'
					  )}
					>
					  <input
						type="checkbox"
						className="mr-2"
						checked={!!selected[idx]}
						onChange={() =>
						  setSelected(s => ({ ...s, [idx]: !s[idx] }))
						}
					  />
					  <div className="font-medium text-sm">{c.name || '—'}</div>
					  <div className="text-xs text-neutral-500">{c.title || '—'}</div>
					  <div className="text-xs text-neutral-500">{c.company || '—'}</div>
					  {c.linkedin_url && (
						<a
						  href={c.linkedin_url}
						  target="_blank"
						  rel="noreferrer"
						  className="text-xs text-blue-600 hover:underline"
						>
						  LinkedIn
						</a>
					  )}
					</label>
				  ))}
				</div>

				<div className="mt-4">
				  <button
					onClick={onGeneratePersonas}
					disabled={loadingResearch || selectedCandidates.length === 0}
					className="btn"
				  >
					{loadingResearch ? 'Generating…' : 'Generate Personas'}
				  </button>
				</div>
			  </>
			)}
		  </div>
		) : (
		  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
			<div className="text-sm font-medium mb-3">Known Individuals</div>
			{people.map((p, i) => (
			  <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2 items-center">
				<div className="md:col-span-2">
				  <label className="label">Name</label>
				  <input
					className="input"
					value={p.name}
					onChange={e => updatePerson(i, 'name', e.target.value)}
					placeholder="Jane Doe"
				  />
				</div>
				<div className="md:col-span-3">
				  <label className="label">LinkedIn URL</label>
				  <input
					className="input"
					value={p.linkedin_url}
					onChange={e => updatePerson(i, 'linkedin_url', e.target.value)}
					placeholder="https://www.linkedin.com/in/…"
				  />
				</div>
				<div className="md:col-span-5 flex justify-end">
				  {people.length > 1 && (
					<button
					  className="text-xs text-red-600 hover:underline"
					  onClick={() => removePersonRow(i)}
					>
					  Remove
					</button>
				  )}
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

	  {/* Personas Preview + Save */}
	  {step === 3 && (
		<div className="mt-6 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
		  <div className="flex items-center justify-between">
			<div className="text-sm font-medium">Preview ({personasPreview.length})</div>
			<button className="text-xs underline" onClick={() => setStep(2)}>← Back</button>
		  </div>
		  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{personasPreview.map((p, i) => (
			  <div key={i} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950">
				<div className="font-semibold text-sm">{p.name}</div>
				<div className="text-xs text-neutral-500">{p.role}</div>
				<div className="text-xs mt-2 line-clamp-3 text-neutral-600 dark:text-neutral-400">
				  {p?.data?.snapshot?.elevator || p?.data?.snapshot?.one_line || '—'}
				</div>
			  </div>
			))}
		  </div>
		  <div className="mt-4">
			<button className="btn" onClick={onSave} disabled={saving || personasPreview.length === 0}>
			  {saving ? 'Saving…' : 'Save Persona Set'}
			</button>
			{saveResult && (
			  <div className="mt-3 text-sm text-green-600">
				Saved! Set ID: <code className="px-1 bg-neutral-100 dark:bg-neutral-900 rounded">{saveResult.set_id}</code>
			  </div>
			)}
		  </div>
		</div>
	  )}

	  {/* Errors */}
	  {error && (
		<div className="mt-4 text-sm text-red-600">{String(error)}</div>
	  )}

	  <style jsx global>{`
		.label { @apply text-xs text-neutral-500 block mb-1; }
		.input { @apply w-full rounded-md px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800; }
		.btn { @apply px-3 py-2 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black; }
		.btn-secondary { @apply px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700; }
	  `}</style>
	</div>
  );
}

function Field({ label, children }) {
  return (
	<div>
	  <div className="label">{label}</div>
	  {children}
	</div>
  );
}
