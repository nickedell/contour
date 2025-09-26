// pages/personas/data-playbook/admin.jsx
'use client';

import * as React from 'react';
import defaultPlaybook from '@/data/defaultPlaybook';

function SectionEditor({ section, onChange, onDelete }) {
  const update = (patch) => onChange({ ...section, ...patch });

  return (
	<div className="rounded-xl border border-neutral-800/70 p-4 space-y-3 bg-neutral-950/60">
	  <div className="flex items-center gap-2">
		<input
		  className="px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800 flex-1"
		  placeholder="Section title"
		  value={section.title}
		  onChange={(e) => update({ title: e.target.value })}
		/>
		<input
		  className="px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800 w-48"
		  placeholder="Key (unique)"
		  value={section.key}
		  onChange={(e) => update({ key: e.target.value })}
		/>
		<button
		  className="text-xs px-2 py-1 border border-red-700 rounded-md hover:bg-red-900/30"
		  onClick={onDelete}
		>
		  Delete
		</button>
	  </div>

	  <div className="space-y-2">
		<div className="text-xs uppercase tracking-widest text-neutral-500">Steps</div>
		{(section.steps || []).map((st, idx) => (
		  <div key={st.id} className="rounded-md border border-neutral-800 p-3 space-y-2">
			<div className="flex items-center gap-2">
			  <input
				className="px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800 flex-1"
				placeholder="Step title"
				value={st.title}
				onChange={(e) => {
				  const next = section.steps.slice();
				  next[idx] = { ...st, title: e.target.value };
				  update({ steps: next });
				}}
			  />
			  <input
				className="px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800 w-40"
				placeholder="ID (unique)"
				value={st.id}
				onChange={(e) => {
				  const next = section.steps.slice();
				  next[idx] = { ...st, id: e.target.value };
				  update({ steps: next });
				}}
			  />
			  <button
				className="text-xs px-2 py-1 border border-red-700 rounded-md hover:bg-red-900/30"
				onClick={() => {
				  const next = section.steps.filter((_, i) => i !== idx);
				  update({ steps: next });
				}}
			  >
				Remove
			  </button>
			</div>

			<textarea
			  className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
			  placeholder="Summary"
			  rows={2}
			  value={st.summary || ''}
			  onChange={(e) => {
				const next = section.steps.slice();
				next[idx] = { ...st, summary: e.target.value };
				update({ steps: next });
			  }}
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
			  <textarea
				className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
				placeholder="Purpose"
				rows={3}
				value={st.purpose || ''}
				onChange={(e) => {
				  const next = section.steps.slice();
				  next[idx] = { ...st, purpose: e.target.value };
				  update({ steps: next });
				}}
			  />
			  <textarea
				className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
				placeholder="Activity"
				rows={3}
				value={st.activity || ''}
				onChange={(e) => {
				  const next = section.steps.slice();
				  next[idx] = { ...st, activity: e.target.value };
				  update({ steps: next });
				}}
			  />
			  <textarea
				className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
				placeholder="Output"
				rows={3}
				value={st.output || ''}
				onChange={(e) => {
				  const next = section.steps.slice();
				  next[idx] = { ...st, output: e.target.value };
				  update({ steps: next });
				}}
			  />
			  <textarea
				className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
				placeholder="LLM Prompt"
				rows={5}
				value={st.llm_prompt || ''}
				onChange={(e) => {
				  const next = section.steps.slice();
				  next[idx] = { ...st, llm_prompt: e.target.value };
				  update({ steps: next });
				}}
			  />
			</div>
		  </div>
		))}
		<button
		  className="text-xs px-2 py-1 border border-neutral-600 rounded-md hover:bg-neutral-800"
		  onClick={() => {
			const next = (section.steps || []).concat([
			  { id: `step-${Date.now()}`, title: 'New step', summary: '' },
			]);
			update({ steps: next });
		  }}
		>
		  + Add step
		</button>
	  </div>
	</div>
  );
}

