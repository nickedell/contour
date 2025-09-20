/**
 * Contour — Personas: New
 * Route: /personas/new
 * - No right button in the sticky strip (we pass rightSlot={null})
 * - Top toggle: Persona | Team
 * - Team: 2 cols x 3 inputs (Team Name, Context, Tags, Company, Location, Department)
 *   -> Second toggle: Roles | Individuals
 * - Persona: First toggle: Roles | Individuals, then Context + optional Company/Location (no team docking)
 */

import * as React from 'react'
import Link from 'next/link'
import SiteLayout from '@/components/layout/SiteLayout'
import PersonaLayout from '@/components/personas/PersonaLayout'
import { getCandidates, researchKnownIndividuals, saveTeam } from '../../lib/n8n'

/* --------------------------------- helpers --------------------------------- */
const cls = (...xs) => xs.filter(Boolean).join(' ')
const parseTags = (s) => (s || '').split(/[,#]/g).map(t => t.trim()).filter(Boolean)

function Field({ label, hint, children, className }) {
  return (
	<div className={className}>
	  <div className="flex items-center gap-2 mb-1.5">
		<label className="text-sm font-medium">{label}</label>
		{hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
	  </div>
	  {children}
	</div>
  )
}

/** TextInput that forwards refs (for uncontrolled inputs) */
const TextInput = React.forwardRef(function TextInputBase(props, ref) {
  return (
	<input
	  ref={ref}
	  {...props}
	  className={cls(
		'w-full rounded-md px-3 py-2 text-sm',
		'bg-neutral-950 border border-neutral-800',
		'placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20',
		props.className
	  )}
	/>
  )
})

function PillButton({ children, variant = 'ghost', className, ...rest }) {
  const base = 'px-3 py-1.5 text-sm rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20'
  const styles = variant === 'solid'
	? 'bg-white text-black font-semibold border border-white hover:opacity-90'
	: 'text-neutral-200 border border-white/10 hover:bg-white/5'
  return (
	<button {...rest} className={cls(base, styles, className)}>{children}</button>
  )
}

/* Rows for Role- and Individual-based selection */
function RoleRows({ rows, setRows }) {
  const update = (i, key, val) => setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)))
  const add = () => setRows(prev => [...prev, { role: '', sector: '' }])
  const remove = (i) => setRows(prev => prev.filter((_, idx) => idx !== i))
  return (
	<div>
	  <div className="text-sm font-medium mb-2">Roles</div>
	  {rows.map((r, i) => (
		<div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2 items-center">
		  <div className="md:col-span-3">
			<div className="text-[12px] text-neutral-500 mb-1">Role</div>
			<TextInput value={r.role} onChange={e => update(i, 'role', e.target.value)} placeholder="e.g., Marketer" />
		  </div>
		  <div className="md:col-span-2">
			<div className="text-[12px] text-neutral-500 mb-1">Sector (optional)</div>
			<TextInput value={r.sector} onChange={e => update(i, 'sector', e.target.value)} placeholder="e.g., Marine" />
		  </div>
		  <div className="md:col-span-5 flex justify-end">
			{rows.length > 1 && (
			  <button className="text-xs text-red-400 hover:underline" onClick={() => remove(i)}>
				Remove
			  </button>
			)}
		  </div>
		</div>
	  ))}
	  <PillButton onClick={add}>+ Add role</PillButton>
	</div>
  )
}

function IndividualRows({ rows, setRows }) {
  const update = (i, key, val) => setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)))
  const add = () => setRows(prev => [...prev, { name: '', linkedin_url: '' }])
  const remove = (i) => setRows(prev => prev.filter((_, idx) => idx !== i))
  return (
	<div>
	  <div className="text-sm font-medium mb-2">Known Individuals</div>
	  {rows.map((p, i) => (
		<div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2 items-center">
		  <div className="md:col-span-2">
			<div className="text-[12px] text-neutral-500 mb-1">Name</div>
			<TextInput value={p.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Jane Doe" />
		  </div>
		  <div className="md:col-span-3">
			<div className="text-[12px] text-neutral-500 mb-1">LinkedIn URL</div>
			<TextInput value={p.linkedin_url} onChange={e => update(i, 'linkedin_url', e.target.value)} placeholder="https://www.linkedin.com/in/…" />
		  </div>
		  <div className="md:col-span-5 flex justify-end">
			{rows.length > 1 && (
			  <button className="text-xs text-red-400 hover:underline" onClick={() => remove(i)}>
				Remove
			  </button>
			)}
		  </div>
		</div>
	  ))}
	  <PillButton onClick={add}>+ Add person</PillButton>
	</div>
  )
}

