// components/personas/PersonaLayout.jsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

function NavLink({ href, children }) {
  const router = useRouter();
  const isActive =
	router.pathname === href ||
	router.asPath === href ||
	router.pathname.startsWith('/personas/set') && href === '/personas';

  return (
	<Link
	  href={href}
	  className={[
		'px-3 py-1.5 rounded-md text-sm transition-colors',
		// Subtle “selected” state to match main site tone (not bright white)
		isActive
		  ? 'bg-white/5 text-white'
		  : 'text-white/70 hover:text-white hover:bg-white/5',
	  ].join(' ')}
	>
	  {children}
	</Link>
  );
}

export default function PersonaLayout({
  children,
  titleSuffix,       // e.g., "Library", "New Team", a team name, or persona name
  breadcrumbs = [],  // [{label:'Library', href:'/personas'}, {label:'Team Foo'}]
}) {
  const [openInfo, setOpenInfo] = React.useState(false);
  const fullTitle = `Contour — Personas${titleSuffix ? ' · ' + titleSuffix : ''}`;

  return (
	<>
	  <Head>
		<title>{fullTitle}</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	  </Head>

	  {/* === SITE BACKGROUND (match main site) === */}
	  <div className="fixed inset-0 -z-10 bg-[#121417]" aria-hidden />
	  <div
		aria-hidden
		className="pointer-events-none fixed inset-0 -z-10"
		style={{
		  backgroundImage:
			'linear-gradient(transparent 23px, rgba(255,255,255,0.055) 24px), linear-gradient(90deg, transparent 23px, rgba(255,255,255,0.055) 24px)',
		  backgroundSize: '24px 24px, 24px 24px',
		  maskImage:
			'radial-gradient(1200px 600px at 50% -150px, rgba(0,0,0,0.35), rgba(0,0,0,0.9))',
		}}
	  />

	  {/* === HEADER (identical spacing + alignment) === */}
	  <header className="sticky top-0 z-20 border-b border-white/10 bg-[#121417]/90 backdrop-blur">
		<div className="mx-auto w-full max-w-[1080px] px-5 sm:px-6 lg:px-8">
		  <div className="flex h-14 items-center justify-between">
			{/* logo + title */}
			<Link href="/" className="flex items-center gap-3 group">
			  {/* circle logo to match main site */}
			  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white/80">
				<span className="h-3 w-3 rounded-full bg-transparent ring-2 ring-white/60" />
			  </span>
			  <div className="text-[18px] tracking-tight text-white">
				<span className="font-extrabold">Contour</span>
				<span className="font-light"> — Personas</span>
			  </div>
			</Link>

			{/* primary nav */}
			<nav className="ml-auto flex items-center gap-2">
			  <NavLink href="/personas">Library</NavLink>
			  <NavLink href="/personas/new">New Team</NavLink>

			  {/* right-side group: Main site | ‹ Guide */}
			  <div className="hidden sm:flex items-center gap-2 text-white/70">
				<Link
				  href="/"
				  className="px-3 py-1.5 rounded-md text-sm hover:text-white hover:bg-white/5"
				>
				  Main site
				</Link>
				<span className="text-white/20">|</span>
				<button
				  type="button"
				  onClick={() => setOpenInfo(true)}
				  className="px-3 py-1.5 rounded-md text-sm hover:text-white hover:bg-white/5"
				  aria-label="Open Personas guide"
				  title="Guide"
				>
				  ‹ Guide
				</button>
			  </div>
			</nav>
		  </div>

		  {/* breadcrumbs */}
		  {breadcrumbs.length > 0 && (
			<div className="pb-3">
			  <nav className="text-xs text-white/60 flex items-center gap-1.5 flex-wrap">
				{breadcrumbs.map((c, i) => {
				  const last = i === breadcrumbs.length - 1;
				  return (
					<React.Fragment key={`${c.label}-${i}`}>
					  {c.href && !last ? (
						<Link href={c.href} className="hover:text-white">
						  {c.label}
						</Link>
					  ) : (
						<span className="text-white/80">{c.label}</span>
					  )}
					  {!last && <span className="opacity-40">/</span>}
					</React.Fragment>
				  );
				})}
			  </nav>
			</div>
		  )}
		</div>
	  </header>

	  {/* === MAIN CONTAINER (exactly aligned with header width) === */}
	  <main className="relative z-10 mx-auto w-full max-w-[1080px] px-5 sm:px-6 lg:px-8 py-8">
		{children}
	  </main>

	  {/* === RIGHT DRAWER / GUIDE (kept, styled closer to main site) === */}
	  <aside
		className={[
		  'fixed inset-y-0 right-0 z-30 w-full max-w-md transform transition-transform',
		  openInfo ? 'translate-x-0' : 'translate-x-full',
		  'bg-[#121417] text-white border-l border-white/10',
		].join(' ')}
		aria-hidden={!openInfo}
	  >
		{/* drawer header */}
		<div className="h-12 px-4 sm:px-5 flex items-center justify-between border-b border-white/10">
		  <div className="text-[11px] tracking-wider uppercase text-white/60">
			Personas — Guide
		  </div>
		  <button
			onClick={() => setOpenInfo(false)}
			className="rounded-md px-2 py-1 text-sm text-white/80 hover:text-white hover:bg-white/5"
			aria-label="Close guide"
		  >
			› Close
		  </button>
		</div>

		{/* drawer body */}
		<div className="p-4 sm:p-5 overflow-y-auto h-[calc(100vh-48px)]">
		  {/* === UX COPY (unchanged content; tone + spacing tuned) === */}
		  <section className="space-y-3 text-sm leading-6">
			<p className="text-white/85">
			  Personas in Contour are organised into <strong>Teams</strong>. A
			  Team is a suite of personas (e.g., “Marine Bunkering Team v1”)
			  you can reuse across journeys or attach to specific stages.
			</p>

			<h3 className="font-semibold mt-4 text-white">How it works</h3>
			<ol className="list-decimal ml-5 space-y-2 text-white/80">
			  <li>
				<strong>Library</strong> lists all Teams. Open one to view its
				personas.
			  </li>
			  <li>
				<strong>New Team</strong> launches a wizard. Choose Mode A
				(Known Individuals) or Mode B (Role/Domain).
			  </li>
			  <li>
				Review generated personas, edit if needed, then <strong>Save</strong> to
				Supabase.
			  </li>
			</ol>

			<h3 className="font-semibold mt-4 text-white">Modes</h3>
			<ul className="list-disc ml-5 space-y-2 text-white/80">
			  <li>
				<strong>Mode A: Known Individuals</strong> — paste names &
				LinkedIn links (or upload HTML). We fetch public signals and
				produce evidence-weighted personas.
			  </li>
			  <li>
				<strong>Mode B: Role/Domain</strong> — specify role, sector,
				geo, org type. You’ll get a candidate gallery to curate before
				generation.
			  </li>
			</ul>

			<h3 className="font-semibold mt-4 text-white">Tips</h3>
			<ul className="list-disc ml-5 space-y-2 text-white/80">
			  <li>
				Use clear role/sector terms (e.g., “Bunkering Originator”,
				“Marine Fuel Trading”).
			  </li>
			  <li>Teams can be versioned (v1, v2) to track change over time.</li>
			  <li>
				Each persona includes snapshot, background, behaviours,
				motivations, frustrations, goals, opportunities, quotes, and
				evidence.
			  </li>
			</ul>
		  </section>
		</div>
	  </aside>

	  {/* drawer backdrop */}
	  {openInfo && (
		<button
		  aria-hidden
		  onClick={() => setOpenInfo(false)}
		  className="fixed inset-0 z-20 bg-black/30"
		/>
	  )}
	</>
  );
}