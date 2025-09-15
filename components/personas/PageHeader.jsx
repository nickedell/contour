// components/personas/PageHeader.jsx
/**
 * PageHeader (Personas)
 * Shared header used across all /personas pages.
 * Matches the deployed style & spacing exactly.
 */
import Link from 'next/link';

export default function PageHeader({
  title,                // e.g. "Personas Library" | "Personas / New" | "Personas / Team" | "Personas / Profile"
  right,                // optional JSX for right-side controls (buttons/links)
}) {
  return (
	<div className="px-5 sm:px-6 lg:px-8 py-4 border-b border-white/10 flex items-center justify-between">
	  <h1 className="text-xl font-extrabold tracking-tight">
		<span className="font-extrabold">Contour</span>
		<span className="font-light"> – {title}</span>
	  </h1>
	  {right ? <div className="flex items-center gap-2">{right}</div> : null}
	</div>
  );
}