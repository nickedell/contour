/**
 * /personas — Teams & Personas (surgical tidy)
 * - Shows single-persona teams in the Personas column (when we can resolve the persona).
 * - Leaves the team visible while enrichment is pending/failed (no flicker/missing cards).
 */

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import withPersonaLayout from '@/components/personas/withPersonaLayout'

function PersonasLibraryPage() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  // Map of teamId -> resolved single persona (or null if we tried and failed)
  const [enrichedSingles, setEnrichedSingles] = useState({})
  const [enriching, setEnriching] = useState(false)

  // Load teams/sets
  useEffect(() => {
	let alive = true
	;(async () => {
	  try {
		setLoading(true)
		setErr('')
		const r = await fetch('/api/personas/sets')
		const json = await r.json()
		if (!r.ok || !Array.isArray(json)) throw new Error(json?.error || 'Failed to load teams/personas')
		if (alive) setSets(json)
	  } catch (e) {
		console.error(e)
		if (alive) {
		  setErr(e.message || 'Failed to load teams/personas')
		  setSets([])
		}
	  } finally {
		if (alive) setLoading(false)
	  }
	})()
	return () => { alive = false }
  }, [])

  // Enrich single-persona teams that don’t include the persona object
  useEffect(() => {
	const candidates = (sets || []).filter((s) => {
	  const count = typeof s.persona_count === 'number'
		? s.persona_count
		: Array.isArray(s.personas) ? s.personas.length : 0
	  const hasInline = Array.isArray(s.personas) && s.personas.length > 0
	  return count === 1 && !hasInline && enrichedSingles[s.id] === undefined
	})
	if (!candidates.length) return

	let alive = true
	setEnriching(true)
	;(async () => {
	  try {
		const fetched = await Promise.all(candidates.map(async (s) => {
		  try {
			const r = await fetch(`/api/personas/set/${s.id}`)
			const j = await r.json()
			if (!r.ok) throw new Error(j?.error || 'Fetch failed')
			const list = Array.isArray(j?.personas) ? j.personas : []
			return [s.id, (list[0] || null)]
		  } catch (e) {
			console.error('Enrich failed', s.id, e)
			return [s.id, null]
		  }
		}))
		if (!alive) return
		const delta = {}
		for (const [teamId, persona] of fetched) delta[teamId] = persona
		setEnrichedSingles((prev) => ({ ...prev, ...delta }))
	  } finally {
		if (alive) setEnriching(false)
	  }
	})()
	return () => { alive = false }
  }, [sets, enrichedSingles])

  // Build left/right columns
  const { personasLeft, teamsRight } = useMemo(() => {
	const left = []
	const right = []
	for (const s of sets || []) {
	  const inline = Array.isArray(s.personas) ? s.personas : []
	  const count = typeof s.persona_count === 'number' ? s.persona_count : inline.length

	  if (count === 1) {
		const persona = inline[0] || enrichedSingles[s.id] || null
		if (persona && persona.id) {
		  left.push({ ...persona, teamId: s.id, teamName: s.name })
		  // hide team when we truly have a single persona object
		  continue
		}
		// still waiting / failed → keep team visible so nothing disappears
		right.push(s)
		continue
	  }

	  right.push(s)
	}
	return { personasLeft: left, teamsRight: right }
  }, [sets, enrichedSingles])

  return (
	<section>
	  {/* Title */}
	  <div className="mb-4">
		<h1 className="text-xl font-bold tracking-tight">Teams &amp; Personas</h1>
	  </div>

	  {loading ? (
		<div className="mt-10 text-sm text-neutral-400">Loading…</div>
	  ) : err ? (
		<div className="mt-10 text-sm text-red-400">{err}</div>
	  ) : (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
		  {/* Personas (left) */}
		  <div>
			<div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">
			  Personas {enriching ? <span className="ml-1 text-xs text-neutral-400">(resolving…)</span> : null}
			</div>
			{personasLeft.length === 0 ? (
			  <div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
				No personas yet<br />
				<span className="text-xs text-neutral-500">Seed a few from roles or look-alikes to get started.</span>
			  </div>
			) : (
			  <ul className="space-y-3">
				{personasLeft.map((p) => (
				  <li key={p.id}>
					<Link
					  href={`/personas/persona/${p.id}`}
					  className="block rounded-xl border border-neutral-800/70 bg-neutral-950/60 hover:bg-neutral-950/80 transition p-4"
					>
					  <div className="flex items-center justify-between gap-3">
						<div className="min-w-0">
						  <div className="truncate text-sm font-semibold">{p.name || p.title || 'Persona'}</div>
						  {(p.role || p.title) && (
							<div className="text-xs text-neutral-500 truncate">{p.role || p.title}</div>
						  )}
						  {p.teamName ? (
							<div className="mt-1 text-[11px] text-neutral-500">Team: {p.teamName}</div>
						  ) : null}
						</div>
						<div className="text-xs text-neutral-400">Open ›</div>
					  </div>
					  {p.summary ? (
						<p className="mt-2 text-sm text-neutral-300 line-clamp-2">{p.summary}</p>
					  ) : null}
					</Link>
				  </li>
				))}
			  </ul>
			)}
		  </div>

		  {/* Teams (right) */}
		  <div>
			<div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Teams</div>
			{teamsRight.length === 0 ? (
			  <div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
				No multi-persona teams yet<br />
				<span className="text-xs text-neutral-500">Create a team, or add more members to existing teams.</span>
			  </div>
			) : (
			  <ul className="space-y-3">
				{teamsRight.map((s) => {
				  const count = typeof s.persona_count === 'number'
					? s.persona_count
					: (Array.isArray(s.personas) ? s.personas.length : 0)
				  return (
					<li key={s.id}>
					  <Link
						href={`/personas/set/${s.id}`}
						className="block rounded-xl border border-neutral-800/70 bg-neutral-950/60 hover:bg-neutral-950/80 transition p-4"
					  >
						<div className="flex items-center justify-between gap-3">
						  <div className="min-w-0">
							<div className="truncate text-sm font-semibold">{s.name}</div>
							<div className="text-xs text-neutral-500 truncate">{s.context || '—'}</div>
							<div className="mt-1 text-[11px] text-neutral-500">
							  {count} persona{count === 1 ? '' : 's'}
							</div>
							{Array.isArray(s.tags) && s.tags.length ? (
							  <div className="mt-2 flex flex-wrap gap-1">
								{s.tags.slice(0, 4).map((t) => (
								  <span
									key={t}
									className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-700 text-neutral-300"
								  >
									#{t}
								  </span>
								))}
							  </div>
							) : null}
						  </div>
						  <div className="text-xs text-neutral-400">Open ›</div>
						</div>
					  </Link>
					</li>
				  )
				})}
			  </ul>
			)}
		  </div>
		</div>
	  )}
	</section>
  )
}

// Breadcrumbs: Personas / Teams & Personas (no links)
export default withPersonaLayout(PersonasLibraryPage, [
  { label: 'Personas' },
  { label: 'Teams & Personas' },
])