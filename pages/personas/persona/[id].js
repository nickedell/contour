/**
 * /personas/persona/[id] — Persona
 * Robust data loading:
 *  - Tries multiple endpoints
 *  - Accepts { persona: {...} } OR a root-level persona object
 * Breadcrumb: Personas / Personas & Teams / Persona
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import withPersonaLayout from '@/components/personas/withPersonaLayout'

async function fetchJson(url) {
  const res = await fetch(url)
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

// Try common API shapes until one works
async function loadPersonaById(id) {
  const candidates = [
	`/api/personas/persona/${id}`,
	`/api/personas/${id}`,
	`/api/persona/${id}`,
  ]
  for (const url of candidates) {
	const { ok, json } = await fetchJson(url)
	if (!ok) continue
	// accept either { persona: {...} } or a root object
	const persona = json?.persona ?? json
	if (persona && (persona.id || persona.name || persona.title)) {
	  return { persona, source: url }
	}
  }
  return { persona: null, source: null }
}

function PersonaProfilePage() {
  const router = useRouter()
  const { id } = router.query

  const [persona, setPersona] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [sourceTried, setSourceTried] = useState(null)

  useEffect(() => {
	if (!id) return
	let alive = true
	;(async () => {
	  try {
		setLoading(true)
		setErr('')
		const { persona: p, source } = await loadPersonaById(id)
		if (!alive) return
		setSourceTried(source)
		if (!p) throw new Error('Persona not found')
		setPersona(p)
	  } catch (e) {
		if (!alive) return
		setErr(e.message || 'Failed to load persona')
		setPersona(null)
	  } finally {
		if (!alive) return
		setLoading(false)
	  }
	})()
	return () => { alive = false }
  }, [id])

  // Normalised fields (be tolerant with naming)
  const name = persona?.name ?? persona?.title ?? 'Persona'
  const role = persona?.role ?? persona?.job_title ?? ''
  const summary = persona?.summary ?? persona?.data?.snapshot?.one_line ?? ''
  const tags = Array.isArray(persona?.tags) ? persona.tags : []
  const team = persona?.team || (persona?.set ? { id: persona.set.id, name: persona.set.name } : null)

  // Optional deep fields (only render if present)
  const background = persona?.data?.background || {}
  const behaviours = persona?.data?.behaviours || persona?.data?.behaviors || {}
  const motivations = persona?.data?.motivations || []
  const frustrations = persona?.data?.frustrations || []
  const goalsNear = persona?.data?.goals_near_term || []
  const goalsLong = persona?.data?.goals_long_term || []
  const opportunities = persona?.data?.opportunities || {}
  const quotes = persona?.data?.representative_quotes || []
  const evidence = persona?.data?.evidence || []

  return (
	<section>
	  {/* Title */}
	  <div className="mb-4">
		<h1 className="text-xl font-bold tracking-tight">Persona</h1>
	  </div>

	  {loading ? (
		<div className="mt-10 text-sm text-neutral-400">Loading…</div>
	  ) : err ? (
		<div className="mt-10 text-sm text-red-400">{err}</div>
	  ) : !persona ? (
		<div className="mt-10 text-sm text-neutral-400">Not found.</div>
	  ) : (
		<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
		  {/* Left: key facts */}
		  <div className="lg:col-span-1">
			<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			  <div className="text-sm font-semibold">{name}</div>
			  {role ? <div className="mt-1 text-xs text-neutral-500">{role}</div> : null}

			  {team?.id ? (
				<div className="mt-3 text-sm">
				  <span className="text-neutral-500">Team: </span>
				  <Link
					href={`/personas/set/${team.id}`}
					className="underline decoration-neutral-600 hover:text-neutral-200"
				  >
					{team.name || 'Team'}
				  </Link>
				</div>
			  ) : null}

			  {tags.length ? (
				<div className="mt-3 flex flex-wrap gap-1">
				  {tags.slice(0, 10).map((t) => (
					<span
					  key={t}
					  className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-700 text-neutral-300"
					>
					  #{t}
					</span>
				  ))}
				</div>
			  ) : null}

			  {sourceTried ? (
				<div className="mt-3 text-[11px] text-neutral-500">source: {sourceTried.replace(/^\/api/, 'api')}</div>
			  ) : null}
			</div>
		  </div>

		  {/* Right: narrative / details */}
		  <div className="lg:col-span-2">
			<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			  {/* Summary */}
			  <div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Summary</div>
			  {summary ? (
				<p className="text-sm text-neutral-300 leading-relaxed">{summary}</p>
			  ) : (
				<div className="text-sm text-neutral-400">No summary provided.</div>
			  )}

			  {/* Optional additional sections — render only if there is data */}
			  {hasAny(background) && (
				<Section title="Background">
				  <List title="Career path" items={background.career_path} />
				  <List title="Core skills" items={background.skills_core} />
				  <List title="Adjacent skills" items={background.skills_adjacent} />
				  <List title="Tools" items={background.tools_stack} />
				</Section>
			  )}

			  {hasAny(behaviours) && (
				<Section title="Behaviours">
				  <List title="Information sources" items={behaviours.information_sources} />
				  <List title="Decision style" items={behaviours.decision_style} />
				  <List title="Collaboration style" items={behaviours.collaboration_style} />
				</Section>
			  )}

			  {motivations?.length ? (
				<Section title="Motivations"><Bullets items={motivations} /></Section>
			  ) : null}

			  {frustrations?.length ? (
				<Section title="Frustrations"><Bullets items={frustrations} /></Section>
			  ) : null}

			  {goalsNear?.length ? (
				<Section title="Goals (near term)"><Bullets items={goalsNear} /></Section>
			  ) : null}

			  {goalsLong?.length ? (
				<Section title="Goals (long term)"><Bullets items={goalsLong} /></Section>
			  ) : null}

			  {hasAny(opportunities) && (
				<Section title="Opportunities">
				  <List title="Strategic" items={opportunities.strategic} />
				  <List title="Tactical" items={opportunities.tactical} />
				</Section>
			  )}

			  {quotes?.length ? (
				<Section title="Representative quotes">
				  <ul className="space-y-3">
					{quotes.map((q, i) => <li key={i} className="text-neutral-300">“{q.text || q}”</li>)}
				  </ul>
				</Section>
			  ) : null}

			  {evidence?.length ? (
				<Section title="Evidence">
				  <ul className="space-y-2 text-sm">
					{evidence.map((e, i) => (
					  <li key={i} className="text-neutral-300">
						{e.source_type ? <span className="text-neutral-500 mr-2">[{e.source_type}]</span> : null}
						{e.title || e.subject || String(e)}
					  </li>
					))}
				  </ul>
				</Section>
			  ) : null}
			</div>
		  </div>
		</div>
	  )}
	</section>
  )
}

