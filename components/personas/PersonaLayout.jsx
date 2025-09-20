// components/personas/PersonaLayout.jsx
import * as React from 'react';
import Link from 'next/link';
import GuideDrawer from '@/components/ui/GuideDrawer';

export default function PersonaLayout({ children, breadcrumbs = [], rightSlot }) {
  const [guideOpen, setGuideOpen] = React.useState(false);

  return (
	<div className="personas-grid relative">
	  {/* Sticky second-level strip */}
	  <div className="sticky top-14 z-20 bg-white/70 dark:bg-[#121417]/70 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
		<div className="max-w-[1300px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
		  {/* Breadcrumbs */}
		  <nav className="flex items-center gap-1 text-sm text-neutral-500" aria-label="Breadcrumb">
			<span className="text-neutral-400">/</span>
			{breadcrumbs.map((b, i) => {
			  const isLast = i === breadcrumbs.length - 1;
			  const Label = b.href && !isLast
				? <Link href={b.href} className="hover:text-neutral-200">{b.label}</Link>
				: <span className={isLast ? 'text-neutral-200' : ''}>{b.label}</span>;
			  return (
				<React.Fragment key={i}>
				  {Label}
				  {!isLast && <span className="text-neutral-400">/</span>}
				</React.Fragment>
			  );
			})}
		  </nav>

		  {/* Right area: optional slot + Guide button */}
		  <div className="flex items-center gap-2">
			{rightSlot !== undefined && rightSlot !== null ? rightSlot : null}
			<button
			  type="button"
			  onClick={() => setGuideOpen(true)}
			  className="px-3 py-1.5 rounded-md text-sm hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
			  aria-haspopup="dialog"
			  title="Open guide"
			>
			  ‹ Guide
			</button>
		  </div>
		</div>
	  </div>

	  {/* Page body */}
	  <div className="max-w-[1300px] mx-auto px-4 py-6 relative z-10">
		{children}
	  </div>

	  {/* Drawer */}
	  <GuideDrawer open={guideOpen} onClose={() => setGuideOpen(false)}>
		<p>Use <b>Teams &amp; Personas</b> to organise your research inputs. Single-persona teams appear under Personas.</p>
		<p>On a Team, click a Persona card to see the full profile. Use <i>New</i> to create teams/personas.</p>
		<p>Wire a markdown or help doc here if you prefer.</p>
	  </GuideDrawer>
	</div>
  );
}