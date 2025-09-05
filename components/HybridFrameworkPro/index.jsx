// index.jsx
'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

// ——— your libs ———
import { getStages } from '@/lib/stages.js';
import { filterMoments } from '@/lib/filter.js';
import { sortMoments } from '@/lib/sort.js';
import { collectKpiKeys, inferKpiDomains } from '@/lib/kpi.js';
import { getCommentsMap, addComment, deleteComment } from '@/lib/comments.js';

// ——— your components ———
import JourneyTrack from './JourneyView/JourneyTrack';
import LensGrid from './LensView/LensGrid';
import SidePanel from './SidePanel/SidePanel';
import BrandBar from './BrandBar';
import PersonaDirectory from './PersonaDirectory';
import EditMomentModal from './EditMomentModal';
import ConfirmDialog from './ConfirmDialog';
import StageEditor from './StageEditor';
import KpiConfig from './KpiConfig';
import SettingsPanel from './SettingsPanel';

// ——— data ———
import dataset from '@/data/marine.json';

const lanes = [
  { key: 'experience', label: 'Value & Experience',    accent: 'border-emerald-500' },
  { key: 'ai',         label: 'AI & Data',             accent: 'border-sky-500'     },
  { key: 'behaviour',  label: 'Behavioural Adoption',  accent: 'border-amber-500'   },
  { key: 'governance', label: 'Governance & Risk',     accent: 'border-rose-500'    },
];

const LAYER_KEYS = ['service', 'experience', 'behaviour', 'systems', 'value', 'ai', 'governance'];

