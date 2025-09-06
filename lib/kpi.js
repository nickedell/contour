/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential. See /COPYRIGHT.txt.
 */

export function collectKpiKeys(moments){
  const set = new Set();
  (moments||[]).forEach(m=>{
    const k = m.kpis || {};
    Object.keys(k).forEach(key=>set.add(key));
  });
  return Array.from(set.values()).sort();
}

export function inferKpiDomains(moments){
  // Build {key: {min, max}} from raw numeric values across all moments
  const dom = {};
  (moments||[]).forEach(m=>{
    const k = m.kpis || {};
    Object.entries(k).forEach(([key, v])=>{
      if (typeof v !== 'number') return;
      if (!dom[key]) dom[key] = { min: v, max: v };
      else {
        dom[key].min = Math.min(dom[key].min, v);
        dom[key].max = Math.max(dom[key].max, v);
      }
    });
  });
  return dom;
}

export function normalize(value, cfg){
  if (value == null || typeof value !== 'number') return null;
  if (!cfg) {
    // Default: assume 0..1 in data
    return clamp01(value);
  }
  const min = typeof cfg.min === 'number' ? cfg.min : 0;
  const max = typeof cfg.max === 'number' ? cfg.max : 1;
  const higherIsBetter = cfg.higherIsBetter !== false; // default true
  if (max === min) return 0.5; // avoid NaN
  const z = (value - min) / (max - min);
  const v = higherIsBetter ? z : (1 - z);
  return clamp01(v);
}

export function getKpiValue(moment, key){
  if(!key) return null;
  const val = moment?.kpis?.[key];
  return (typeof val === 'number') ? val : null;
}

export function getNormalizedKpiValue(moment, key, kpiConfig){
  const raw = getKpiValue(moment, key);
  const cfg = kpiConfig?.[key];
  return normalize(raw, cfg);
}

function clamp01(x){ return Math.max(0, Math.min(1, x)); }
