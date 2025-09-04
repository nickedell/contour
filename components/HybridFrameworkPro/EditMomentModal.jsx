import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * EditMomentModal
 * Props:
 * - open
 * - onClose
 * - stages: [{key,label,order}]
 * - initial: moment object or null (for add)
 * - onSave(moment) -> expects full normalized moment
 * - existingIds: string[] (for uniqueness check on add / id change)
 */
export default function EditMomentModal({ open, onClose, stages, initial, onSave, existingIds }) {
  const isEdit = !!initial;
  const [id, setId] = useState(initial?.id || '');
  const [title, setTitle] = useState(initial?.title || '');
  const [stageKey, setStageKey] = useState(initial?.stageKey || initial?.stage || stages?.[0]?.key || '');
  const [column, setColumn] = useState(initial?.column ?? 1);
  const [description, setDescription] = useState(initial?.description || '');

  // helper to normalise CSV/array
  const arr = (x) =>
    Array.isArray(x) ? x : (typeof x === 'string' && x.trim() ? x.split(',').map(s => s.trim()).filter(Boolean) : []);

  const [personas, setPersonas] = useState(arr(initial?.experience?.personas).join(', '));
  const [jobs, setJobs] = useState(arr(initial?.experience?.jobsToBeDone).join(', '));
  const [truths, setTruths] = useState(arr(initial?.experience?.momentsOfTruth).join(', '));
  const [artefacts, setArtefacts] = useState(arr(initial?.experience?.artefacts).join(', '));

  const [signals, setSignals] = useState(arr(initial?.ai?.signals).join(', '));
  const [models, setModels] = useState(arr(initial?.ai?.models).join(', '));
  const [automations, setAutomations] = useState(arr(initial?.ai?.automations).join(', '));
  const [risks, setRisks] = useState(arr(initial?.ai?.risks).join(', '));

  const [barriers, setBarriers] = useState(arr(initial?.behaviour?.barriers).join(', '));
  const [nudges, setNudges] = useState(arr(initial?.behaviour?.nudges).join(', '));
  const [frameworks, setFrameworks] = useState(arr(initial?.behaviour?.frameworks).join(', '));
  const [habit, setHabit] = useState(initial?.behaviour?.habit || '');

  const [checks, setChecks] = useState(arr(initial?.governance?.checks).join(', '));
  const [metrics, setMetrics] = useState(arr(initial?.governance?.metrics).join(', '));

  const [layers, setLayers] = useState(arr(initial?.layers || ['service','experience','behaviour','systems','value','ai','governance']).join(', '));
  const [dpLevel, setDpLevel] = useState(initial?.dpLevel || 'tactical');

  // optional kpis (JSON textarea)
  const [kpisRaw, setKpisRaw] = useState(initial?.kpis ? JSON.stringify(initial.kpis, null, 2) : '');

  const [error, setError] = useState('');

  useEffect(()=>{ if (open) setError(''); }, [open]);

  const onSubmit = (e) => {
    e?.preventDefault?.();
    // validations
    if (!id.trim()) return setError('ID is required.');
    if (!title.trim()) return setError('Title is required.');
    if (!stageKey) return setError('Stage is required.');
    const col = parseInt(column, 10);
    if (Number.isNaN(col) || col < 1 || col > 12) return setError('Column must be 1…12.');
    const idChanged = !isEdit || id !== initial.id;
    if (idChanged && existingIds?.includes(id)) return setError('ID must be unique.');

    let kpis = {};
    if (kpisRaw && kpisRaw.trim()) {
      try { kpis = JSON.parse(kpisRaw); } catch { return setError('KPIs must be valid JSON (key -> 0..1).'); }
    }

    const toArr = (s) => (s && s.trim() ? s.split(',').map(x=>x.trim()).filter(Boolean) : []);
    const moment = {
      id: id.trim(),
      title: title.trim(),
      stageKey,
      column: col,
      description: description.trim(),
      experience: {
        personas: toArr(personas),
        jobsToBeDone: toArr(jobs),
        momentsOfTruth: toArr(truths),
        artefacts: toArr(artefacts),
      },
      ai: {
        signals: toArr(signals),
        models: toArr(models),
        automations: toArr(automations),
        risks: toArr(risks),
      },
      behaviour: {
        barriers: toArr(barriers),
        nudges: toArr(nudges),
        frameworks: toArr(frameworks),
        habit: habit.trim(),
      },
      governance: {
        checks: toArr(checks),
        metrics: toArr(metrics),
      },
      layers: toArr(layers),
      dpLevel,
    };
    if (kpis && Object.keys(kpis).length) moment.kpis = kpis;

    onSave(moment);
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none opacity-0'} transition-opacity`}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <form onSubmit={onSubmit} className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-neutral-500">{isEdit ? 'Edit Moment' : 'Add Moment'}</div>
            <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900"><X className="h-4 w-4"/></button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Text label="ID" value={id} onChange={setId} placeholder="unique-id" />
            <Text label="Title" value={title} onChange={setTitle} placeholder="Moment title" />

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Stage</label>
              <select value={stageKey} onChange={e=>setStageKey(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Column (1–12)</label>
              <input type="number" min="1" max="12" value={column} onChange={e=>setColumn(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"/>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Description</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" placeholder="What happens here and why it matters…"/>
            </div>

            {/* Experience */}
            <Fieldset title="Value & Experience">
              <Text label="Personas (CSV)" value={personas} onChange={setPersonas} placeholder="Marketer (Account Manager), Commercial Manager" />
              <Text label="Jobs to be Done (CSV)" value={jobs} onChange={setJobs} placeholder="Quote quickly, Stay compliant" />
              <Text label="Moments of Truth (CSV)" value={truths} onChange={setTruths} placeholder="Latency, Reliability" />
              <Text label="Artefacts (CSV)" value={artefacts} onChange={setArtefacts} placeholder="Quote composer, KPI pack" />
            </Fieldset>

            {/* AI & Data */}
            <Fieldset title="AI & Data">
              <Text label="Signals (CSV)" value={signals} onChange={setSignals} placeholder="Live price curves, Buyer risk" />
              <Text label="Models (CSV)" value={models} onChange={setModels} placeholder="Pricing recommendation, Anomaly detection" />
              <Text label="Automations (CSV)" value={automations} onChange={setAutomations} placeholder="Guardrail validation, Timer alerts" />
              <Text label="Risks (CSV)" value={risks} onChange={setRisks} placeholder="Over-automation, Market shocks" />
            </Fieldset>

            {/* Behavioural */}
            <Fieldset title="Behavioural Adoption">
              <Text label="Barriers (CSV)" value={barriers} onChange={setBarriers} placeholder="Overtrust, Stress" />
              <Text label="Nudges (CSV)" value={nudges} onChange={setNudges} placeholder="Confidence ranges, Reason codes" />
              <Text label="Frameworks (CSV)" value={frameworks} onChange={setFrameworks} placeholder="Fogg, EAST" />
              <Text label="Habit (free text)" value={habit} onChange={setHabit} placeholder="Rep reviews rec and logs rationale" />
            </Fieldset>

            {/* Governance */}
            <Fieldset title="Governance & Risk">
              <Text label="Checks (CSV)" value={checks} onChange={setChecks} placeholder="Pricing policy, Exception logging" />
              <Text label="Metrics (CSV)" value={metrics} onChange={setMetrics} placeholder="TTFR, Quote-to-win %" />
            </Fieldset>

            {/* Layers & DP level */}
            <Text label="Layers (CSV)" value={layers} onChange={setLayers} placeholder="experience, ai, governance" />
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">DP Level</label>
              <select value={dpLevel} onChange={e=>setDpLevel(e.target.value)} className="w-full px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <option value="tactical">tactical</option>
                <option value="integrated">integrated</option>
              </select>
            </div>

            {/* KPIs JSON */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">KPIs (JSON, 0..1 values)</label>
              <textarea value={kpisRaw} onChange={e=>setKpisRaw(e.target.value)} rows={4} className="w-full px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" placeholder='{"Quote-to-win %": 0.61, "TTFR": 0.44}'/>
            </div>
          </div>

          {error && <div className="px-4 pb-2 text-rose-600 text-sm">{error}</div>}

          <div className="p-4 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900">Cancel</button>
            <button type="submit" className="px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Fieldset({ title, children }) {
  return (
    <fieldset className="md:col-span-2 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
      <legend className="px-1 text-[10px] uppercase tracking-widest text-neutral-500">{title}</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {children}
      </div>
    </fieldset>
  );
}

function Text({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
      />
    </div>
  );
}
