/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PersonaCard from '../../../components/personas/PersonaCard';

export default function PersonaSetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [payload, setPayload] = useState(null);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
	if (!id) return;
	fetch(`/api/personas/set/${id}`)
	  .then(r => r.json())
	  .then(setPayload)
	  .catch(() => setPayload({ error: 'Failed to load' }));
  }, [id]);

  if (!payload) {
	return <div className="min-h-screen bg-white dark:bg-[#121417] text-black dark:text-white px-6 py-8">Loading…</div>;
  }
  if (payload.error) {
	return <div className="min-h-screen bg-white dark:bg-[#121417] text-black dark:text-white px-6 py-8">Error: {payload.error}</div>;
  }

  const { set, personas } = payload;

  return (
	<div className="min-h-screen bg-white dark:bg-[#121417] text-black dark:text-white px-6 py-8">
	  <div className="flex items-center justify-between">
		<div>
		  <h1 className="text-xl font-extrabold tracking-tight">{set.name}</h1>
		  <div className="text-sm text-neutral-500">{set.context || '—'}</div>
		</div>
		<div className="flex items-center gap-3">
		  <label className="text-sm flex items-center gap-2">
			<input type="checkbox" checked={showEvidence} onChange={() => setShowEvidence(v=>!v)} className="accent-neutral-600 dark:accent-neutral-400" />
			Show evidence
		  </label>
		</div>
	  </div>

	  {Array.isArray(set.tags) && set.tags.length ? (
		<div className="mt-3 flex flex-wrap gap-1">
		  {set.tags.map((t) => (
			<span key={t} className="px-2 py-[2px] text-[10px] rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">#{t}</span>
		  ))}
		</div>
	  ) : null}

	  <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{(personas || []).map((p) => (
		  <PersonaCard key={p.id} persona={p} showEvidence={showEvidence} />
		))}
	  </div>
	</div>
  );
}
