import React from 'react';

/**
 * StageRail — sticky rail of stage letters (A, B, C…).
 * Highlights the current active stage, lets you jump by click.
 *
 * Props:
 *  - stages: [{ key, label, letter }]
 *  - active: string (currently highlighted stage key)
 *  - onJump: (stageKey) => void (scroll to that stage)
 */
export default function StageRail({ stages = [], active, onJump }) {
  return (
	<div className="sticky top-[56px] z-20 bg-white/70 dark:bg-neutral-950/70 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
	  <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2">
		<span className="text-[11px] uppercase tracking-widest text-neutral-500">
		  Stages
		</span>
		<div className="flex gap-4">
		  {stages.map((s) => (
			<button
			  key={s.key}
			  onClick={() => onJump?.(s.key)}
			  className={`h-6 px-2 rounded-full text-[11px] font-semibold transition ${
				active === s.key
				  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
				  : 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900'
			  }`}
			  title={s.label}
			  aria-label={`Go to ${s.label}`}
			>
			  {s.letter} — {s.label}
			</button>
		  ))}
		</div>
	  </div>
	</div>
  );
}