/* ------------------------------- main component ------------------------------ */

function NewPage() {
  // Top toggle
  const [entityType, setEntityType] = React.useState('team') // 'team' | 'persona'

  // Uncontrolled refs (placeholders vanish on focus)
  const geoRef = React.useRef(null)
  const orgTypeRef = React.useRef(null)
  const limitRef = React.useRef(null)

  // TEAM meta (6 fields, 2x3)
  const [teamName, setTeamName] = React.useState('')
  const [context, setContext] = React.useState('')
  const [tagsInput, setTagsInput] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [department, setDepartment] = React.useState('') // suggested extra

  // PERSONA meta (no docking): context + optional company/location
  const [personaContext, setPersonaContext] = React.useState('')
  const [personaCompany, setPersonaCompany] = React.useState('')
  const [personaLocation, setPersonaLocation] = React.useState('')

  // Method toggles
  const [teamMethod, setTeamMethod] = React.useState('roles')       // 'roles' | 'individuals'
  const [personaMethod, setPersonaMethod] = React.useState('roles') // 'roles' | 'individuals'

  // Rows data
  const [teamRoleRows, setTeamRoleRows] = React.useState([{ role: '', sector: '' }])
  const [teamIndividuals, setTeamIndividuals] = React.useState([{ name: '', linkedin_url: '' }])
  const [personaRoleRows, setPersonaRoleRows] = React.useState([{ role: '', sector: '' }])
  const [personaIndividuals, setPersonaIndividuals] = React.useState([{ name: '', linkedin_url: '' }])

  // Candidates / preview
  const [loadingCandidates, setLoadingCandidates] = React.useState(false)
  const [candidates, setCandidates] = React.useState([])
  const [selected, setSelected] = React.useState({})
  const selectedCandidates = React.useMemo(
	() => candidates.filter((_, i) => selected[i]),
	[candidates, selected]
  )

  const [loadingResearch, setLoadingResearch] = React.useState(false)
  const [preview, setPreview] = React.useState([])

  // Save
  const [saving, setSaving] = React.useState(false)
  const [saveResult, setSaveResult] = React.useState(null)
  const [error, setError] = React.useState(null)

  // Debug: show what we post to the webhook
  const [debugPayload, setDebugPayload] = React.useState(null)

  /* ------------------------------ actions / flow ----------------------------- */

  async function onFindCandidates(e) {
	e?.preventDefault?.();
	setError(null);
	setLoadingCandidates(true);
	try {
	  // Read uncontrolled values
	  const geo = (geoRef.current?.value || '').trim()
	  const orgType = (orgTypeRef.current?.value || '').trim()
	  const limit = Number(limitRef.current?.value || '') || 20

	  const meta = {
		geo,
		org_type: orgType,
		limit,
		// TEAM meta
		context,
		tags: tagsInput,
		company,
		location,
		department,
		// PERSONA meta (fallbacks if you’re in persona mode)
		personaContext,
		personaCompany,
		personaLocation,
	  };

	  if ((entityType === 'team' && teamMethod === 'roles') ||
		  (entityType === 'persona' && personaMethod === 'roles')) {
		const rows = entityType === 'team' ? teamRoleRows : personaRoleRows;

		// Choose which context to send (team vs persona)
		meta.context = entityType === 'team' ? context : (personaContext || '');
		meta.company = entityType === 'team' ? company : (personaCompany || '');
		meta.location = entityType === 'team' ? location : (personaLocation || '');

		// Build final payload
		const payloadForWebhook = {
		  roles: (rows || [])
			.map(r => ({ role: String(r.role||'').trim(), sector: String(r.sector||'').trim() }))
			.filter(r => r.role),
		  geo: meta.geo,
		  org_type: meta.org_type,
		  limit: meta.limit,
		  context: meta.context,
		  tags: Array.isArray(meta.tags) ? meta.tags : String(meta.tags||'').split(/[,#]/g).map(t=>t.trim()).filter(Boolean),
		  company: meta.company,
		  location: meta.location,
		  department: meta.department,
		};

		// Debug view + console
		setDebugPayload(payloadForWebhook);
		// eslint-disable-next-line no-console
		console.log('[FindCandidates] payload', payloadForWebhook);

		// Call webhook client
		const out = await getCandidates(payloadForWebhook);

		const list = Array.isArray(out?.candidates) ? out.candidates : [];
		setCandidates(list);

		// Preselect a handful
		const seed = {};
		list.slice(0, Math.min(list.length, 6)).forEach((_, i) => { seed[i] = true; });
		setSelected(seed);
	  } else {
		// Individuals mode → we skip candidates fetch (we’ll generate directly)
		setCandidates([]);
		setSelected({});
	  }
	} catch (err) {
	  setError(err?.message || 'Failed to fetch candidates');
	} finally {
	  setLoadingCandidates(false);
	}
  }

  async function onGenerate() {
	setError(null)
	setLoadingResearch(true)
	try {
	  const isTeam = entityType === 'team'
	  const method = isTeam ? teamMethod : personaMethod

	  // Read uncontrolled geo for PersonaMaker too
	  const geo = (geoRef.current?.value || '').trim()

	  let payload
	  if (method === 'roles') {
		const rows = isTeam ? teamRoleRows : personaRoleRows
		const r0 = rows[0] || { role: '', sector: '' }
		// If we came via Roles, use any candidates user ticked; fall back to role keywords
		const peoplePayload = selectedCandidates.map(c => ({ name: c.name || '', linkedin_url: c.linkedin_url || '' }))
		payload = {
		  people: peoplePayload,
		  role_keywords: [r0.role].filter(Boolean),
		  sector: r0.sector || '',
		  geo,
		  similar_profiles_count: Math.max(6, peoplePayload.length || 6),
		  evidence_mode: true
		}
	  } else {
		// Individuals mode
		const rows = isTeam ? teamIndividuals : personaIndividuals
		const peoplePayload = rows.filter(p => p.name || p.linkedin_url)
		if (peoplePayload.length === 0) throw new Error('Add at least one person.')
		payload = {
		  people: peoplePayload,
		  role_keywords: [],
		  sector: '',
		  geo,
		  similar_profiles_count: Math.min(peoplePayload.length * 2, 12),
		  evidence_mode: true
		}
	  }

	  const resp = await researchKnownIndividuals(payload)
	  const raw = Array.isArray(resp?.personas) ? resp.personas : []
	  const mapped = raw.map(p => ({
		name: p.display_name || p.name || 'Persona',
		role: p.role || (entityType === 'team' ? (teamRoleRows[0]?.role || '') : (personaRoleRows[0]?.role || '')),
		tags: [],
		data: p
	  }))
	  setPreview(mapped)
	} catch (err) {
	  setError(err?.message || 'Failed to generate personas')
	} finally {
	  setLoadingResearch(false)
	}
  }

  async function onSaveTeam() {
	setError(null)
	setSaving(true)
	try {
	  const tags = parseTags(tagsInput)
	  const res = await saveTeam({
		set: {
		  name: teamName,
		  context,
		  tags,
		  company,
		  location,
		  department
		},
		personas: preview.map(p => ({ name: p.name, role: p.role, tags: p.tags || [], data: p.data }))
	  })
	  setSaveResult(res)
	} catch (err) {
	  setError(err?.message || 'Save failed')
	} finally {
	  setSaving(false)
	}
  }

  /* ----------------------------------- UI ----------------------------------- */

  // Top: page title + primary entity toggle
  const teamActive = entityType === 'team'
  const personaActive = entityType === 'persona'

  return (
	<section>
	  {/* Heading */}
	  <div className="mb-4 flex items-center justify-between">
		<h1 className="text-xl font-bold tracking-tight">New</h1>
	  </div>

	  {/* Top toggle: Persona | Team */}
	  <div className="mb-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		<div className="text-sm font-medium mb-3">What do you want to create?</div>
		<div className="flex gap-2">
		  <PillButton variant={personaActive ? 'solid' : 'ghost'} onClick={() => setEntityType('persona')}>
			Persona
		  </PillButton>
		  <PillButton variant={teamActive ? 'solid' : 'ghost'} onClick={() => setEntityType('team')}>
			Team
		  </PillButton>
		</div>
	  </div>

	  {/* TEAM FLOW */}
	  {teamActive && (
		<>
		  {/* Meta: 2 columns, 3 inputs per column */}
		  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			  <Field label="Team Name" hint="public display">
				<TextInput value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g., Marine Bunkering Team" />
			  </Field>
			  <Field className="mt-4" label="Context" hint="optional">
				<TextInput value={context} onChange={e => setContext(e.target.value)} placeholder="e.g., Desk Ops EU" />
			  </Field>
			  <Field className="mt-4" label="Tags" hint="comma or # separated">
				<TextInput value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="#marine, #eu" />
			  </Field>
			</div>

			<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			  <Field label="Company" hint="optional">
				<TextInput value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Contoso Energy" />
			  </Field>
			  <Field className="mt-4" label="Location" hint="optional">
				<TextInput value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., London" />
			  </Field>
			  <Field className="mt-4" label="Department" hint="optional">
				<TextInput value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g., Trading" />
			  </Field>
			</div>
		  </div>

		  {/* Method toggle */}
		  <div className="mt-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			<div className="flex flex-wrap items-center gap-2">
			  <div className="text-sm font-medium">How do you want to research them?</div>
			  <PillButton
				variant={teamMethod === 'roles' ? 'solid' : 'ghost'}
				className="ml-2"
				onClick={() => setTeamMethod('roles')}
			  >
				Roles
			  </PillButton>
			  <PillButton
				variant={teamMethod === 'individuals' ? 'solid' : 'ghost'}
				onClick={() => setTeamMethod('individuals')}
			  >
				Individuals
			  </PillButton>
			  {/* global knobs (uncontrolled) */}
			  <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
				<span>Location</span>
				<TextInput
				  ref={geoRef}
				  defaultValue=""
				  placeholder="EU"
				  className="w-24 h-8 py-1 focus:placeholder-transparent"
				/>
				<span>Domain</span>
				<TextInput
				  ref={orgTypeRef}
				  defaultValue=""
				  placeholder="Energy"
				  className="w-28 h-8 py-1 focus:placeholder-transparent"
				/>
				<span>Limit</span>
				<TextInput
				  ref={limitRef}
				  type="number"
				  defaultValue=""
				  placeholder="20"
				  className="w-20 h-8 py-1 focus:placeholder-transparent"
				/>
			  </div>
			</div>

			<div className="mt-4">
			  {teamMethod === 'roles'
				? <RoleRows rows={teamRoleRows} setRows={setTeamRoleRows} />
				: <IndividualRows rows={teamIndividuals} setRows={setTeamIndividuals} />
			  }
			</div>

			<div className="mt-4">
			  <PillButton onClick={onFindCandidates} disabled={loadingCandidates}>
				{loadingCandidates ? 'Loading…' : 'Find Candidates (optional)'}
			  </PillButton>
			</div>
		  </div>
		</>
	  )}

	  {/* PERSONA FLOW */}
	  {personaActive && (
		<>
		  {/* Method first */}
		  <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			<div className="flex flex-wrap items-center gap-2">
			  <div className="text-sm font-medium">How do you want to research this persona?</div>
			  <PillButton
				variant={personaMethod === 'roles' ? 'solid' : 'ghost'}
				className="ml-2"
				onClick={() => setPersonaMethod('roles')}
			  >
				Roles
			  </PillButton>
			  <PillButton
				variant={personaMethod === 'individuals' ? 'solid' : 'ghost'}
				onClick={() => setPersonaMethod('individuals')}
			  >
				Individuals
			  </PillButton>

			  <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
				<span>Location</span>
				<TextInput
				  ref={geoRef}
				  defaultValue=""
				  placeholder="EU"
				  className="w-24 h-8 py-1 focus:placeholder-transparent"
				/>
				<span>Domain</span>
				<TextInput
				  ref={orgTypeRef}
				  defaultValue=""
				  placeholder="Energy"
				  className="w-28 h-8 py-1 focus:placeholder-transparent"
				/>
				<span>Limit</span>
				<TextInput
				  ref={limitRef}
				  type="number"
				  defaultValue=""
				  placeholder="20"
				  className="w-20 h-8 py-1 focus:placeholder-transparent"
				/>
			  </div>
			</div>

			<div className="mt-4">
			  {personaMethod === 'roles'
				? <RoleRows rows={personaRoleRows} setRows={setPersonaRoleRows} />
				: <IndividualRows rows={personaIndividuals} setRows={setPersonaIndividuals} />
			  }
			</div>

			<div className="mt-4">
			  <PillButton onClick={onFindCandidates} disabled={loadingCandidates}>
				{loadingCandidates ? 'Loading…' : 'Find Candidates (optional)'}
			  </PillButton>
			</div>
		  </div>

		  {/* Context + optional org info */}
		  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
			<div className="md:col-span-3 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<Field label="Context" hint="optional">
				  <TextInput value={personaContext} onChange={e => setPersonaContext(e.target.value)} placeholder="e.g., Working with channel partners" />
				</Field>
				<Field label="Company" hint="optional">
				  <TextInput value={personaCompany} onChange={e => setPersonaCompany(e.target.value)} placeholder="e.g., Contoso Energy" />
				</Field>
				<Field label="Location" hint="optional">
				  <TextInput value={personaLocation} onChange={e => setPersonaLocation(e.target.value)} placeholder="e.g., London" />
				</Field>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Candidates (if any were fetched) */}
	  {(candidates.length > 0) && (
		<div className="mt-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		  <div className="text-sm font-medium mb-2">Candidates</div>
		  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{candidates.map((c, idx) => (
			  <label
				key={idx}
				className={cls(
				  'rounded-lg border p-3 cursor-pointer transition',
				  selected[idx] ? 'border-white bg-neutral-900/50' : 'border-neutral-800 hover:bg-neutral-900/30'
				)}
			  >
				<input
				  type="checkbox"
				  className="mr-2 accent-neutral-400"
				  checked={!!selected[idx]}
				  onChange={() => setSelected(s => ({ ...s, [idx]: !s[idx] }))}
				/>
				<div className="font-medium text-sm">{c.name || '—'}</div>
				<div className="text-xs text-neutral-500">{c.title || '—'}</div>
				<div className="text-xs text-neutral-500">{c.company || '—'}</div>
				{c.linkedin_url && (
				  <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
					LinkedIn
				  </a>
				)}
			  </label>
			))}
		  </div>
		</div>
	  )}

	  {/* Generate + Preview */}
	  <div className="mt-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		<div className="flex items-center justify-between">
		  <div className="text-sm font-medium">Generate</div>
		  <div className="text-xs text-neutral-500">
			{entityType === 'team' ? 'Generate a team of personas' : 'Generate a single persona'}
		  </div>
		</div>
		<div className="mt-3">
		  <PillButton onClick={onGenerate} disabled={loadingResearch}>
			{loadingResearch ? 'Generating…' : (entityType === 'team' ? 'Generate Personas' : 'Generate Persona')}
		  </PillButton>
		</div>

		{preview.length > 0 && (
		  <>
			<div className="mt-5 text-sm font-medium">
			  Preview ({preview.length})
			</div>
			<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			  {preview.map((p, i) => (
				<div key={i} className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
				  <div className="font-semibold text-sm">{p.name}</div>
				  <div className="text-xs text-neutral-500">{p.role || '—'}</div>
				  <div className="text-xs mt-2 line-clamp-3 text-neutral-400">
					{p?.data?.snapshot?.elevator || p?.data?.snapshot?.one_line || '—'}
				  </div>
				</div>
			  ))}
			</div>
		  </>
		)}
	  </div>

	  {/* Save (only for Team; Persona save depends on your API) */}
	  {entityType === 'team' && (
		<div className="mt-6">
		  <PillButton variant="solid" onClick={onSaveTeam} disabled={preview.length === 0 || saving}>
			{saving ? 'Saving…' : 'Save Team'}
		  </PillButton>
		  {saveResult && (
			<div className="mt-3 text-sm text-green-400">
			  Saved! Team ID: <code className="px-1 bg-neutral-900 rounded">{saveResult.set_id}</code>
			  {' '}<Link className="underline" href={`/personas/set/${saveResult.set_id}`}>open</Link>
			</div>
		  )}
		</div>
	  )}

	  {/* Debug payload */}
	  {debugPayload && (
		<details className="mt-6 rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
		  <summary className="cursor-pointer text-sm font-medium">Debug · Webhook request payload</summary>
		  <pre className="mt-3 text-xs whitespace-pre-wrap break-all">
			{JSON.stringify(debugPayload, null, 2)}
		  </pre>
		</details>
	  )}

	  {error && <div className="mt-4 text-sm text-red-400">{String(error)}</div>}
	</section>
  )
}

/* Compose SiteLayout + PersonaLayout, with NO right-slot button for this page */
NewPage.getLayout = (page) => (
  <SiteLayout>
	<PersonaLayout
	  breadcrumbs={[
		{ label: 'Personas' },
		{ href: '/personas', label: 'Teams & Personas' },
		{ label: 'New' },
	  ]}
	  rightSlot={null}
	>
	  {page}
	</PersonaLayout>
  </SiteLayout>
)

export default NewPage