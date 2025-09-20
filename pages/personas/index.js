/**
 * /personas — Personas & Teams
 * - If a team has exactly one persona, show it on the left (Personas)
 *   and do NOT list that team on the right (Teams), even when the initial
 *   /api/personas/sets payload does not include the persona object.
 */

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import withPersonaLayout from '@/components/personas/withPersonaLayout'

function PersonasLibraryPage() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  // Enriched single-persona teams → actual persona objects
  const [enrichedSingles, setEnrichedSingles] = useState({}) // { [teamId]: persona | null }
  const [enriching, setEnriching] = useState(false)

  // 1) Load the sets (teams)
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

  // 2) For any team with persona_count === 1 but missing s.personas,
  //    fetch /api/personas/set/:id to obtain the persona object.
  useEffect(() => {
	// find candidates we don’t have enriched yet
	const candidates = (sets || []).filter((s) => {
	  const count = typeof s.persona_count === 'number'
		? s.persona_count
		: Array.isArray(s.personas) ? s.personas.length : 0
	  const hasList = Array.isArray(s.personas) && s.personas.length > 0
	  return count === 1 && !hasList && enrichedSingles[s.id] === undefined
	})

	if (!candidates.length) return
	let alive = true
	setEnriching(true)

	;(async () => {
	  try {
		const fetched = await Promise.all(
		  candidates.map(async (s) => {
			try {
			  const res = await fetch(`/api/personas/set/${s.id}`)
			  const json = await res.json()
			  if (!res.ok) throw new Error(json?.error || 'Fetch failed')
			  const list = Array.isArray(json?.personas) ? json.personas : []
			  const persona = list[0] || null
			  return [s.id, persona]
			} catch (e) {
			  console.error('Failed to enrich team', s.id, e)
			  return [s.id, null]
			}
		  })
		)

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

  // 3) Build columns using either inlined personas or enriched singletons
  const { personasLeft, teamsRight } = useMemo(() => {
	const left = []
	const right = []

	for (const s of sets || []) {
	  const inlineList = Array.isArray(s.personas) ? s.personas : []
	  const count = typeof s.persona_count === 'number' ? s.persona_count : inlineList.length

	  if (count === 1) {
		// Prefer inline persona if present; otherwise use enriched single (if available)
		const persona =
		  inlineList[0] ||
		  enrichedSingles[s.id] ||
		  null

		if (persona && persona.id) {
		  left.push({
			...persona,
			teamId: s.id,
			teamName: s.name,
		  })
		  // do NOT push team to right
		  continue
		}
		// If we still don’t have the persona (fetch pending/failed), keep the team visible for now.
		right.push(s)
		continue
	  }

	  // Count is 0 or > 1 → show as a team
	  right.push(s)
	}

	return { personasLeft: left, teamsRight: right }
  }, [sets, enrichedSingles])

  return (
	<section>
	  {/* Title row */}
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
			  <div className="text-sm text-neutral-400">No single-persona teams detected.</div>
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
			  <div className="text-sm text-neutral-400">No teams yet.</div>
			) : (
			  <ul className="space-y-3">
				{teamsRight.map((s) => (
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
							{(typeof s.persona_count === 'number' ? s.persona_count : (s.personas?.length || 0))}{' '}
							persona{s.persona_count === 1 ? '' : 's'}
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
				))}
			  </ul>
			)}
		  </div>
		</div>
	  )}
	</section>
  )
}

// Breadcrumbs spec: Personas / Personas & Teams (no links)
export default withPersonaLayout(PersonasLibraryPage, [
  { label: 'Personas' },
  { label: 'Teams & Personas' },
])