// pages/personas/data-playbook/index.jsx
import * as React from 'react';
import Link from 'next/link';
import PersonaLayout from '@/components/personas/PersonaLayout';

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
  return require('react-dom').createPortal(children, elRef.current);
}

/* ---------- Drawer (journey-style, overlays nav) ---------- */
function SlideOver({ open, onClose, title, children, zIndex = 96 }) {
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
		className={`fixed right-0 top-0 h-full w-full sm:w-[420px]
					bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl
					transform transition-transform duration-300 will-change-transform
					${open ? 'translate-x-0' : 'translate-x-full'}`}
		style={{ zIndex }}
		aria-label={title || 'Detail'}
	  >
		<div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
		  <div className="text-xs uppercase tracking-widest text-neutral-500">{title || 'Details'}</div>
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

/* ---------- Exact content (verbatim from your doc) ---------- */

const INTRO = (
  <div className="space-y-4">
	<h2 className="text-base font-semibold">From Survey Data to Decision-Ready Personas.<br/>An AI-powered playbook.</h2>
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
  </div>
);

/* Each step’s detail is verbatim; light structure only (Purpose/Activity/Output/Prompt when present). */

const EDA_STEPS = [
  {
	key: 'eda-cleaning',
	name: '1. Data Cleaning',
	blurb: 'Ensure comparability and avoid misleading results.',
	detail: (
	  <div className="space-y-2">
		<p><b>Purpose:</b> Ensure comparability and avoid misleading results.</p>
		<p><b>Activity:</b> Check for blanks, duplicates, inconsistent scales. Clean up region codes using the lookup table (Dublin, Rest of Leinster, Munster, Connacht, Ulster).</p>
		<p><b>Output:</b> <code>cleaned_data.xlsx</code>.</p>
	  </div>
	),
  },
  {
	key: 'eda-categorise',
	name: '2. Categorise Questions',
	blurb: 'Tag questions; group into themes; LLM assist.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Bring order to the survey.</p>
		<p><b>Activity:</b> Tag each question as Demographic, Behavioural, Attitudinal, or Contextual. Group them into 5–6 themes (Budgeting, Saving, Housing, Digital, etc.). Use an LLM to speed up classification.</p>
		<p><b>Output:</b> <code>question_catalog.csv</code> with categories and themes.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Classify each of these survey questions into one of four categories (Demographic, Behavioural, Attitudinal, Contextual) and suggest a theme (e.g. Budgeting, Saving, Housing, Digital). Return results as a CSV with columns: question_id, question_text, category, theme.”
		  </blockquote>
		</div>
	  </div>
	),
  },
  {
	key: 'eda-visualise',
	name: '3. Visualise Responses',
	blurb: 'Make the survey legible; charts + heatmaps.',
	detail: (
	  <div className="space-y-2">
		<p><b>Purpose:</b> Make the survey legible.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Per-question bar charts by age.</li>
			<li>Per-theme line charts across age groups (lifecycle curves).</li>
			<li>Heatmaps of all questions × ages for pattern scanning.</li>
		  </ul>
		</div>
		<p><b>Output:</b> <code>/charts/</code> folder with images, ready for review</p>
	  </div>
	),
  },
  {
	key: 'eda-insights',
	name: '4. Extract Insights',
	blurb: 'Turn visuals into meaning; obvious + subtle.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Turn visuals into meaning.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Review charts and note obvious patterns.</li>
			<li>Use an LLM to surface less obvious trends (“hidden correlations”).</li>
		  </ul>
		</div>
		<p><b>Output:</b> “Findings Digest” — a 1–2 page bullet summary.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Review the following survey charts and data. Identify clear patterns (obvious trends) and subtle correlations (less obvious). Summarise in 10 bullet points: 5 obvious, 5 subtle.”
		  </blockquote>
		</div>
	  </div>
	),
  },
  {
	key: 'eda-themes',
	name: '5. Summarise Themes',
	blurb: 'Compact theme statements to reuse later.',
	detail: (
	  <div className="space-y-2">
		<p><b>Purpose:</b> Create compact building blocks.</p>
		<p><b>Activity:</b> Write 1–2 sentences per theme describing overall patterns (e.g. “Budgeting discipline rises with age; optimism falls”).</p>
		<p><b>Output:</b> <code>theme_summaries.docx</code> with 5–6 theme summaries.</p>
	  </div>
	),
  },
];

