// components/personas/ui/Breadcrumbs.jsx
import Link from 'next/link';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
	<nav className="mb-4 text-sm text-neutral-400">
	  <ol className="flex flex-wrap items-center gap-1">
		{items.map((bc, i) => (
		  <li key={`${bc.label}-${i}`} className="flex items-center gap-1">
			{bc.href ? (
			  <Link href={bc.href} className="hover:text-neutral-200">
				{bc.label}
			  </Link>
			) : (
			  <span className="text-neutral-300">{bc.label}</span>
			)}
			{i < items.length - 1 && <span className="opacity-50">/</span>}
		  </li>
		))}
	  </ol>
	</nav>
  );
}