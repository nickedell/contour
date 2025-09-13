/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import React from 'react';

export default function PersonaCard({ persona, showEvidence }) {
  const data = persona?.data || {};
  return (
	<div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm">
	  <div className="flex items-start justify-between gap-3">
		<div>
		  <h3 className="text-sm font-semibold">{persona.name}</h3>
		  <div className="text-xs text-neutral-500">
			{persona.role || data.role || '—'}
		  </div>
		</div>
		{Array.isArray(persona.tags) && persona.tags.length ? (
		  <div className="flex flex-wrap gap-1 justify-end">
			{persona.tags.slice(0,4).map((t) => (
			  <span key={t} className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">#{t}</span>
			))}
		  </div>
		) : null}
	  </div>

	  {/* Snapshot summary */}
	  {data.summary ? (
		<p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 line-clamp-4">
		  {data.summary}
		</p>
	  ) : null}

	  {/* Evidence (optional) */}
	  {showEvidence && Array.isArray(data.evidence) && data.evidence.length ? (
		<div className="mt-3">
		  <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">Evidence</div>
		  <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
			{data.evidence.slice(0,6).map((ev, i) => (
			  <li key={i} className="truncate">• {typeof ev === 'string' ? ev : (ev.title || ev.url || 'Source')}</li>
			))}
		  </ul>
		</div>
	  ) : null}
	</div>
  );
}
