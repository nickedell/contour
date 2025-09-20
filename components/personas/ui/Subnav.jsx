// components/personas/ui/Subnav.jsx
import Link from 'next/link';
import { useRouter } from 'next/router';

function SubNavLink({ href, children }) {
  const { asPath, pathname } = useRouter();
  const active = asPath === href || pathname === href;
  const base =
	'px-3 py-1.5 rounded-md text-sm transition select-none text-neutral-200 ' +
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20';
  const state = active ? 'bg-white/10' : 'hover:bg-white/5';
  return (
	<Link href={href} className={`${base} ${state}`}>
	  {children}
	</Link>
  );
}

export default function PersonasSubnav({ rightSlot }) {
  return (
	<div className="mb-6 flex items-center justify-between gap-4">
	  <div className="flex items-center gap-2">
		<SubNavLink href="/personas">Library</SubNavLink>
		<SubNavLink href="/personas/new">New Team</SubNavLink>
		<Link
		  href="/"
		  className="px-3 py-1.5 rounded-md text-sm hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
		>
		  Main site
		</Link>
	  </div>
	  {/* Right side: Guide button, etc. */}
	  {rightSlot ?? (
		<button
		  type="button"
		  className="px-3 py-1.5 rounded-md text-sm hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
		  aria-haspopup="dialog"
		>
		  ‹ Guide
		</button>
	  )}
	</div>
  );
}