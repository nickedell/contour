export function filterMoments(moments, { q, layerVisible, dpFilter }) {
  let arr = (moments || []).slice();
  if (dpFilter && dpFilter !== 'all') arr = arr.filter(m => (m.dpLevel || 'tactical') === dpFilter);
  if (layerVisible) {
    arr = arr.filter(m => {
      const ls = Array.isArray(m.layers) ? m.layers : Object.keys(layerVisible);
      return ls.some(l => layerVisible[l]);
    });
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    arr = arr.filter(m => JSON.stringify(m).toLowerCase().includes(needle));
  }
  return arr;
}