const PERSONA_STEPS = [
  {
	key: 'schema',
	name: '6. Define Persona Schema (bridge step)',
	blurb: 'Translate EDA into a JSON template + scales.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Translate EDA insights into a structured, machine-readable model.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Decide what fields every persona must have (attributes, concerns, motivations, hooks, playbooks, lifecycle transitions).</li>
			<li>Fix scales for each attribute (e.g. 0–1, or low/med/high).</li>
			<li>Confirm JSON as the single source of truth.</li>
		  </ul>
		</div>
		<p><b>Output:</b> <code>persona_schema.json</code> — the template structure for all personas.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Based on these themes and attributes from EDA, propose a JSON schema for personas that includes attributes (0–1 scores), concerns, motivations, hooks, long-term benefits and recommended playbooks.”
		  </blockquote>
		</div>
	  </div>
	),
  },
  {
	key: 'blocks',
	name: '7. Gather Building Blocks',
	blurb: 'Concrete ingredients per age stage.',
	detail: (
	  <div className="space-y-2">
		<p><b>Purpose:</b> Move from abstract theme insights to concrete persona ingredients.</p>
		<p><b>Activity:</b> For each age stage, extract 5–6 distinctive behaviours, attitudes and motivations from the EDA summaries.</p>
		<p><b>Output:</b> “Building blocks” table per age stage.</p>
	  </div>
	),
  },
  {
	key: 'archetypes',
	name: '8. Identify Archetypes',
	blurb: 'Cluster into 4–6 personas per stage.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Cluster building blocks into recognisable, distinct personas.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Group patterns into 4–6 archetypes per age stage.</li>
			<li>Give each a memorable name (e.g. “Carefree Digital Starter”, “Deposit-Focused Upgrader”).</li>
		  </ul>
		</div>
		<p><b>Output:</b> Draft list of persona labels with defining features.</p>
	  </div>
	),
  },
  {
	key: 'narratives',
	name: '9. Draft Narratives',
	blurb: 'Humanise while staying schema-consistent.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Humanise the data while keeping schema consistency.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Use an LLM to generate 100–150 word persona stories based on the building blocks and attributes.</li>
			<li>Edit for clarity and tone.</li>
			<li>Add these narratives as the description field in the JSON schema.</li>
		  </ul>
		</div>
		<p><b>Output:</b> Narrative fields embedded directly in <code>personas.json</code>.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Write a 150-word persona narrative for a [age stage] individual who shows these attributes: [list attributes with scores]. Ensure the persona is relatable, consistent with data and focused on financial behaviours.”
		  </blockquote>
		</div>
	  </div>
	),
  },
  {
	key: 'populate',
	name: '10. Populate Schema (JSON)',
	blurb: 'Fill schema values; keep structure uniform.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Create the machine-usable persona set.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Fill each persona’s attributes, concerns, hooks and recommended playbooks into the schema.</li>
			<li>Ensure all personas share the same structure (schema).</li>
		  </ul>
		</div>
		<p><b>Output:</b> <code>personas_v1.json</code>.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Fill this JSON template with values based on the following building blocks and narrative: [paste building blocks + draft narrative]. Ensure all numeric attributes are between 0–1 and playbooks are weighted appropriately.”
		  </blockquote>
		</div>
	  </div>
	),
  },
  {
	key: 'validate',
	name: '11. Validate Personas',
	blurb: 'Plausibility, distinctiveness, evidence alignment.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Check plausibility, distinctiveness and alignment with evidence.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Internal review against EDA findings: do the numbers and narratives align?</li>
			<li>Confirm that personas are distinct but not caricatures.</li>
			<li>Ensure attributes add up to coherent behavioural profiles.</li>
		  </ul>
		</div>
		<p><b>Output:</b> Refined persona set in JSON.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Review this set of personas. Are they distinct from each other? Do the numeric attributes match the narrative descriptions? Suggest adjustments for plausibility and balance.”
		  </blockquote>
		</div>
	  </div>
	),
  },
  {
	key: 'transitions',
	name: '12. Map Lifecycle Transitions',
	blurb: 'Connect personas across stages; add probabilities.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Connect personas across age and life stages.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Sketch how personas may evolve across ages (linear and branching).</li>
			<li>Represent transitions in charts (Sankey, chord) and/or as structured JSON references (<code>likely_transitions</code> field).</li>
		  </ul>
		</div>
		<p><b>Output:</b> Lifecycle map visual + transition fields in JSON.</p>
		<div>
		  <div className="font-semibold mb-1">LLM Prompt</div>
		  <blockquote className="border-l-2 border-neutral-700 pl-3 italic">
			“Given this set of personas across age stages, suggest likely lifecycle transitions between them. Represent these as a table of persona_id → persona_id mappings with probabilities.”
		  </blockquote>
		</div>
	  </div>
	),
  },
];

