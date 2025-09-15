// pages/personas/persona/[id].js
import * as React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PersonaLayout from '@/components/personas/PersonaLayout';
import PageHeader from '@/components/personas/PageHeader';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PersonaProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error, isLoading } = useSWR(
	() => (id ? `/api/personas/persona/${id}` : null),
	fetcher,
	{ revalidateOnFocus: false }
  );

  const persona = data?.persona;
  const title = persona?.name || 'Persona';
  const subtitle = persona?.role || 'Profile';
  const tags = persona?.tags || [];

  // unpack rich fields (if present)
  const p = persona?.data || {};
  const snapshot = p.snapshot || {};
  const background = p.background || {};
  const behaviours = p.behaviours || {};
  const motivations = p.motivations || [];
  const frustrations = p.frustrations || [];
  const goals_near = p.goals_near_term || [];
  const goals_long = p.goals_long_term || [];
  const opportunities = p.opportunities || {};
  const quotes = p.representative_quotes || [];
  const evidence = p.evidence || [];

  return (
	<PersonaLayout>
	  {/* === IDENTICAL WRAPPER START === */}
	  <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 py-8">
		<PageHeader
		  left={
			<h1 className="text-xl font-extrabold tracking-tight">
			  <span className="font-extrabold">Contour</span>
			  <span className="font-light"> — Personas / Profile</span>
			  {persona?.name ? <span className="font-light"> — {persona.name}</span> : null}
			</h1>
		  }
		  right={
			<div className="flex gap-2">
			  {persona?.set_id && (
				<Link
				  href={`/personas/set/${persona.set_id}`}
				  className="px-3 py-2 text-sm rounded-md border border-neutral-700 hover:bg-neutral-800"
				>
				  ← Back to Team
				</Link>
			  )}
			  <Link
				href="/personas"
				className="px-3 py-2 text-sm rounded-md border border-neutral-700 hover:bg-neutral-800"
			  >
				Library
			  </Link>
			</div>
		  }
		/>

		{/* content card */}
		<div className="mt-4 rounded-xl border border-neutral-800 bg-[#0f1113] p-5">
		  <div className="flex items-start justify-between">
			<div>
			  <div className="text-lg font-semibold">{subtitle}</div>
			  {snapshot?.one_line ? (
				<div className="mt-1 text-neutral-300">{snapshot.one_line}</div>
			  ) : (
				<div className="mt-1 text-neutral-500">No summary available.</div>
			  )}
			</div>
			<div className="flex flex-wrap gap-2">
			  {tags.map((t) => (
				<span
				  key={t}
				  className="px-2 py-1 rounded-full text-xs border border-neutral-700 text-neutral-300"
				>
				  #{t}
				</span>
			  ))}
			</div>
		  </div>

		  {/* Loading / Error states */}
		  {isLoading && <div className="mt-6 text-sm text-neutral-400">Loading…</div>}
		  {error && (
			<div className="mt-6 text-sm text-red-400">
			  Error loading persona: {error.message || 'Unknown error'}
			</div>
		  )}

		  {/* Rich sections */}
		  {persona && (
			<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
			  {/* Snapshot */}
			  <Section title="Elevator">
				{snapshot?.elevator ? <p>{snapshot.elevator}</p> : <Empty />}
			  </Section>

			  {/* Background */}
			  <Section title="Background">
				<List title="Career path" items={background.career_path} />
				<List title="Core skills" items={background.skills_core} />
				<List title="Adjacent skills" items={background.skills_adjacent} />
				<List title="Tools" items={background.tools_stack} />
			  </Section>

			  {/* Behaviours */}
			  <Section title="Behaviours">
				<List title="Information sources" items={behaviours.information_sources} />
				<List title="Decision style" items={behaviours.decision_style} />
				<List title="Collaboration style" items={behaviours.collaboration_style} />
			  </Section>

			  {/* Motivations / Frustrations */}
			  <Section title="Motivations">
				<Bullets items={motivations} />
			  </Section>
			  <Section title="Frustrations">
				<Bullets items={frustrations} />
			  </Section>

			  {/* Goals */}
			  <Section title="Goals (near term)">
				<Bullets items={goals_near} />
			  </Section>
			  <Section title="Goals (long term)">
				<Bullets items={goals_long} />
			  </Section>

			  {/* Opportunities */}
			  <Section title="Opportunities">
				<List title="Strategic" items={opportunities.strategic} />
				<List title="Tactical" items={opportunities.tactical} />
			  </Section>

			  {/* Quotes */}
			  <Section title="Representative quotes">
				{quotes?.length ? (
				  <ul className="space-y-3">
					{quotes.map((q, i) => (
					  <li key={i} className="text-neutral-300">
						“{q.text}”
					  </li>
					))}
				  </ul>
				) : (
				  <Empty />
				)}
			  </Section>

			  {/* Evidence */}
			  <Section title="Evidence">
				{evidence?.length ? (
				  <ul className="space-y-2 text-sm">
					{evidence.map((e, i) => (
					  <li key={i} className="text-neutral-300">
						<span className="text-neutral-500 mr-2">[{e.source_type}]</span>
						{e.title || e.subject}
					  </li>
					))}
				  </ul>
				) : (
				  <Empty />
				)}
			  </Section>
			</div>
		  )}
		</div>
	  </div>
	  {/* === IDENTICAL WRAPPER END === */}
	</PersonaLayout>
  );
}

/* helpers */
function Section({ title, children }) {
  return (
	<div className="rounded-lg border border-neutral-800 p-4">
	  <div className="text-sm font-semibold mb-2 text-neutral-200">{title}</div>
	  <div className="text-sm text-neutral-300">{children}</div>
	</div>
  );
}

function List({ title, items }) {
  if (!items || !items.length) return null;
  return (
	<div className="mb-3">
	  <div className="text-xs uppercase tracking-wide text-neutral-500">{title}</div>
	  <ul className="mt-1 list-disc pl-5 space-y-1">
		{items.map((x, i) => (
		  <li key={i}>{x}</li>
		))}
	  </ul>
	</div>
  );
}

function Bullets({ items }) {
  if (!items || !items.length) return <Empty />;
  return (
	<ul className="list-disc pl-5 space-y-1">
	  {items.map((x, i) => (
		<li key={i}>{x}</li>
	  ))}
	</ul>
  );
}

function Empty() {
  return <div className="text-neutral-500">No data available.</div>;
}