export default function PlaybookAdmin() {
  const [model, setModel] = React.useState(defaultPlaybook);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

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
		  setModel(json);
		} else {
		  // keep default
		}
	  } catch (e) {
		if (alive) setError(e.message || 'Failed to load playbook.json');
	  } finally {
		if (alive) setLoading(false);
	  }
	})();
	return () => {
	  alive = false;
	};
  }, []);

  const setIntro = (patch) => setModel((m) => ({ ...m, intro: { ...(m.intro || {}), ...patch } }));

  const setSections = (next) => setModel((m) => ({ ...m, sections: next }));

  const download = () => {
	const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.download = 'playbook.json';
	a.href = url;
	a.click();
	URL.revokeObjectURL(url);
  };

  const onUpload = (file) => {
	const r = new FileReader();
	r.onload = () => {
	  try {
		const json = JSON.parse(r.result);
		if (!json || !Array.isArray(json.sections)) throw new Error('Invalid JSON: missing "sections" array');
		setModel(json);
	  } catch (e) {
		alert(e.message || 'Invalid JSON');
	  }
	};
	r.readAsText(file);
  };

  return (
	<div className="min-h-screen bg-white text-black dark:bg-[#121417] dark:text-neutral-100">
	  <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#121417]/70 backdrop-blur">
		<div className="max-w-[1300px] mx-auto px-4 py-3 flex items-center justify-between">
		  <h1 className="text-lg font-extrabold tracking-tight">
			<span className="font-extrabold">Playbook</span>
			<span className="font-light"> — Admin</span>
		  </h1>
		  <div className="flex items-center gap-2">
			<label className="text-xs px-2 py-1 border rounded-md cursor-pointer border-neutral-700 hover:bg-neutral-900">
			  Upload JSON
			  <input
				type="file"
				accept="application/json"
				className="hidden"
				onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
			  />
			</label>
			<button
			  className="text-xs px-2 py-1 border border-neutral-700 rounded-md hover:bg-neutral-900"
			  onClick={download}
			>
			  Download JSON
			</button>
		  </div>
		</div>
	  </header>

	  <main className="max-w-[1300px] mx-auto px-4 py-6 space-y-6">
		{loading && <div className="text-sm text-neutral-400">Loading…</div>}
		{error && <div className="text-sm text-red-400">Error: {error}</div>}

		{/* Intro */}
		<section>
		  <div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Intro</div>
		  <div className="rounded-xl border border-neutral-800/70 p-4 space-y-3 bg-neutral-950/60">
			<input
			  className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
			  placeholder="Intro title"
			  value={model.intro?.title || ''}
			  onChange={(e) => setIntro({ title: e.target.value })}
			/>
			<textarea
			  className="w-full px-2 py-1.5 text-sm rounded-md bg-neutral-900 border border-neutral-800"
			  placeholder="Intro body (one paragraph per line)"
			  rows={5}
			  value={(model.intro?.body || []).join('\n')}
			  onChange={(e) => setIntro({ body: e.target.value.split('\n').filter(Boolean) })}
			/>
		  </div>
		</section>

		{/* Sections */}
		<section>
		  <div className="mb-2 text-sm uppercase tracking-widest text-neutral-500">Sections</div>
		  <div className="space-y-4">
			{(model.sections || []).map((sec, idx) => (
			  <SectionEditor
				key={sec.key || idx}
				section={sec}
				onChange={(nextSec) => {
				  const next = model.sections.slice();
				  next[idx] = nextSec;
				  setSections(next);
				}}
				onDelete={() => {
				  const next = model.sections.filter((_, i) => i !== idx);
				  setSections(next);
				}}
			  />
			))}
			<button
			  className="text-xs px-2 py-1 border border-neutral-600 rounded-md hover:bg-neutral-800"
			  onClick={() => {
				const next = (model.sections || []).concat([
				  { key: `sec-${Date.now()}`, title: 'New section', steps: [] },
				]);
				setSections(next);
			  }}
			>
			  + Add section
			</button>
		  </div>
		</section>
	  </main>
	</div>
  );
}