export default withPersonaLayout(PersonaProfilePage, [
  { label: 'Personas' },
  { href: '/personas', label: 'Personas & Teams' },
  { label: 'Persona' },
])

/* helpers */
function Section({ title, children }) {
  return (
	<div className="mt-6 rounded-lg border border-neutral-800 p-4">
	  <div className="text-sm font-semibold mb-2 text-neutral-200">{title}</div>
	  <div className="text-sm text-neutral-300">{children}</div>
	</div>
  )
}
function List({ title, items }) {
  if (!items || !items.length) return null
  return (
	<div className="mb-3">
	  <div className="text-xs uppercase tracking-wide text-neutral-500">{title}</div>
	  <ul className="mt-1 list-disc pl-5 space-y-1">
		{items.map((x, i) => <li key={i}>{String(x)}</li>)}
	  </ul>
	</div>
  )
}
function Bullets({ items }) {
  if (!items || !items.length) return null
  return (
	<ul className="list-disc pl-5 space-y-1">
	  {items.map((x, i) => <li key={i}>{String(x)}</li>)}
	</ul>
  )
}
function hasAny(obj) {
  if (!obj) return false
  if (Array.isArray(obj)) return obj.length > 0
  if (typeof obj === 'object') return Object.keys(obj).some((k) => {
	const v = obj[k]
	return (Array.isArray(v) && v.length) || (!!v && typeof v === 'string') || typeof v === 'number'
  })
  return false
}