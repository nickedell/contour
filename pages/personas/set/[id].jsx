/**
 * /personas/set/[id] — Team
 * Breadcrumb: Personas / Personas & Teams / Team
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withPersonaLayout from '@/components/personas/withPersonaLayout';

function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
	if (!id) return;
	let alive = true;
	(async () => {
	  try {
		setLoading(true);
		setErr('');
		const res = await fetch(`/api/personas/set/${id}`);
		const json = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(json?.error || 'Failed to load team');
		if (alive) setTeam(json);
	  } catch (e) {
		console.error(e);
		if (alive) { setErr(e.message || 'Failed to load team'); setTeam(null); }
	  } finally {
		if (alive) setLoading(false);
	  }
	})();
	return () => { alive = false; };
  }, [id]);

  const personas = useMemo(() => {
	const list = Array.isArray(team?.personas) ? team.personas : [];
	return list;
  }, [team]);

  return (
	<section>
	  <div className="mb-4">
		<h1 className="text-xl font-bold tracking-tight">Team</h1>
	  </div>

	  {loading ? (
		<div className="mt-10 text-sm text-neutral-400">Loading…</div>
	  ) : err ? (
		<div className="mt-10 text-sm text-red-400">{err}</div>
	  ) : !team ? (
		<div className="mt-10 text-sm text-neutral-400">Not found.</div>
	  ) : (
		<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
		  {/* Team meta */}
		  <div className="lg:col-span-1">
			<div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-5">
			  <div className="text-sm font-semibold">{team.name || 'Team'}</div>
			  {team.context ? (
				<p className="mt-2 text-sm text-neutral-300 leading-relaxed">{team.context}</p>
			  ) : null}

			  {Array.isArray(team.tags) && team.tags.length ? (
				<div className="mt-3 flex flex-wrap gap-1">
				  {team.tags.slice(0, 10).map((t) => (
					<span key={t} className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-700 text-neutral-300">
					  #{t}
					</span>
				  ))}
				</div>
			  ) : null}
			</div>
		  </div>

		  {/* Personas list */}
		  <div className="lg:col-span-2">
			<div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Personas</div>
			{personas.length === 0 ? (
			  <div className="text-sm text-neutral-400">No personas yet.</div>
			) : (
			  <ul className="grid gap-3 sm:grid-cols-2">
				{personas.map((p) => (
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
		</div>
	  )}
	</section>
  );
}

export default withPersonaLayout(TeamDetailPage, [
  { label: 'Personas' },
  { href: '/personas', label: 'Personas & Teams' },
  { label: 'Team' },
]);