const DEPLOY_STEPS = [
  {
	key: 'ui-admin',
	name: '13. Build UI & Admin Suite',
	blurb: 'Make JSON legible/editable; no DB needed initially.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Make the JSON legible for humans and editable for the team.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Build a lightweight front-end (static site or Next.js app) to render persona cards directly from the JSON.</li>
			<li><code>/admin</code> route provides a simple editor (form fields linked to JSON schema).</li>
			<li>On save, allow download of updated JSON (no database, no sensitive data).</li>
		  </ul>
		</div>
		<p><b>Output:</b></p>
		<ul className="list-disc pl-5 space-y-1">
		  <li>Stakeholder-facing UI for workshops and presentations.</li>
		  <li>Admin panel to create/update personas, producing fresh JSON.</li>
		</ul>
	  </div>
	),
  },
  {
	key: 'version',
	name: '14. Store & Version JSON',
	blurb: 'One source of truth; version and tag releases.',
	detail: (
	  <div className="space-y-3">
		<p><b>Purpose:</b> Maintain one single source of truth, traceable across iterations.</p>
		<div>
		  <b>Activity:</b>
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>Save persona JSON in GitHub (or equivalent) with version numbers (<code>personas_v1.json</code>, <code>personas_v2.json</code>).</li>
			<li>Tag releases when personas are updated for major milestones.</li>
		  </ul>
		</div>
		<p><b>Output:</b> <code>/personas/</code> folder in repo containing versioned JSON.</p>
		<div className="text-neutral-400">
		  This way:
		  <ul className="list-disc pl-5 space-y-1 mt-1">
			<li>JSON is the canonical source — everything else (UI cards, admin forms, charts, decision engine) consumes it.</li>
			<li>Narratives are embedded inside JSON rather than being separate PDFs.</li>
			<li>Editing is controlled via the admin suite, so there’s no risk of schema drift.</li>
		  </ul>
		</div>
	  </div>
	),
  },
];

// Add near EDA_STEPS / PERSONA_STEPS / DEPLOY_STEPS
const APPENDIX_STEPS = [
  {
	key: 'assets',
	name: 'Assets List',
	blurb: 'Templates and example files referenced by the playbook.',
	detail: (
	  <div className="space-y-2">
		<div className="font-semibold">EDA Support</div>
		<ul className="list-disc pl-5 space-y-1">
		  <li>EDA Explainer.pdf</li>
		  <li><code>question_catalog.csv</code> — blank template for classifying questions.</li>
		  <li><code>reflecting_ireland_eda_template.xlsx</code> — cleaning/visualisation/heatmap template.</li>
		</ul>

		<div className="font-semibold mt-3">Persona Schema</div>
		<ul className="list-disc pl-5 space-y-1">
		  <li><code>persona_schema.json</code> — required fields for every persona.</li>
		</ul>

		<div className="font-semibold mt-3">Persona Data</div>
		<ul className="list-disc pl-5 space-y-1">
		  <li><code>personas_example.json</code> — sample personas (e.g. “Snappy Saver”).</li>
		</ul>

		<div className="font-semibold mt-3">Prompt library (.md)</div>
		<ul className="list-disc pl-5 space-y-1">
		  <li><code>prompt_library.md</code></li>
		</ul>
	  </div>
	),
  },
  {
	key: 'cleaning-guide',
	name: 'Data cleaning guide (PTSB Data)',
	blurb: 'Reference guide for cleaning the PTSB survey.',
	detail: (
	  <div className="space-y-2">
		<p>Use the region lookup (Dublin, Rest of Leinster, Munster, Connacht, Ulster), normalise scales, remove duplicates/blanks, and align question ids to the <code>question_catalog.csv</code>.</p>
	  </div>
	),
  },
  {
	key: 'survey-design',
	name: 'Design Guidance for Future Surveys',
	blurb: 'Make future surveys more analysis-friendly.',
	detail: (
	  <div className="space-y-2">
		<ul className="list-disc pl-5 space-y-1">
		  <li>Prefer consistent Likert scales; avoid double-barrel questions.</li>
		  <li>Include demographic anchors enabling stratification (age bands, region).</li>
		  <li>Add a small set of behavioural questions to tie attitudes to actions.</li>
		  <li>Pre-tag questions with provisional category/theme where possible.</li>
		</ul>
	  </div>
	),
  },
];


