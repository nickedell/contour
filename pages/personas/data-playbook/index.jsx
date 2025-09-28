// pages/personas/data-playbook/index.jsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import PersonaLayout from '@/components/personas/PersonaLayout';
import defaultPlaybook from '@/data/defaultPlaybook'; // <- fallback JS object

/* ---------- Simple portal so drawers overlay site chrome ---------- */
function Portal({ children, zIndex = 90 }) {
  const [ready, setReady] = React.useState(false);
  const elRef = React.useRef(null);
  if (!elRef.current && typeof document !== 'undefined') {
	elRef.current = document.createElement('div');
  }
  React.useEffect(() => {
	if (typeof document === 'undefined') return;
	const host = document.body;
	elRef.current.style.position = 'relative';
	elRef.current.style.zIndex = String(zIndex);
	host.appendChild(elRef.current);
	setReady(true);
	return () => { try { host.removeChild(elRef.current); } catch {} };
  }, [zIndex]);
  if (!ready) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('react-dom').createPortal(children, elRef.current);
}

/* ---------- Drawer (journey-style, overlays nav) ---------- */
function SlideOver({ open, onClose, title, headerContent, children, zIndex = 96 }) {
  React.useEffect(() => {
	if (!open) return;
	const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
	window.addEventListener('keydown', onKey);
	return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
	<Portal zIndex={zIndex - 1}>
	  {/* Backdrop */}
	  <div
		className={`fixed inset-0 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}
		style={{ zIndex: zIndex - 1 }}
		onClick={onClose}
	  >
		<div className="absolute inset-0 bg-black/40" />
	  </div>

	  {/* Slide-over */}
	  <aside
		className={`fixed right-0 top-0 h-full w-full sm:w-[560px] md:w-[680px]
		  bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl
		  transform transition-transform duration-300 will-change-transform
		  ${open ? 'translate-x-0' : 'translate-x-full'}`}
		style={{ zIndex }}
		aria-label={title || 'Detail'}
	  >
		<div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
		  <div className="flex items-center gap-3">
			<div className="text-xs uppercase tracking-widest text-neutral-500">
			  {title || 'Details'}
			</div>
			{headerContent ? <div className="text-xs">{headerContent}</div> : null}
		  </div>
		  <button
			onClick={onClose}
			className="h-7 w-7 flex items-center justify-center rounded-md
			  bg-white/90 text-neutral-900 dark:bg-neutral-900/90 dark:text-neutral-100
			  shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition"
			aria-label="Close"
			title="Close"
		  >
			×
		  </button>
		</div>
		<div className="p-4 text-sm overflow-y-auto h-[calc(100%-3rem)]">
		  {children}
		</div>
	  </aside>
	</Portal>
  );
}

/* ---------- Helpers to render data-driven detail ---------- */
function StepDetail({ step }) {
  if (!step) return null;
  const { summary, purpose, activity, output, llm_prompt } = step;
  return (
	<div className="space-y-3">
	  {summary && <p>{summary}</p>}
	  {purpose && (
		<div>
		  <div className="font-semibold mb-1">Purpose:</div>
		  <p>{purpose}</p>
		</div>
	  )}
	  {activity && (
		<div>
		  <div className="font-semibold mb-1">Activity:</div>
		  <p className="whitespace-pre-line">{activity}</p>
		</div>
	  )}
	  {output && (
		<div>
		  <div className="font-semibold mb-1">Output:</div>
		  <p>{output}</p>
		</div>
	  )}
	  {llm_prompt && (
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic whitespace-pre-wrap">
			{llm_prompt}
		  </blockquote>
		</div>
	  )}
	</div>
  );
}

// Add above StageColumn (anywhere near helpers)
function firstSentence(s) {
  if (!s) return '';
  const m = s.match(/.*?[.!?](\s|$)/);
  return m ? m[0].trim() : s;
}

/* ---------- Presentational helpers ---------- */
function StageColumn({ stage, onOpen, doneSteps, stepKey }) {
  return (
	<div className="min-w-[320px] w-[420px]">
	  <div className="mb-2 flex items-center justify-between pr-2">
		<div className="flex items-center gap-2">
		  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs text-neutral-200">
			{stage.letter}
		  </div>
		  <div className="text-sm font-semibold text-neutral-100">{stage.title}</div>
		</div>
		<div className="text-[10px] uppercase tracking-widest text-neutral-600">&nbsp;</div>
	  </div>

	  <div className="space-y-3">
		{(stage.steps || []).map((step, i) => {
		  const stepId = step.id ?? step.key ?? String(i);
		  const isDone = doneSteps.has(stepKey(stage.key, stepId));

		  return (
			<button
			  key={stepId}
			  onClick={() => onOpen(stage, step)}
			  data-done={isDone ? 'true' : 'false'}
			  className={
				`
				w-full text-left rounded-xl border transition p-4
				${isDone
				  ? 'opacity-60 border-neutral-700/50 bg-neutral-950/40 hover:opacity-80'
				  : 'border-neutral-800/70 bg-neutral-950/60 hover:bg-neutral-950/80'
				}
				`
			  }
			>
			  <div className="flex items-start gap-2">
				{/* small white tick when done */}
				<span
				  aria-hidden="true"
				  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1 ring-white/40"
				>
				  {isDone ? (
					<svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
					  <path d="M5 10.5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				  ) : null}
				</span>

				<div className="flex-1">
				  <div className={`text-sm font-semibold ${isDone ? 'text-neutral-400' : 'text-neutral-100'}`}>
					{step.title || step.name}
				  </div>
				  {(step.purpose || step.summary || step.blurb) ? (
					<div className={`mt-1 text-sm ${isDone ? 'text-neutral-400' : 'text-neutral-300'}`}>
					  {firstSentence(step.purpose || step.summary || step.blurb)}
					</div>
				  ) : null}
				</div>
			  </div>
			</button>
		  );
		})}
	  </div>
	</div>
  );
}

/* ---------- Page (layout identical to the version you liked) ---------- */
export default function DataPlaybookPage() {
  // Load playbook JSON -> fallback to JS
  const [playbook, setPlaybook] = React.useState(defaultPlaybook);
  const [loadedFromJson, setLoadedFromJson] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Drawers
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [introOpen, setIntroOpen] = React.useState(true); // open intro on load

  // Active selection (initialize from whatever is in the current playbook)
  const firstSection = playbook.sections?.[0];
  const firstStep = firstSection?.steps?.[0];
  const [active, setActive] = React.useState({
	stageKey: firstSection?.key,
	stepId: firstStep?.id,
  });
  
  // Which stage is currently in view (for active lozenge styling)
  const [viewStageKey, setViewStageKey] = React.useState(firstSection?.key);

  // Fetch /playbook.json (no-store) and fall back to default
  React.useEffect(() => {
	let alive = true;
	(async () => {
	  try {
		setLoading(true);
		setError('');
		const res = await fetch('/playbook.json', { cache: 'no-store' });
		if (res.ok) {
		  const json = await res.json();
		  if (!alive) return;
		  if (!json || !Array.isArray(json.sections)) {
			throw new Error('playbook.json missing "sections" array');
		  }
		  setPlaybook(json);
		  setLoadedFromJson(true);
		  const s0 = json.sections?.[0];
		  setActive({
			stageKey: s0?.key,
			stepId: s0?.steps?.[0]?.id,
		  });
		  setIntroOpen(true); // keep intro drawer behaviour
		} else {
		  // keep default
		  setLoadedFromJson(false);
		}
	  } catch (e) {
		if (alive) setError(e.message || 'Failed to load playbook.json');
	  } finally {
		if (alive) setLoading(false);
	  }
	})();
	return () => { alive = false; };
  }, []);

  // Build STAGES (A/B/C/…) from playbook.sections in order
  const stages = React.useMemo(() => {
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	const wantedOrder = ['eda', 'personas', 'deploy', 'appendix']; // if keys exist, keep them in this friendly order
	const sections = Array.isArray(playbook.sections) ? playbook.sections.slice() : [];

	// sort by our friendly order if keys match; otherwise keep input order
	sections.sort((a, b) => {
	  const ia = wantedOrder.indexOf(a.key);
	  const ib = wantedOrder.indexOf(b.key);
	  if (ia === -1 && ib === -1) return 0;
	  if (ia === -1) return 1;
	  if (ib === -1) return -1;
	  return ia - ib;
	});

	return sections.map((sec, idx) => ({
	  key: sec.key,
	  letter: letters[idx] || '?',
	  title: sec.title,
	  steps: sec.steps || [],
	}));
  }, [playbook.sections]);

  // Refs for smooth scroll per stage (stable per key)
  const sectionRefs = React.useRef({});
  const getSectionRef = React.useCallback((key) => {
	if (!sectionRefs.current[key]) {
	  sectionRefs.current[key] = React.createRef();
	}
	return sectionRefs.current[key];
  }, []);

  // Observe sections so the active pill follows scroll (must run after stages/refs exist)
  React.useEffect(() => {
	const observer = new IntersectionObserver(
	  (entries) => {
		const topMost = entries
		  .filter(e => e.isIntersecting)
		  .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
		const key = topMost?.target?.dataset?.stageKey;
		if (key) setViewStageKey(key);
	  },
	  { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.25, 0.5, 0.75] }
	);
  
	stages.forEach(s => {
	  const el = getSectionRef(s.key)?.current;
	  if (el) observer.observe(el);
	});
  
	return () => observer.disconnect();
  }, [stages, getSectionRef]);

  // Active objects
  const activeStage = React.useMemo(
	() => stages.find(s => s.key === active.stageKey) || null,
	[stages, active.stageKey]
  );
  const activeStep = React.useMemo(
	() => (activeStage?.steps || []).find(st => st.id === active.stepId) || null,
	[activeStage, active.stepId]
  );

  // Step completion (session memory) — keys look like "B::archetypes"
  const stepKey = (stageKey, stepId) => `${stageKey}::${stepId}`;

  const [doneSteps, setDoneSteps] = React.useState(new Set());
  React.useEffect(() => {
	try {
	  const arr = JSON.parse(sessionStorage.getItem('playbookDoneSteps') || '[]');
	  setDoneSteps(new Set(Array.isArray(arr) ? arr : []));
	} catch {}
  }, []);
  React.useEffect(() => {
	try {
	  sessionStorage.setItem('playbookDoneSteps', JSON.stringify([...doneSteps]));
	} catch {}
  }, [doneSteps]);

  const toggleStepDone = React.useCallback((sKey, stId) => {
	const k = stepKey(sKey, stId);
	setDoneSteps(prev => {
	  const next = new Set(prev);
	  if (next.has(k)) next.delete(k); else next.add(k);
	  return next;
	});
  }, []);

  const downloadProgress = React.useCallback(() => {
	const data = {
	  meta: playbook?.meta || {},
	  active,
	  doneSteps: [...doneSteps],
	  exportedAt: new Date().toISOString()
	};
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'playbook_progress.json';
	document.body.appendChild(a);
	a.click();
	URL.revokeObjectURL(url);
	a.remove();
  }, [doneSteps, active, playbook]);

  // Import progress from JSON
  const fileInputRef = React.useRef(null);
  const handleImportProgress = React.useCallback((e) => {
	const file = e.target.files?.[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = () => {
	  try {
		const data = JSON.parse(reader.result);
		// Support both new (doneSteps) and legacy (doneStages) keys
		const list = Array.isArray(data?.doneSteps)
		  ? data.doneSteps
		  : Array.isArray(data?.doneStages)
			? data.doneStages // legacy stage-level keys; harmless to store
			: [];
		setDoneSteps(new Set(list.map(String)));
	  } catch (err) {
		console.error('Invalid progress file', err);
	  }
	};
	reader.readAsText(file);
	e.target.value = '';
  }, []);

  const openStep = (stage, step) => {
	setActive({ stageKey: stage.key, stepId: step.id });
	setDrawerOpen(true);
  };

  const scrollToStage = (key) => {
	const node = getSectionRef(key)?.current;
	if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  };

  /* -------- BAND-AID: Hide "< Guide" link ONLY on this page -------- */
  React.useEffect(() => {
	// 1) Inject a global style that hides any anchor whose href contains /personas/guide
	const style = document.createElement('style');
	style.id = 'hide-guide-link-style';
	style.textContent = `
	  a[href*="/personas/guide"],
	  a[href*="/Personas/guide"],
	  a[href*="personas/guide"],
	  a[href$="/guide"],
	  a[href$="/guide/"] { display: none !important; }
	`;
	document.head.appendChild(style);

	// 2) JS pass — catch variants (icons, absolute URLs, text-only, etc.)
	const hideCandidates = () => {
	  const nodes = document.querySelectorAll('a, [role="link"], button');
	  nodes.forEach((el) => {
		const href = (el.getAttribute('href') || '').toLowerCase();
		const aria = (el.getAttribute('aria-label') || '').toLowerCase();
		const title = (el.getAttribute('title') || '').toLowerCase();
		const text = (el.textContent || '').toLowerCase().replace(/\s+/g, ' ').trim();

		const looksGuide =
		  href.includes('/personas/guide') ||
		  href.endsWith('/guide') ||
		  href.endsWith('/guide/') ||
		  aria.includes('guide') ||
		  title.includes('guide') ||
		  text.includes('guide');

		if (looksGuide) {
		  el.dataset._guideHidden = 'true';
		  el.style.display = 'none';
		}
	  });
	};

	hideCandidates();
	const mo = new MutationObserver(hideCandidates);
	mo.observe(document.body, { childList: true, subtree: true });

	return () => {
	  mo.disconnect();
	  try { document.head.removeChild(style); } catch {}
	  document.querySelectorAll('[data-_guide-hidden]').forEach((el) => {
		el.style.display = '';
		delete el.dataset._guideHidden;
	  });
	};
  }, []);
  /* ----------------------------------------------------------------- */

  // Intro: prefer JSON; if absent, fall back to the flat one-pager content verbatim
  const INTRO = (() => {
	const hasJsonIntro = Array.isArray(playbook?.intro?.body) && playbook.intro.body.length > 0;
	if (hasJsonIntro) {
	  return (
		<div className="space-y-4">
		  <h2 className="text-base font-semibold">
			{playbook?.intro?.title || 'From Survey Data to Decision-Ready Personas.'}
		  </h2>
		  {(playbook?.intro?.body || []).map((p, i) => <p key={i}>{p}</p>)}
		  <div className="mt-4 text-xs text-neutral-500">
			{playbook?.meta?.version ? `v ${playbook.meta.version}` : 'v 1.0'}{' '}
			{playbook?.meta?.author ? `| ${playbook.meta.author}` : ''}{' '}
			{playbook?.meta?.org ? `| ${playbook.meta.org}` : ''}{' '}
			{playbook?.meta?.date ? `| ${playbook.meta.date}` : ''}
		  </div>
		</div>
	  );
	}

	// --- FALLBACK (verbatim content from the flat page) ---
	return (
	  <div className="space-y-4">
		<h2 className="text-base font-semibold">
		  From Survey Data to Decision-Ready Personas.<br/>An AI-powered playbook.
		</h2>
		<p><b>EDA → Personas → Decision Engine Framework</b></p>
		<p>
		  We have created a repeatable playbook that takes attitudinal and behavioural survey data (e.g. PTSB’s
		  Reflecting Ireland survey) and transforms it into decision-ready personas.
		</p>
		<div>
		  <div className="font-semibold mb-1">Why this is useful:</div>
		  <ul className="list-disc pl-5 space-y-1">
			<li><b>Evidence-based:</b> Personas are grounded in actual data, not workshop anecdotes.</li>
			<li><b>Machine + human legibility:</b> Personas are stored in JSON — the same file can be read by AI systems and rendered for humans via a lightweight UI.</li>
			<li><b>Consistency:</b> All personas share the same schema, which makes them comparable, editable and versionable.</li>
			<li><b>Nuanced matching:</b> Instead of rigid buckets, users are matched probabilistically to multiple personas via attribute weightings, enabling more personalised pathways.</li>
			<li><b>Extendable:</b> The framework is not limited to surveys. Additional data sources (aggregated, anonymised transactional data) can enrich the attributes and sharpen the personas.</li>
		  </ul>
		</div>
		<div>
		  <div className="font-semibold mb-1">How to use it:</div>
		  <ul className="list-disc pl-5 space-y-1">
			<li>Run EDA on incoming survey data to extract patterns and theme summaries.</li>
			<li>Define or refine the persona schema (single JSON template).</li>
			<li>Build personas by clustering building blocks, drafting narratives and filling schema attributes.</li>
			<li>Store personas as JSON and render them in a simple UI for stakeholders.</li>
			<li>Use the personas as inputs to a decision engine that recommends personalised, motivating playbooks.</li>
		  </ul>
		</div>
		<p>
		  A single source of truth that bridges design and data science: one framework that serves strategy workshops,
		  client communications and AI-powered decision engines.
		</p>
		<div className="mt-4 text-xs text-neutral-500">
		  v 1.1 | Nick Edell | Infosys Consulting | 24 Sept 2025
		</div>
	  </div>
	);
  })();

  // end intro 
  return (
	<PersonaLayout
	  breadcrumbs={[
		{ label: 'Personas' },
		{ label: playbook?.meta?.breadcrumb || 'EDA + Vector Personas Playbook' },
	  ]}
	  rightSlot={
		<Link href="/personas" className="text-sm px-3 py-1.5 rounded-md hover:bg-white/5">
		  / Personas /
		</Link>
	  }
	>
	  {/* Sticky header — Workflow row (full-width grey bar + keyline, flush to nav) */}
	  <div className="sticky top-[3.45rem] z-30 -mt-[1.5rem] mb-5">
		{/* full-bleed background while keeping centered content */}
		<div className="
		  relative left-1/2 -ml-[50vw] w-screen
		  bg-neutral-100/90 dark:bg-neutral-900/70
		  supports-[backdrop-filter]:backdrop-blur
		  supports-[backdrop-filter]:bg-neutral-100/70
		  dark:supports-[backdrop-filter]:bg-neutral-900/60
		  border-b border-neutral-200 dark:border-neutral-800
		">
		  <div className="max-w-[1300px] mx-auto px-4 py-1.5">
			<div className="flex flex-wrap items-center gap-2">
			  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Workflow</span>

			  {stages.map((s) => {
				const active = viewStageKey === s.key; // from the IntersectionObserver
				return (
				  <button
					key={s.key}
					onClick={() => scrollToStage(s.key)}
					aria-pressed={active}
					className={[
					  "rounded-full px-3 py-1.5 text-[12px] font-medium transition border",
					  active
						? "bg-neutral-800 text-neutral-50 border-neutral-700"
						: "bg-neutral-950/40 text-neutral-300 border-neutral-800 hover:bg-neutral-800/60",
					].join(" ")}
					title={`${s.letter}: ${s.title}`}
				  >
					{s.title}
				  </button>
				);
			  })}
			</div>
		  </div>
		</div>
	  </div>

	  {/* Canvas — horizontal columns (unchanged layout) */}
	  <div className="w-full overflow-x-auto pb-8">
		<div className="grid auto-cols-[420px] grid-flow-col gap-6 min-w-max">
		  {stages.map((stage) => (
			<section key={stage.key} ref={getSectionRef(stage.key)} data-stage-key={stage.key}>
			  <StageColumn
				stage={stage}
				onOpen={openStep}
				doneSteps={doneSteps}
				stepKey={stepKey}
			  />
			</section>
		  ))}
		</div>
	  </div>

	  {/* Intro drawer (opens on load) */}
	  <SlideOver
		open={introOpen}
		onClose={() => setIntroOpen(false)}
		title={playbook?.intro?.drawerTitle || 'Data Playbook — Introduction'}
		zIndex={98}
	  >
		{INTRO}
	  </SlideOver>

	  {/* Stage detail drawer */}
	  <SlideOver
		open={drawerOpen}
		onClose={() => setDrawerOpen(false)}
		title={
		  activeStage && activeStep
			? `${activeStage.letter}. ${activeStep.title || activeStep.name}`
			: 'Details'
		}
		headerContent={
		  activeStage && activeStep ? (
			<div className="flex items-center gap-3">
			  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
				<input
				  type="checkbox"
				  className="h-3 w-3"
				  checked={doneSteps.has(stepKey(activeStage.key, activeStep.id))}
				  onChange={() => toggleStepDone(activeStage.key, activeStep.id)}
				/>
				<span className="text-[11px] text-neutral-500">
				  Mark “{activeStage.letter}. {(() => {
					const idx = (activeStage?.steps || []).findIndex(s => s.id === activeStep.id) + 1;
					const titleTail = (activeStep.title || activeStep.name || '').replace(/^\d+\.\s*/, '');
					return `${idx}. ${titleTail || 'This step'}`;
				  })()}” done
				</span>
			  </label>

			  <button
				onClick={() => fileInputRef.current?.click()}
				className="text-[11px] underline hover:no-underline"
				title="Import a JSON to set steps as done"
			  >
				Import progress
			  </button>
			  <input
				ref={fileInputRef}
				type="file"
				accept="application/json"
				className="hidden"
				onChange={handleImportProgress}
			  />

			  <button
				onClick={downloadProgress}
				className="text-[11px] underline hover:no-underline"
				title="Download your progress as JSON"
			  >
				Download progress
			  </button>
			</div>
		  ) : null
		}

		zIndex={96}
	  >
		<div className="space-y-2">
		  {activeStage?.title ? (
			<div className="text-xs uppercase tracking-widest text-neutral-500">
			  {activeStage.title}
			</div>
		  ) : null}
		  <StepDetail step={activeStep} />
		</div>
	  </SlideOver>

	  {/* Status */}
	  {!loading && error ? (
		<div className="mt-4 text-sm text-red-400">Error loading playbook.json: {error}</div>
	  ) : null}
	  {!loading && loadedFromJson === false ? (
		<div className="mt-2 text-xs text-neutral-500">
		  Using embedded default (no <code>public/playbook.json</code> found).
		</div>
	  ) : null}
	</PersonaLayout>
  );
}
