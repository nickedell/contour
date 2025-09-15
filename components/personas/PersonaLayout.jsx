// components/personas/PersonaLayout.jsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

function NavLink({ href, children }) {
  const router = useRouter();
  const active = router.pathname === href || router.asPath === href;
  return (
	<Link
	  href={href}
	  className={`px-2.5 py-1.5 rounded-md text-sm transition
		${active
		  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
		  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
		}`}
	>
	  {children}
	</Link>
  );
}

export default function PersonaLayout({
  children,
  titleSuffix,        // e.g., "Library", "New Team", a team name, or persona name
  breadcrumbs = [],   // [{label:'Library', href:'/personas'}, {label:'Team Foo'}]
}) {
  const [openInfo, setOpenInfo] = React.useState(false);
  const fullTitle = `Contour — Personas${titleSuffix ? ' · ' + titleSuffix : ''}`;

  return (
	<>
	  <Head>
		<title>{fullTitle}</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	  </Head>

	  {/* background grid */}
	  <div
		aria-hidden
		className="pointer-events-none fixed inset-0 -z-10
		  bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)]
		  [background-size:24px_24px]
		  dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)]"
	  />

	  <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/60 border-b border-neutral-200/70 dark:border-neutral-800">
		<div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
		  {/* logo + title */}
		  <Link href="/" className="flex items-center gap-2 group">
			<img
			  src="/assets/img/logo.svg"
			  alt="Contour"
			  width={24}
			  height={24}
			  className="shrink-0"
			/>
			<div className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:opacity-90">
			  Contour — Personas
			</div>
		  </Link>

		  {/* primary nav */}
		  <nav className="ml-auto flex items-center gap-1">
			<NavLink href="/personas">Library</NavLink>
			<NavLink href="/personas/new">New Team</NavLink>
			<NavLink href="/">Back to Contour</NavLink>

			{/* info drawer trigger */}
			<button
			  type="button"
			  onClick={() => setOpenInfo(true)}
			  className="ml-2 inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-2.5 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
			  aria-label="Open Personas guide"
			  title="Guide"
			>
			  <span className="inline-block w-4 h-4 leading-none text-center">?</span>
			  <span className="hidden sm:inline">Guide</span>
			</button>
		  </nav>
		</div>

		{/* breadcrumbs */}
		{breadcrumbs.length > 0 && (
		  <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-3 text-xs text-neutral-600 dark:text-neutral-400">
			<nav className="flex items-center gap-1.5 flex-wrap">
			  {breadcrumbs.map((c, i) => {
				const last = i === breadcrumbs.length - 1;
				return (
				  <React.Fragment key={i}>
					{c.href && !last ? (
					  <Link href={c.href} className="hover:underline">
						{c.label}
					  </Link>
					) : (
					  <span className="font-medium text-neutral-800 dark:text-neutral-200">{c.label}</span>
					)}
					{!last && <span className="opacity-60">/</span>}
				  </React.Fragment>
				);
			  })}
			</nav>
		  </div>
		)}
	  </header>

	  <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
		{children}
	  </main>

	  {/* right drawer */}
	  <aside
		className={`fixed inset-y-0 right-0 z-30 w-full max-w-md transform transition
		  ${openInfo ? 'translate-x-0' : 'translate-x-full'}
		  bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800`}
		aria-hidden={!openInfo}
	  >
		<div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
		  <div className="text-sm font-semibold">Personas — Guide</div>
		  <button
			onClick={() => setOpenInfo(false)}
			className="rounded-md px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
			aria-label="Close guide"
		  >
			Close
		  </button>
		</div>

		<div className="p-4 sm:p-6 overflow-y-auto h-[calc(100vh-56px)]">
		  {/* <<< UX COPY >>> */}
		  <section className="space-y-3 text-sm leading-6">
			<p className="text-neutral-800 dark:text-neutral-200">
			  Personas in Contour are organised into <strong>Teams</strong>. A Team is a suite of personas
			  (e.g., “Marine Bunkering Team v1”) you can reuse across journeys or attach to specific stages.
			</p>

			<h3 className="font-semibold mt-4">How it works</h3>
			<ol className="list-decimal ml-5 space-y-2 text-neutral-700 dark:text-neutral-300">
			  <li>
				<strong>Library</strong> lists all Teams. Open one to view its personas.
			  </li>
			  <li>
				<strong>New Team</strong> launches a wizard. Choose Mode A (Known Individuals) or Mode B (Role/Domain).
			  </li>
			  <li>
				Review generated personas, edit if needed, then <strong>Save</strong> to Supabase.
			  </li>
			</ol>

			<h3 className="font-semibold mt-4">Modes</h3>
			<ul className="list-disc ml-5 space-y-2 text-neutral-700 dark:text-neutral-300">
			  <li>
				<strong>Mode A: Known Individuals</strong> — paste names & LinkedIn links (or upload HTML). We fetch public signals and produce evidence-weighted personas.
			  </li>
			  <li>
				<strong>Mode B: Role/Domain</strong> — specify role, sector, geo, org type. You’ll get a candidate gallery to curate before generation.
			  </li>
			</ul>

			<h3 className="font-semibold mt-4">Tips</h3>
			<ul className="list-disc ml-5 space-y-2 text-neutral-700 dark:text-neutral-300">
			  <li>Use clear role/sector terms (e.g., “Bunkering Originator”, “Marine Fuel Trading”).</li>
			  <li>Teams can be versioned (v1, v2) to track change over time.</li>
			  <li>Each persona includes snapshot, background, behaviours, motivations, frustrations, goals, opportunities, quotes, and evidence.</li>
			</ul>
		  </section>
		</div>
	  </aside>

	  {/* drawer backdrop */}
	  {openInfo && (
		<button
		  aria-hidden
		  onClick={() => setOpenInfo(false)}
		  className="fixed inset-0 z-20 bg-black/20 dark:bg-black/40"
		/>
	  )}
	</>
  );
}