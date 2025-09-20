// pages/personas/new.js
'use client';

import React from 'react';
import Link from 'next/link';
import PersonaLayout from '@/components/personas/PersonaLayout';

const WEBHOOK_CANDIDATES =
  process.env.NEXT_PUBLIC_N8N_CANDIDATES_URL ||
  'https://nickedell.app.n8n.cloud/webhook/contour/personas/candidates';

/* ──────────────────────────────────────────────────────────────── */
/* Helpers                                                          */
/* ──────────────────────────────────────────────────────────────── */

const cls = (...a) => a.filter(Boolean).join(' ');
const isValidLinkedIn = (u = '') =>
  /^https?:\/\/([a-z]+\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+/i.test(String(u).trim());
const parseTags = (raw = '') =>
  String(raw)
	.split(/[,\s]+/)
	.map((t) => t.replace(/^#/, '').trim())
	.filter(Boolean);

/* ──────────────────────────────────────────────────────────────── */
/* Page                                                             */
/* ──────────────────────────────────────────────────────────────── */

export default function NewPersonaPage() {
  const [entityType, setEntityType] = React.useState('team');   // 'team' | 'persona'
  const [mode, setMode] = React.useState('roles');              // 'roles' | 'individuals'

  // Global knobs + prefs
  const geoRef = React.useRef(null);
  const orgTypeRef = React.useRef(null);
  const limitRef = React.useRef(null);
  const [companyPref, setCompanyPref] = React.useState('prefer'); // 'require'|'prefer'|'ignore'
  const [geoPref, setGeoPref] = React.useState('prefer');
  const [sectorPref, setSectorPref] = React.useState('prefer');
  const [recency, setRecency] = React.useState('year');           // hour|day|week|month|year

  // Team fields
  const teamNameRef = React.useRef(null);
  const contextRef = React.useRef(null);
  const tagsRef = React.useRef(null);
  const companyRef = React.useRef(null);
  const locationRef = React.useRef(null);
  const departmentRef = React.useRef(null);

  // Persona extras (used when entityType === 'persona')
  const personaContextRef = React.useRef(null);
  const personaCompanyRef = React.useRef(null);
  const personaLocationRef = React.useRef(null);

  // Roles mode rows
  const [rows, setRows] = React.useState([{ role: '', sector: '' }]);
  const updateRow = (i, k, v) => setRows(r => r.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const addRow = () => setRows(r => [...r, { role: '', sector: '' }]);
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  // Look-alike seeds
  const [seedRows, setSeedRows] = React.useState([{ name: '', linkedin_url: '', title: '', company: '' }]);
  const updateSeed = (i, k, v) => setSeedRows(r => r.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const addSeed = () => setSeedRows(r => [...r, { name: '', linkedin_url: '', title: '', company: '' }]);
  const removeSeed = (i) => setSeedRows(r => r.filter((_, idx) => idx !== i));
  const validSeeds = () =>
	seedRows
	  .map((s) => ({
		name: (s.name || '').trim(),
		linkedin_url: (s.linkedin_url || '').trim().replace(/^http:/, 'https:'),
		title: (s.title || '').trim(),
		company: (s.company || '').trim(),
	  }))
	  .filter((s) => isValidLinkedIn(s.linkedin_url));

  // Results
  const [finding, setFinding] = React.useState(false);
  const [candidateResults, setCandidateResults] = React.useState([]);

  /* ────────────────────────────────────────────────────────────── */
  /* Build payload + call webhook                                   */
  /* ────────────────────────────────────────────────────────────── */

  function buildCandidatePayload() {
	const geo = (geoRef.current?.value || '').trim();
	const org_type = (orgTypeRef.current?.value || '').trim();
	const limit = Number(limitRef.current?.value) || 20;

	const base = { geo, org_type, limit, company_pref: companyPref, geo_pref: geoPref, sector_pref: sectorPref, recency };

	const common = {
	  company: (companyRef.current?.value || '').trim(),
	  location: (locationRef.current?.value || '').trim(),
	  department: (departmentRef.current?.value || '').trim(),
	  context: entityType === 'team'
		? (contextRef.current?.value || '').trim()
		: (personaContextRef.current?.value || '').trim(),
	  tags: parseTags(tagsRef.current?.value || ''),
	};

	if (mode === 'individuals') {
	  return {
		...base,
		...common,
		seeds: validSeeds(),
		roles: rows
		  .map(({ role, sector }) => ({ role: (role || '').trim(), sector: (sector || '').trim() }))
		  .filter((r) => r.role),
	  };
	}

	return {
	  ...base,
	  ...common,
	  roles: rows
		.map(({ role, sector }) => ({ role: (role || '').trim(), sector: (sector || '').trim() }))
		.filter((r) => r.role),
	};
  }

  async function handleFindCandidates() {
	try {
	  const payload = buildCandidatePayload();

	  if (mode === 'individuals' && (!payload.seeds || payload.seeds.length === 0)) {
		alert('Add at least one valid LinkedIn URL.');
		return;
	  }
	  if (mode === 'roles' && (!payload.roles || payload.roles.length === 0)) {
		alert('Add at least one role.');
		return;
	  }

	  setFinding(true);
	  const res = await fetch(WEBHOOK_CANDIDATES, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	  });
	  if (!res.ok) throw new Error(`Candidates request failed (${res.status}).`);
	  const data = await res.json();
	  const arr = Array.isArray(data) ? data : data?.raw ? JSON.parse(data.raw) : [];
	  setCandidateResults(arr);
	} catch (err) {
	  console.error(err);
	  alert(err.message || 'Failed to fetch candidates.');
	} finally {
	  setFinding(false);
	}
  }

  /* ──────────────────────────────────────────────────────────────── */
  /* UI                                                               */
  /* ──────────────────────────────────────────────────────────────── */

  return (
	<PersonaLayout
	  title="New"
	  rightActions={null}
	  breadcrumbs={[
		{ label: 'Personas', href: '/personas' },
		{ label: 'Teams & Personas', href: '/personas' },
		{ label: 'New' },
	  ]}
	>
	  {/* Entity toggle */}
	  <div className="mb-4 flex flex-wrap items-center gap-2">
		<div className="text-xs uppercase tracking-widest text-neutral-500">Create</div>
		<div className="flex items-center gap-1 border border-neutral-800 rounded-md overflow-hidden">
		  <button
			className={cls('px-3 py-1.5 text-sm', entityType === 'team' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-300 hover:bg-white/5')}
			onClick={() => setEntityType('team')}
		  >
			Team
		  </button>
		  <button
			className={cls('px-3 py-1.5 text-sm', entityType === 'persona' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-300 hover:bg-white/5')}
			onClick={() => setEntityType('persona')}
		  >
			Persona
		  </button>
		</div>
	  </div>

	  {/* ── Panel: Top info blocks (wrapped to match page chrome) ── */}
	  <div className="mb-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
		  {/* Left column */}
		  <div className="lg:col-span-6 space-y-4">
			{entityType === 'team' ? (
			  <>
				<Field label="Team Name" hint="public display">
				  <input ref={teamNameRef} className="field-input small" placeholder="e.g., Marine test 3" />
				</Field>
				<Field label="Context" hint="optional">
				  <input ref={contextRef} className="field-input small" placeholder="e.g., Desk Ops EU" />
				</Field>
				<Field label="Tags" hint="comma or # separated">
				  <input ref={tagsRef} className="field-input small" placeholder="#marine #bunkering" />
				</Field>
			  </>
			) : (
			  <>
				<Field label="Persona Context" hint="optional">
				  <input ref={personaContextRef} className="field-input small" placeholder="e.g., senior buyer, LNG focus" />
				</Field>
			  </>
			)}
		  </div>

		  {/* Right column */}
		  <div className="lg:col-span-6 space-y-4">
			<Field label="Company" hint="optional">
			  <input ref={entityType === 'team' ? companyRef : personaCompanyRef} className="field-input small" placeholder="e.g., bp" />
			</Field>
			<Field label="Location" hint="optional">
			  <input ref={entityType === 'team' ? locationRef : personaLocationRef} className="field-input small" placeholder="e.g., London" />
			</Field>
			<Field label="Department" hint="optional (team)">
			  <input ref={departmentRef} className="field-input small" placeholder="e.g., ST&S" />
			</Field>
		  </div>
		</div>
	  </div>

	  {/* ── Panel: Global knobs + preferences (same chrome) ── */}
	  <div className="mb-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
		  {/* Location */}
		  <div className="lg:col-span-4">
			<div className="text-xs text-neutral-400 mb-1">Location</div>
			<input ref={geoRef} className="field-input small h-9" placeholder="EU or London" />
		  </div>

		  {/* Domain */}
		  <div className="lg:col-span-4">
			<div className="text-xs text-neutral-400 mb-1">Domain</div>
			<input ref={orgTypeRef} className="field-input small h-9" placeholder="Energy" />
		  </div>

		  {/* Limit + Recency */}
		  <div className="lg:col-span-4 grid grid-cols-2 gap-4">
			<div>
			  <div className="text-xs text-neutral-400 mb-1">Limit</div>
			  <input ref={limitRef} className="field-input small h-9" placeholder="20" type="number" />
			</div>
			<div>
			  <div className="text-xs text-neutral-400 mb-1">Search recency</div>
			  <select
				value={recency}
				onChange={(e) => setRecency(e.target.value)}
				className="h-9 w-full bg-neutral-950 border border-neutral-800 rounded-md px-2 text-sm"
			  >
				<option value="hour">hour</option>
				<option value="day">day</option>
				<option value="week">week</option>
				<option value="month">month</option>
				<option value="year">year</option>
			  </select>
			</div>
		  </div>
		</div>

		{/* Advanced */}
		<details className="mt-4">
		  <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-200">
			Advanced preferences
		  </summary>
		  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
			<SelectPref
			  label="Company pref"
			  value={companyPref}
			  onChange={setCompanyPref}
			  tip="require = must match; prefer = boost matches; ignore = do not use company in filtering/scoring."
			/>
			<SelectPref
			  label="Geo pref"
			  value={geoPref}
			  onChange={setGeoPref}
			  tip="require = outside target geo excluded; prefer = in-geo boosted; ignore = geo not used."
			/>
			<SelectPref
			  label="Sector pref"
			  value={sectorPref}
			  onChange={setSectorPref}
			  tip="require = must match sector; prefer = sector matches score higher; ignore = sector not considered."
			/>
		  </div>
		</details>
	  </div>

	  {/* Mode toggle */}
	  <div className="mb-3 flex items-center gap-2">
		<div className="text-xs text-neutral-400">How do you want to research them?</div>
		<div className="flex items-center gap-1 border border-neutral-800 rounded-md overflow-hidden">
		  <button
			className={cls('px-3 py-1.5 text-sm', mode === 'roles' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-300 hover:bg-white/5')}
			onClick={() => setMode('roles')}
		  >
			Roles
		  </button>
		  <button
			className={cls('px-3 py-1.5 text-sm', mode === 'individuals' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-300 hover:bg-white/5')}
			onClick={() => setMode('individuals')}
		  >
			Individuals
		  </button>
		</div>
	  </div>

	  {/* Roles mode panel */}
	  {mode === 'roles' && (
		<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		  <div className="mb-3 text-sm font-semibold">Roles</div>
		  <div className="space-y-3">
			{rows.map((row, idx) => (
			  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3">
				<div className="md:col-span-6">
				  <div className="text-xs text-neutral-400 mb-1">Role</div>
				  <input
					value={row.role}
					onChange={(e) => updateRow(idx, 'role', e.target.value)}
					className="field-input small h-9"
					placeholder="e.g., analysts"
				  />
				</div>
				<div className="md:col-span-6">
				  <div className="text-xs text-neutral-400 mb-1">Sector (optional)</div>
				  <input
					value={row.sector}
					onChange={(e) => updateRow(idx, 'sector', e.target.value)}
					className="field-input small h-9"
					placeholder="e.g., marine bunkering"
				  />
				</div>
				<div className="md:col-span-12 flex justify-end">
				  {rows.length > 1 && (
					<button
					  type="button"
					  onClick={() => removeRow(idx)}
					  className="text-xs text-rose-300 hover:text-rose-200"
					>
					  Remove
					</button>
				  )}
				</div>
			  </div>
			))}
		  </div>

		  <div className="mt-3 flex items-center gap-3">
			<button
			  type="button"
			  onClick={addRow}
			  className="px-3 h-9 rounded-md border border-neutral-800 hover:bg-white/5 text-sm"
			>
			  + Add role
			</button>

			<button
			  type="button"
			  onClick={handleFindCandidates}
			  className="px-3 h-9 rounded-md text-sm bg-neutral-200 text-neutral-900 hover:bg-white"
			>
			  Find Candidates
			</button>
		  </div>
		</div>
	  )}

	  {/* Individuals (look-alike) panel */}
	  {mode === 'individuals' && (
		<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		  <div className="mb-3 text-sm font-semibold">Seed people (find look-alikes)</div>
		  <div className="space-y-3">
			{seedRows.map((row, idx) => (
			  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3">
				<div className="md:col-span-3">
				  <div className="text-xs text-neutral-400 mb-1">Name</div>
				  <input
					value={row.name}
					onChange={(e) => updateSeed(idx, 'name', e.target.value)}
					className="field-input small h-9"
					placeholder="e.g., Jodie Easter"
				  />
				</div>
				<div className="md:col-span-5">
				  <div className="flex items-center justify-between mb-1">
					<div className="text-xs text-neutral-400">LinkedIn URL</div>
					{!row.linkedin_url ? null : (
					  <span className={cls('text-[10px]', isValidLinkedIn(row.linkedin_url) ? 'text-emerald-400' : 'text-rose-400')}>
						{isValidLinkedIn(row.linkedin_url) ? 'valid' : 'invalid'}
					  </span>
					)}
				  </div>
				  <input
					value={row.linkedin_url}
					onChange={(e) => updateSeed(idx, 'linkedin_url', e.target.value)}
					className="field-input small h-9"
					placeholder="https://www.linkedin.com/in/…"
				  />
				</div>
				<div className="md:col-span-2">
				  <div className="text-xs text-neutral-400 mb-1">Title (optional)</div>
				  <input
					value={row.title}
					onChange={(e) => updateSeed(idx, 'title', e.target.value)}
					className="field-input small h-9"
					placeholder="e.g., Marine Originator"
				  />
				</div>
				<div className="md:col-span-2">
				  <div className="text-xs text-neutral-400 mb-1">Company (optional)</div>
				  <input
					value={row.company}
					onChange={(e) => updateSeed(idx, 'company', e.target.value)}
					className="field-input small h-9"
					placeholder="e.g., bp"
				  />
				</div>
				<div className="md:col-span-12 flex justify-end">
				  {seedRows.length > 1 && (
					<button
					  type="button"
					  onClick={() => removeSeed(idx)}
					  className="text-xs text-rose-300 hover:text-rose-200"
					>
					  Remove
					</button>
				  )}
				</div>
			  </div>
			))}
		  </div>

		  <div className="mt-3 flex items-center gap-3">
			<button
			  type="button"
			  onClick={addSeed}
			  className="px-3 h-9 rounded-md border border-neutral-800 hover:bg-white/5 text-sm"
			>
			  + Add person
			</button>

			<button
			  type="button"
			  onClick={handleFindCandidates}
			  disabled={validSeeds().length === 0}
			  className={cls(
				'px-3 h-9 rounded-md text-sm',
				validSeeds().length > 0
				  ? 'bg-neutral-200 text-neutral-900 hover:bg-white'
				  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
			  )}
			  title={validSeeds().length > 0 ? 'Find similar profiles' : 'Add at least one valid LinkedIn URL'}
			>
			  Find Candidates
			</button>
		  </div>
		</div>
	  )}

	  {/* Candidate results */}
	  <div className="mt-6">
		<div className="mb-2 flex items-center justify-between">
		  <h3 className="text-sm font-semibold">Candidates</h3>
		  {finding && <div className="text-xs text-neutral-400">Searching…</div>}
		</div>
		{candidateResults?.length ? (
		  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{candidateResults.map((c, i) => (
			  <li key={`${c.linkedin_url || i}`} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
				<div className="font-medium">{c.name || '—'}</div>
				<div className="text-sm text-neutral-300">{c.title || '—'}</div>
				<div className="text-xs text-neutral-400 mb-2">{c.company || '—'}</div>
				<div className="flex items-center gap-2 text-xs">
				  <a
					href={c.linkedin_url}
					target="_blank"
					rel="noreferrer"
					className="underline text-neutral-200 hover:text-white truncate"
					title={c.linkedin_url}
				  >
					LinkedIn
				  </a>
				  {typeof c.score === 'number' && <span className="ml-auto text-neutral-400">Score {c.score}</span>}
				</div>
			  </li>
			))}
		  </ul>
		) : (
		  <div className="text-sm text-neutral-400">No candidates yet.</div>
		)}
	  </div>

	  {/* Footer */}
	  <div className="mt-8 flex items-center justify-between text-xs text-neutral-400">
		<div>
		  <Link href="/personas" className="underline hover:text-neutral-200">Back to Teams & Personas</Link>
		</div>
		<div className="opacity-60">© Contour — Personas</div>
	  </div>

	  {/* Local input styling (smaller text, hide placeholder on focus) */}
	  <style jsx>{`
		.field-input {
		  width: 100%;
		  background: rgba(12,12,14,0.7);
		  border: 1px solid rgba(255,255,255,0.08);
		  border-radius: 10px;
		  padding: 0 10px;
		  height: 40px;
		  outline: none;
		  color: #e5e7eb;
		}
		.field-input.small {
		  height: 36px;
		  font-size: 0.85rem; /* smaller text inside the input */
		}
		.field-input::placeholder {
		  color: rgba(255,255,255,0.35);
		  transition: color .12s ease;
		}
		.field-input:focus {
		  border-color: rgba(255,255,255,0.18);
		}
		.field-input:focus::placeholder {
		  color: transparent; /* hide placeholder on focus */
		}
	  `}</style>
	</PersonaLayout>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Bits                                                             */
/* ──────────────────────────────────────────────────────────────── */

function Field({ label, hint, children }) {
  return (
	<label className="block">
	  <div className="flex items-center gap-2 mb-1">
		<div className="text-xs text-neutral-400">{label}</div>
		{hint ? <div className="text-[10px] text-neutral-500">{hint}</div> : null}
	  </div>
	  {children}
	</label>
  );
}

function SelectPref({ label, value, onChange, tip }) {
  return (
	<div>
	  <div className="flex items-center gap-2 mb-1">
		<div className="text-xs text-neutral-400">{label}</div>
		{tip ? (
		  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 cursor-help" title={tip}>
			?
		  </span>
		) : null}
	  </div>
	  <select
		value={value}
		onChange={(e) => onChange(e.target.value)}
		className="h-9 w-full bg-neutral-950 border border-neutral-800 rounded-md px-2 text-sm"
	  >
		<option value="require">require</option>
		<option value="prefer">prefer</option>
		<option value="ignore">ignore</option>
	  </select>
	</div>
  );
}