export default function HybridFrameworkPro() {
  // ——— Theme / layout ———
  const [dark, setDark] = useState(false);
  const [followSystem, setFollowSystem] = useState(true);
  const followSystemRef = useRef(true);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState('journey'); // 'journey' | 'lens'
  const [minH, setMinH] = useState(0);                 // full-height grid

  // ——— Panels & toggles ———
  const [leftOpen, setLeftOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [personasOpen, setPersonasOpen] = useState(false);
  const [stageEditorOpen, setStageEditorOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // ——— Data / filters ———
  const [data, setData] = useState({ ...dataset, __name: 'marine' });
  const [query, setQuery] = useState('');
  const [visibleLanes, setVisibleLanes] = useState({ experience: true, ai: true, behaviour: true, governance: true });
  const [layerVisible, setLayerVisible] = useState({ service: true, experience: true, behaviour: true, systems: true, value: true, ai: true, governance: true });
  const [dpFilter, setDpFilter] = useState('all'); // all | tactical | integrated

  // ——— Selection / edit ———
  const [selected, setSelected] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // ——— Heatmap / KPI ———
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [kpiKey, setKpiKey] = useState('');
  const [kpiConfigOpen, setKpiConfigOpen] = useState(false);
  const [kpiConfig, setKpiConfig] = useState(() => dataset?.kpiConfig || {});

  // ——— Comments ———
  const [commentMode, setCommentMode] = useState(false);
  const [currentUser, setCurrentUser] = useState('Consultant');

  // ——— Present mode ———
  const [presentMode, setPresentMode] = useState(false);

  // ——— Refs ———
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState({ active: false, id: null, startX: 0, startCol: 1 });

  // Title + dark class application
  useEffect(() => { document.title = 'Contour — Integrated System Map'; }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  // Follow system theme by default, live-update unless user overrides
  useEffect(() => { followSystemRef.current = followSystem; }, [followSystem]);
  // Follow system by default; only use stored `dark` if followSystem === false
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hsm:prefs');
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
  
      const applySystem = (e) => {
        // When OS theme changes, update if we're following system
        if (followSystemRef.current) setDark((e?.matches ?? mql.matches));
      };
  
      let fs = true;
      if (raw) {
        const p = JSON.parse(raw);
        fs = typeof p.followSystem === 'boolean' ? p.followSystem : true;
        setFollowSystem(fs);
  
        // If following system, ignore stored `dark` and use OS
        if (fs) setDark(mql.matches);
        else if (typeof p.dark === 'boolean') setDark(p.dark);
        else setDark(mql.matches);
  
        if (typeof p.commentMode === 'boolean') setCommentMode(p.commentMode);
        if (typeof p.presentMode === 'boolean') setPresentMode(p.presentMode);
        if (typeof p.leftOpen === 'boolean') setLeftOpen(p.leftOpen);
        if (typeof p.currentUser === 'string') setCurrentUser(p.currentUser);
        if (p.kpiConfig) setKpiConfig(p.kpiConfig);
      } else {
        // First visit: follow system
        setFollowSystem(true);
        setDark(mql.matches);
      }
  
      // Listen for OS theme changes
      if (mql.addEventListener) mql.addEventListener('change', applySystem);
      else mql.addListener(applySystem);
      return () => {
        if (mql.removeEventListener) mql.removeEventListener('change', applySystem);
        else mql.removeListener(applySystem);
      };
    } catch {}
  }, []);


  // Persist prefs
  useEffect(() => {
    const prefs = { dark, commentMode, presentMode, leftOpen, currentUser, kpiConfig, followSystem };
    localStorage.setItem('hsm:prefs', JSON.stringify(prefs));
  }, [dark, commentMode, presentMode, leftOpen, currentUser, kpiConfig, followSystem]);

  // Zoom with Ctrl/⌘ + wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => {
          const n = Math.min(2.5, Math.max(0.5, z * (e.deltaY > 0 ? 0.9 : 1.1)));
          return parseFloat(n.toFixed(2));
        });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Full-height grid on load/resize
  useEffect(() => {
    const update = () => {
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      setMinH(Math.max(0, window.innerHeight - top));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  // Derived structures
  const stages = useMemo(() => getStages(data), [data]);
  const kpiKeys = useMemo(() => collectKpiKeys(data?.moments || []), [data]);
  const inferredDomains = useMemo(() => inferKpiDomains(data?.moments || []), [data]);
  useEffect(() => { if (heatmapOn && kpiKeys.length && !kpiKey) setKpiKey(kpiKeys[0]); }, [heatmapOn, kpiKeys, kpiKey]);

  const filteredMoments = useMemo(() => {
    const arr = filterMoments(data?.moments || [], { q: query, layerVisible, dpFilter });
    return arr.slice().sort((a, b) => sortMoments(a, b, stages));
  }, [data, query, layerVisible, dpFilter, stages]);

  const selectedMoment = useMemo(
    () => (data?.moments || []).find((m) => m.id === selected) || null,
    [selected, data]
  );

  const commentsMap = useMemo(() => getCommentsMap(data), [data]);
  
  const stageLabels = useMemo(
    () => Object.fromEntries((stages || []).map(s => [s.key, s.label])),
    [stages]
  );


  // Comments
  const onAddComment = (momentId, text) => {
    const comment = { id: `${momentId}-${Date.now()}`, author: currentUser || 'Consultant', text, ts: new Date().toISOString() };
    setData((prev) => addComment(prev, momentId, comment));
  };
  const onDeleteComment = (momentId, commentId) => {
    setData((prev) => deleteComment(prev, momentId, commentId));
  };

  // Column drag in Journey view
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.active) return;
      const dx = e.clientX - dragging.startX;
      const colWidth = 1600 / 12;
      const deltaCols = Math.round(dx / colWidth);
      const nextCol = Math.min(12, Math.max(1, dragging.startCol + deltaCols));
      setData((prev) => {
        const next = { ...(prev || {}) };
        next.moments = (prev?.moments || []).map((m) => (m.id === dragging.id ? { ...m, column: nextCol } : m));
        return next;
      });
    };
    const onUp = () => setDragging({ active: false, id: null, startX: 0, startCol: 1 });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const handleDragStart = (e, moment) => setDragging({ active: true, id: moment.id, startX: e.clientX, startCol: moment.column || 1 });

  // Stage editor save
  const handleStagesSave = (updatedStages, deleted) => {
    setStageEditorOpen(false);
    setData((prev) => {
      const ds = { ...(prev || {}) };
      let moments = (prev?.moments || []).slice();
      deleted.forEach((d) => {
        moments = moments.map((m) => (m.stageKey === d.key || m.stage === d.key ? { ...m, stageKey: d.reassignTo } : m));
      });
      ds.moments = moments;
      ds.stages = updatedStages;
      return ds;
    });
  };

  // Add/Edit/Delete
  const existingIds = useMemo(() => (data?.moments || []).map((m) => m.id), [data]);
  const handleAdd = () => { setEditInitial(null); setEditOpen(true); };
  const handleEdit = (moment) => { setEditInitial(moment); setEditOpen(true); };
  const handleSave = (moment) => {
    setEditOpen(false);
    setData((prev) => {
      const moments = (prev?.moments || []).slice();
      const idx = moments.findIndex((m) => m.id === (editInitial?.id || moment.id));
      if (idx >= 0) moments[idx] = moment;
      else moments.push(moment);
      return { ...(prev || {}), moments };
    });
  };
  const handleAskDelete = (moment) => { setToDelete(moment); setConfirmOpen(true); };
  const handleConfirmDelete = () => {
    const id = toDelete?.id;
    setConfirmOpen(false);
    setToDelete(null);
    if (!id) return;
    setData((prev) => ({ ...(prev || {}), moments: (prev?.moments || []).filter((m) => m.id !== id) }));
    if (selected === id) { setPanelOpen(false); setSelected(null); }
  };

  // Ensure lens blocks
  const ensureLensBlocks = (m) => ({
    ...m,
    experience: { personas: [], jobsToBeDone: [], momentsOfTruth: [], artefacts: [], ...(m.experience || {}) },
    ai:         { signals: [], models: [], automations: [], risks: [], ...(m.ai || {}) },
    behaviour:  { barriers: [], nudges: [], frameworks: [], habit: '', ...(m.behaviour || {}) },
    governance: { checks: [], metrics: [], ...(m.governance || {}) },
  });

  return (
    <div className={dark ? 'dark' : ''}>
      {/* Deep grey page bg in dark mode */}
      <div className="bg-white text-black dark:bg-[#121417] dark:text-neutral-100 transition-colors">
        {/* Brand header */}
        {presentMode && (
          <div className="print:hidden">
            <BrandBar />
          </div>
        )}

        {/* Header with flush, higher chevrons */}
        <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur bg-white/70 dark:bg-[#121417]/70">
          {/* Absolute chevrons in a padding-free relative wrapper */}
          <div className="relative">
            {/* Left open (only when drawer closed) — higher and flush to edge */}
            {!leftOpen && (
              <button
                onClick={() => setLeftOpen(true)}
                className="absolute left-0 top-3 h-7 w-7 flex items-center justify-center rounded-md bg-white/90 text-neutral-900 dark:bg-neutral-900/90 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition focus:outline-none z-40"
                title="Open left panel"
                aria-label="Open left panel"
              >
                {'>'}
              </button>
            )}
            {/* Right open (only when settings closed) — higher and flush to edge */}
            {!settingsOpen && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="absolute right-0 top-3 h-7 w-7 flex items-center justify-center rounded-md bg-white/90 text-neutral-900 dark:bg-neutral-900/90 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition focus:outline-none z-40"
                title="Open settings"
                aria-label="Open settings"
              >
                {'<'}
              </button>
            )}

            {/* Inner padded container */}
            <div className="max-w-7xl mx-auto px-4 py-3">
              {/* Title row */}
              <div className="flex items-center gap-3">
               <h1 className="text-lg md:text-xl tracking-widest uppercase whitespace-nowrap">
                 <span className="font-extrabold">Contour</span>
                 <span className="font-extralight"> / Integrated System Map</span>
               </h1>

              </div>

              {/* Controls row — nav on left, theme toggle on far right */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {/* Left-side nav group */}
                <div className="flex items-center gap-1 border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('journey')}
                    className={`px-2 py-1.5 text-sm ${viewMode === 'journey' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''}`}
                    title="Journey view"
                  >
                    Journey
                  </button>
                  <button
                    onClick={() => setViewMode('lens')}
                    className={`px-2 py-1.5 text-sm ${viewMode === 'lens' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''}`}
                    title="Lenses view"
                  >
                    Perspectives
                  </button>
                </div>

                {/* Dataset selector */}
                <select
                  value={data?.__name || 'marine'}
                  onChange={async (e) => {
                    const v = e.target.value;
                    if (v === 'marine')      { const mod = await import('@/data/marine.json'); setData({ ...mod.default, __name: 'marine' }); }
                    else if (v === 'sample') { const mod = await import('@/data/sample.json'); setData({ ...mod.default, __name: 'sample' }); }
                    else if (v === 'theory') { const mod = await import('@/data/theory.json'); setData({ ...mod.default, __name: 'theory' }); }
                    else if (v === 'b2b') { const mod = await import('@/data/sample-b2b.json'); setData({ ...mod.default, __name: 'b2b' }); }
                    else if (v === 'b2c') { const mod = await import('@/data/sample-b2c.json'); setData({ ...mod.default, __name: 'b2c' }); }
                    else if (v === 'upload') { fileInputRef.current?.click(); }
                  }}
                  className="px-2 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                  title="Switch dataset"
                >
                  <option value="marine">Marine</option>
                  <option value="b2b">Sample — B2B (SaaS)</option>
                  <option value="b2c">Sample — B2C (Fitness)</option>
                  <option value="theory">Theory</option>
                  <option value="upload">Upload…</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search moments, signals, nudges…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-3 pr-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>

                {/* Import/Export */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => {
                      try {
                        const obj = JSON.parse(r.result);
                        if (!obj || !Array.isArray(obj.moments)) throw new Error('Invalid JSON: expected { moments: [] }');
                        const normalized = { ...obj, moments: (obj.moments || []).map(ensureLensBlocks) };
                        setData({ ...normalized, __name: 'upload' });
                      } catch (err) {
                        alert('Import failed: ' + err.message);
                      }
                    };
                    r.readAsText(f);
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Import
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dataset.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Export
                </button>

                {/* Zoom */}
                <div className="hidden md:flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))))}
                    className="px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    title="Zoom out"
                  >
                    −
                  </button>
                  <div className="px-2 text-xs tabular-nums min-w-[3.5rem] text-center">
                    {(zoom * 100).toFixed(0)}%
                  </div>
                  <button
                    onClick={() => setZoom((z) => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))))}
                    className="px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800"
                    title="Reset view"
                  >
                    <RefreshCcw className="h-4 w-4 inline-block align-[-2px]" />
                  </button>
                </div>

                {/* Right-side theme toggle (separate from nav, aligned to far right) */}
                <div className="ml-auto">
                  <button
                    onClick={() => { setDark((d) => !d); setFollowSystem(false); }}
                    className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    title="Toggle theme"
                    aria-label="Toggle theme"
                  >
                    {dark ? 'Light mode' : 'Dark mode'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Perspectives pill bar (sticky under the main header) */}
        <div className="sticky top-[89px] md:top-[81px] z-20 bg-white/70 dark:bg-[#121417]/70 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
            <span className="uppercase tracking-widest text-xs text-neutral-500">Perspectives</span>
            {lanes.map((ln) => {
              const disabled = viewMode === 'journey';
              return (
                <button
                  key={ln.key}
                  onClick={() => !disabled && setVisibleLanes(v => ({ ...v, [ln.key]: !v[ln.key] }))}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition
                    ${visibleLanes[ln.key]
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                      : 'bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
                  title={disabled ? 'Perspectives are controlled in Lenses view' : `Toggle ${ln.label}`}
                >
                  {ln.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* LEFT DRAWER BACKDROP */}
        {leftOpen && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setLeftOpen(false)} aria-hidden />
        )}

        {/* Left Intro / Filters Panel */}
        <aside
          className={`fixed inset-y-0 left-0 w-[320px] bg-white dark:bg-[#121417] border-r border-neutral-200 dark:border-neutral-800 z-50 p-4 overflow-y-auto transform transition-transform duration-300 ${
            leftOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest">Overview & Filters</h2>
            <button
              onClick={() => setLeftOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded-md bg-white/90 text-neutral-900 dark:bg-neutral-900/90 dark:text-neutral-100 shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition focus:outline-none"
              title="Close left panel"
              aria-label="Close left panel"
            >
              {'<'}
            </button>
          </div>

          {/* Intro */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2">What you’re seeing</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              A value-led service map viewed through four <b>Perspectives</b> —
              <b> Value &amp; Experience</b>, <b>AI &amp; Data</b>, <b>Behavioural Adoption</b>, and <b>Governance &amp; Risk</b>.
              Use the left drawer to filter by <b>Capability Layers</b>, and use the
              <b> Perspectives</b> bar to show/hide sections when you switch to Perspectives view.
              Import your blueprint/personas via the header controls, then explore.
            </p>
          </div>

          {/* Layers */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Capability Layers</div>
            <div className="grid grid-cols-2 gap-2">
              {LAYER_KEYS.map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm" title="Filter moments by this capability">
                  <input
                    type="checkbox"
                    className="accent-neutral-400 dark:accent-neutral-600"
                    checked={layerVisible[l]}
                    onChange={() => setLayerVisible((v) => ({ ...v, [l]: !v[l] }))}
                    aria-label={`Filter by ${l}`}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Design Pattern Level */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Design Pattern Level</div>
            <div className="flex flex-wrap gap-2">
              {['all', 'tactical', 'integrated'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDpFilter(opt)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    dpFilter === opt
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      : 'border border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Switch between tactical, specific pain DPs and second-level, integrated DPs.
            </p>
          </div>

          {/* Tips */}
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Tips</div>
            <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
              <li>Use <b>Journey View</b> for client storytelling; <b>Lens View</b> for internal completeness checks.</li>
              <li>Search filters across moments, signals, nudges, and more.</li>
              <li>Export/Import JSON to swap datasets (e.g., Marine vs. Theory).</li>
            </ul>
          </div>
        </aside>

        {/* Canvas */}
        <div
          ref={containerRef}
          className={`relative border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto ${
            showGrid
              ? 'bg-[linear-gradient(to_right,rgba(127,127,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(127,127,127,0.08)_1px,transparent_1px)] bg-[size:80px_1px,1px_80px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]'
              : ''
          }`}
          style={{ minHeight: minH ? `${minH}px` : undefined }}
        >
          <div style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
            <div className="relative w-[1600px] mx-20 mt-2 mb-0 pb-6">
              {viewMode === 'journey' ? (
                <JourneyTrack
                  moments={filteredMoments}
                  stages={stages}
                  stageLabels={stageLabels}    
                  onOpen={(id) => { setSelected(id); setPanelOpen(true); }}
                  enableDrag={false}
                  onDragStart={handleDragStart}
                  kpiKey={kpiKey}
                  heatmapOn={heatmapOn}
                  kpiConfig={kpiConfig}
                  showRail={false}
                />
              ) : (
                <LensGrid
                  lanes={lanes}
                  visibleLanes={visibleLanes}
                  moments={filteredMoments}
                  stages={stages}     
                  onOpen={(id) => { setSelected(id); setPanelOpen(true); }}
                  kpiKey={kpiKey}
                  heatmapOn={heatmapOn}
                  kpiConfig={kpiConfig}
                />
              )}
            </div>
          </div>
        </div>

        {/* Persona drawer */}
        <PersonaDirectory
          open={personasOpen}
          onClose={() => setPersonasOpen(false)}
          personasIndex={data?.personas || {}}
          moments={data?.moments || []}
          onOpenMoment={(id) => { setSelected(id); setPanelOpen(true); setPersonasOpen(false); }}
        />

        {/* Side Panel */}
        {panelOpen && selectedMoment && (
          <SidePanel
            onClose={() => setPanelOpen(false)}
            moment={selectedMoment}
            personasIndex={data?.personas || {}}
            onEdit={handleEdit}
            onDelete={handleAskDelete}
            commentsMap={commentsMap}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            currentUser={currentUser}
            presentMode={presentMode}
            stages={stages} 
            viewMode={viewMode}            
            visibleLanes={visibleLanes}   
          />
        )}

        {/* Modals */}
        <EditMomentModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          stages={stages}
          stageLabels={stageLabels}   
          initial={editInitial}
          existingIds={existingIds}
          onSave={handleSave}
        />
        <ConfirmDialog
          open={confirmOpen}
          onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
          onConfirm={handleConfirmDelete}
          title="Delete moment"
          body={toDelete ? `Delete “${toDelete.title}” (ID: ${toDelete.id})? This cannot be undone.` : 'Delete this moment?'}
        />
        <StageEditor
          open={stageEditorOpen}
          onClose={() => setStageEditorOpen(false)}
          stages={stages}
          onSave={handleStagesSave}
        />
        <KpiConfig
          open={kpiConfigOpen}
          onClose={() => setKpiConfigOpen(false)}
          kpiKeys={kpiKeys}
          inferred={inferredDomains}
          value={kpiConfig}
          onSave={(cfg) => { setKpiConfig(cfg); setKpiConfigOpen(false); }}
        />

        {/* Settings panel */}
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          commentMode={commentMode}
          setCommentMode={setCommentMode}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          heatmapOn={heatmapOn}
          setHeatmapOn={setHeatmapOn}
          kpiKey={kpiKey}
          setKpiKey={setKpiKey}
          kpiKeys={kpiKeys}
          onOpenKpiConfig={() => setKpiConfigOpen(true)}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
        />
      </div>
    </div>
  );
}
