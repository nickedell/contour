/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential. See /COPYRIGHT.txt.
 */

// lib/stages.js
export function getStages(dataset) {
  const ds = dataset || {};
  let stages;

  if (Array.isArray(ds.stages) && ds.stages.length) {
    stages = ds.stages.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } else {
    const seen = new Map();
    (ds.moments || []).forEach((m, i) => {
      const key = m.stageKey || m.stage || 'Uncategorized';
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          label: m.stage || key,
          order: i + 1,
          color: '#6B7280',
        });
      }
    });
    stages = Array.from(seen.values());
  }

  // Add stable letters without changing order
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return stages.map((s, i) => ({
    ...s,
    letter: s.letter || LETTERS[i % LETTERS.length],
  }));
}

export function stageOf(moment, stages) {
  const key = moment.stageKey || moment.stage;
  return stages.find((s) => s.key === key || s.label === key) || stages[0];
}
