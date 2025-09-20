// components/layout/SiteLayout.jsx
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function SiteLayout({ children }) {
  const { pathname } = useRouter()
  const onPersonas = pathname.startsWith('/personas')
  const onHome = !onPersonas // treat all non-personas routes as “Journey”

  return (
	<div className="relative z-10 min-h-screen text-neutral-200">
	  {/* Constrained top bar */}
	  <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-[#121417]/70">
		<div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
		  {/* Logo + type lockup (nice type, no all-caps) */}
		  <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90">
			<img src="/assets/img/logo.svg" alt="Contour" className="h-6 w-auto" />
			<span className="sr-only">Contour</span>
			<div className="text-[0.95rem] leading-none -tracking-[0.01em]">
			  <h1 className="text-lg font-extrabold tracking-tight">
				  <span className="font-extrabold">Contour</span>
				  <span className="font-light"> Integrated System Map</span>
				</h1>
			</div>
		  </Link>

		  {/* Top nav: Journey (bold) | Personas */}
		  <nav className="flex items-center gap-3 text-sm">
			<Link
			  href="/"
			  className={onHome ? 'font-semibold text-white' : 'text-neutral-300 hover:text-white'}
			>
			  Journeys
			</Link>
			<span className="text-neutral-600">|</span>
			<Link
			  href="/personas"
			  className={onPersonas ? 'font-semibold text-white' : 'text-neutral-300 hover:text-white'}
			>
			  Personas
			</Link>
		  </nav>
		</div>
	  </header>

	  {/* Full-bleed content area (pages constrain themselves if needed) */}
	  <main className="w-full">
		{children}
	  </main>
	</div>
  )
}