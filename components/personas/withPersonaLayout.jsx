// components/personas/withPersonaLayout.js
import * as React from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import PersonaLayout from '@/components/personas/PersonaLayout';

/**
 * Wrap a page with SiteLayout + PersonaLayout.
 * Usage:
 *   export default withPersonaLayout(Page, [...breadcrumbs]);
 *   export default withPersonaLayout(Page, [...breadcrumbs], { rightSlot: null });
 */
export default function withPersonaLayout(Page, breadcrumbs = [], opts = undefined) {
  const crumbs = Array.isArray(breadcrumbs) ? breadcrumbs : [];

  const defaultRight = (
	<Link
	  href="/personas/new"
	  className="px-3 py-1.5 rounded-md text-sm text-neutral-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
	>
	  New
	</Link>
  );

  const right = opts && Object.prototype.hasOwnProperty.call(opts, 'rightSlot')
	? opts.rightSlot // may be null to hide
	: defaultRight;

  function WrappedPage(props) {
	return <Page {...props} />;
  }

  WrappedPage.getLayout = (page) => (
	<SiteLayout>
	  <PersonaLayout breadcrumbs={crumbs} rightSlot={right}>
		{page}
	  </PersonaLayout>
	</SiteLayout>
  );

  return WrappedPage;
}