// pages/personas/set/[id].js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import withPersonaLayout from '@/components/personas/withPersonaLayout';

function TeamSetPage() {
  const router = useRouter();
  const { id } = router.query;

  // IMPORTANT: team + personas are separate because the API returns { set, personas }
  const [team, setTeam] = useState(null);          // the "set" object only
  const [personas, setPersonas] = useState([]);    // array from payload.personas
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
	if (!id) return;
	let alive = true;

	(async () => {
	  try {
		setLoading(true);
		setErr('');
		const r = await fetch(`/api/personas/set/${id}`);
		const j = await r.json();

		if (!r.ok) throw new Error(j?.error || 'Failed to load team');

		// The API returns: { set: {...}, personas: [...] }
		const t = j?.set ?? null;
		const ppl = Array.isArray(j?.personas) ? j.personas : [];

		if (alive) {
		  setTeam(t);
		  setPersonas(ppl);
		}
	  } catch (e) {
		console.error(e);
		if (alive) setErr(e.message || 'Failed to load team');
	  } finally {
		if (alive) setLoading(false);
	  }
	})();

	return () => { alive = false; };
  }, [id]);

  return (
	<section>
	  {/* Title */}
	  <div className="mb-4">
		<h1 className="text-xl font-bold tracking-tight">Team</h1>
	  </div>

	  {loading ? (
		<div className="mt-10 text-sm text-neutral-400">Loading…</div>
	  ) : err ? (
		<div className="mt-10 text-sm text-red-400">{err}</div>
	  ) : (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
		  {/* Left: Team panel (shows real name, context, tags) */}
		  <div className="md:col-span-1">
			<div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Team</div>
			<div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4">
			  <div className="text-sm font-semibold truncate">
				{team?.name || team?.title || team?.label || 'Untitled team'}
			  </div>

			  {team?.context ? (
				<div className="mt-1 text-xs text-neutral-500">{team.context}</div>
			  ) : null}

			  {Array.isArray(team?.tags) && team.tags.length ? (
				<div className="mt-3 flex flex-wrap gap-1">
				  {team.tags.slice(0, 6).map((t) => (
					<span
					  key={t}
					  className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-700 text-neutral-300"
					>
					  #{t}
					</span>
				  ))}
				</div>
			  ) : null}

			  <div className="mt-4">
				<Link
				  href="/personas"
				  className="text-xs text-neutral-300 underline hover:no-underline"
				>
				  Back to Teams &amp; Personas
				</Link>
			  </div>
			</div>
		  </div>

		  {/* Right: Personas list (unchanged styling) */}
		  <div className="md:col-span-2">
			<div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Personas</div>

			{personas.length === 0 ? (
			  <div className="rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
				No personas in this team yet.
			  </div>
			) : (
			  <ul className="grid grid-cols-1 gap-3">
				{personas.map((p) => (
				  <li key={p.id}>
					<Link
					  href={`/personas/persona/${p.id}`}
					  className="block rounded-xl border border-neutral-800/70 bg-neutral-950/60 hover:bg-neutral-950/80 transition p-4"
					>
					  <div className="flex items-center justify-between gap-3">
						<div className="min-w-0">
						  <div className="truncate text-sm font-semibold">
							{p.name || p.title || 'Persona'}
						  </div>
						  {(p.role || p.title) && (
							<div className="text-xs text-neutral-500 truncate">
							  {p.role || p.title}
							</div>
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

// Breadcrumbs: Personas / Teams & Personas / Team (static labels per your spec)
export default withPersonaLayout(TeamSetPage, [
  { label: 'Personas' },
  { label: 'Teams & Personas', href: '/personas' },
  { label: 'Team' },
]);