/* ---------- Stages block ---------- */
const STAGES = [
  { key: 'eda', letter: 'A', title: 'EXPLORATORY DATA ANALYSIS (EDA)', steps: EDA_STEPS },
  { key: 'personas', letter: 'B', title: 'PERSONA CREATION', steps: PERSONA_STEPS },
  { key: 'deploy', letter: 'C', title: 'HUMAN REVIEW / SYSTEM DEPLOYMENT', steps: DEPLOY_STEPS },
  { key: 'appendix', letter: 'D', title: 'APPENDIX',                         steps: APPENDIX_STEPS },
  ];

/* ---------- Presentational helpers ---------- */
function StageColumn({ stage, onOpen }) {
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
		{stage.steps.map((step) => (
		  <button
			key={step.key}
			onClick={() => onOpen(stage, step)}
			className="w-full text-left rounded-xl border border-neutral-800/70 bg-neutral-950/60 hover:bg-neutral-950/80 transition p-4"
		  >
			<div className="text-sm font-semibold text-neutral-100">{step.name}</div>
			<div className="mt-1 text-sm text-neutral-300">{step.blurb}</div>
		  </button>
		))}
	  </div>
	</div>
  );
}

/* ---------- Page ---------- */
export default function DataPlaybookPage() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [introOpen, setIntroOpen] = React.useState(true); // open intro on load
  const [active, setActive] = React.useState({ stage: STAGES[0], step: STAGES[0].steps[0] });
  const sectionRefs = React.useRef(Object.fromEntries(STAGES.map(s => [s.key, React.createRef()])));

  const openStep = (stage, step) => {
	setActive({ stage, step });
	setDrawerOpen(true);
  };

  const scrollToStage = (key) => {
	const node = sectionRefs.current[key]?.current;
	if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  };

  return (
	<PersonaLayout
	  breadcrumbs={[
		{ label: 'Personas' },
		{ label: 'EDA + Vector Personas Playbook' },
	  ]}
	  rightSlot={
		<Link href="/personas" className="text-sm px-3 py-1.5 rounded-md hover:bg-white/5">
		  /
		  Personas
		  /

		</Link>
	  }
	>
	  {/* Sticky pill bar (journey-like) */}
	  <div className="sticky top-[5.5rem] z-10 -mx-4 mb-4">
		<div className="max-w-[1300px] mx-auto px-4">
		  <div className="flex flex-wrap items-center gap-2">
			<span className="text-xs uppercase tracking-widest text-neutral-500 mr-2">Workflow</span>
			{STAGES.map(s => (
			  <button
				key={s.key}
				onClick={() => scrollToStage(s.key)}
				className="px-3 py-1.5 rounded-full text-sm border border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:bg-neutral-800/60 transition"
				title={`${s.letter}: ${s.title}`}
			  >
				{s.title}
			  </button>
			))}
		  </div>
		</div>
	  </div>

	  {/* Canvas — horizontal columns */}
	  <div className="w-full overflow-x-auto pb-8">
		<div className="grid auto-cols-[420px] grid-flow-col gap-6 min-w-max">
		  {STAGES.map((stage) => (
			<section key={stage.key} ref={sectionRefs.current[stage.key]}>
			  <StageColumn stage={stage} onOpen={openStep} />
			</section>
		  ))}
		</div>
	  </div>

	  {/* Intro drawer (opens on load) */}
	  <SlideOver
		open={introOpen}
		onClose={() => setIntroOpen(false)}
		title="Data Playbook — Introduction"
		zIndex={98}
	  >
		{INTRO}
		<div className="mt-4 text-xs text-neutral-500">
		  v 1.1 | Nick Edell | Infosys Consulting | 24 Sept 2025
		</div>
	  </SlideOver>

	  {/* Stage detail drawer */}
	  <SlideOver
		open={drawerOpen}
		onClose={() => setDrawerOpen(false)}
		title={`${active.stage?.letter}. ${active.step?.name}`}
		zIndex={96}
	  >
		<div className="space-y-2">
		  <div className="text-xs uppercase tracking-widest text-neutral-500">{active.stage?.title}</div>
		  <div>{active.step?.detail}</div>
		</div>
	  </SlideOver>
	</PersonaLayout>
  );
}
