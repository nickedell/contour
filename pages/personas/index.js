/**
 * Contour — Personas Library
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import PersonaLayout from '@/components/personas/PersonaLayout';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/personas/PageHeader';

export default function PersonaLibraryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
	(async () => {
	  try {
		const r = await fetch('/api/personas/sets');
		const json = await r.json();
		if (!r.ok || !Array.isArray(json)) {
		  throw new Error(json?.error || 'Failed to load persona sets');
		}
		setRows(json);
	  } catch (e) {
		console.error(e);
		setErr(e.message || 'Failed to load persona sets');
		setRows([]);
	  } finally {
		setLoading(false);
	  }
	})();
  }, []);

  return (
	<PersonaLayout
	  titleSuffix="Personas"
	  breadcrumbs={[{ label: 'Library' }]}
	>
	  {/* === IDENTICAL WRAPPER START (matches /personas/new) === */}
	  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<div
		  className="mt-6 rounded-2xl border shadow-sm"
		  style={{ background: '#121417', borderColor: 'rgba(255,255,255,0.06)' }}
		>
		  <PageHeader
			title="Personas / Library"
			
		  />

		  {/* Page content */}
		  <div className="px-5 sm:px-6 lg:px-8 py-6">
			<div className="flex items-center justify-between gap-4">
			  <h1 className="text-sm sm:text-xl font-bold">Teams</h1>
			  <div className="flex items-center gap-2">
				<Link
				  href="/personas/new"
				  className="px-3 py-2 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900"
				>
				  New Team
				</Link>
			  </div>
			</div>

			{loading ? (
			  <div className="mt-10 text-sm text-neutral-400">Loading…</div>
			) : err ? (
			  <div className="mt-10 text-sm text-red-400">{err}</div>
			) : rows.length === 0 ? (
			  <div className="mt-10 text-sm text-neutral-400">No persona sets yet.</div>
			) : (
			  <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{rows.map((s) => (
				  <Link
					key={s.id}
					href={`/personas/set/${s.id}`}
					className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 hover:shadow"
				  >
					<div className="text-sm font-semibold">{s.name}</div>
					<div className="text-xs text-neutral-500 mt-1">{s.context || '—'}</div>

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

					<div className="mt-3 text-xs text-neutral-500">
					  {s.persona_count || 0} persona{s.persona_count === 1 ? '' : 's'}
					</div>
				  </Link>
				))}
			  </div>
			)}
		  </div>
		</div>
	  </div>
	  {/* === IDENTICAL WRAPPER END === */}
	</PersonaLayout>
  );
}