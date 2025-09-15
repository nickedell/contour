// pages/personas/set/[id].jsx
/**
 * Personas — Team Detail
 * © 2025 ResonantAI Ltd.
 */
import * as React from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import PersonaLayout from '@/components/personas/PersonaLayout';
import PageHeader from '@/components/personas/PageHeader';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PersonaSetPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: set, error } = useSWR(
	id ? `/api/personas/set/${id}` : null,
	fetcher
  );

  return (
	<PersonaLayout titleSuffix="Personas">
	  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<div
		  className="mt-6 rounded-2xl border shadow-sm"
		  style={{ background: '#121417', borderColor: 'rgba(255,255,255,0.06)' }}
		>
		  <PageHeader
			title={`Personas / Team ${set?.name || ''}`}
			right={
			  <>
				<Link
				  href="/personas/new"
				  className="px-3 py-2 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900"
				>
				  New Team
				</Link>
				<Link
				  href="/personas"
				  className="px-3 py-2 text-sm rounded-md border border-neutral-700 hover:bg-neutral-900"
				>
				  ← Back to Library
				</Link>
			  </>
			}
		  />

		  <div className="px-5 sm:px-6 lg:px-8 py-6">
			{error && (
			  <div className="text-sm text-red-400">Failed to load team.</div>
			)}
			{!set && !error && (
			  <div className="text-sm text-neutral-400">Loading…</div>
			)}
			{set && (
			  <>
				<h2 className="text-lg font-semibold">{set.context}</h2>
				<div className="mt-2 flex flex-wrap gap-2">
				  {set.tags?.map((t) => (
					<span
					  key={t}
					  className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-700 text-neutral-300"
					>
					  #{t}
					</span>
				  ))}
				</div>
				<div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				  {set.personas?.map((p) => (
					<Link
					  key={p.id}
					  href={`/personas/persona/${p.id}`}
					  className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 hover:shadow"
					>
					  <div className="text-sm font-semibold">{p.name}</div>
					  <div className="text-xs text-neutral-500 mt-1">
						{p.role}
					  </div>
					  <div className="mt-2 text-xs text-neutral-500">
						{p.tags?.map((t) => `#${t}`).join(' ') || ''}
					  </div>
					</Link>
				  ))}
				  {(!set.personas || set.personas.length === 0) && (
					<div className="text-sm text-neutral-400">
					  No personas yet.
					</div>
				  )}
				</div>
			  </>
			)}
		  </div>
		</div>
	  </div>
	</PersonaLayout>
  );
}