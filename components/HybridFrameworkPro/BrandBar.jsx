import { useEffect, useState } from 'react';

/**
 * BrandBar
 * - Reads /data/branding.json and shows logo + titles
 * - Used at top in Present mode
 */
export default function BrandBar(){
  const [brand, setBrand] = useState(null);

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await fetch('/data/branding.json');
        const j = await res.json();
        setBrand(j);
      } catch {}
    };
    load();
  }, []);

  const today = new Date().toLocaleDateString();

  return (
    <div className="print:mb-2">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
        <div className="flex-1">
          <div className="text-sm font-semibold">{brand?.brandName || 'Brand'}</div>
          <div className="text-xs text-neutral-500">{brand?.subtitle || 'Service Map'}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">{brand?.clientName || 'Client'}</div>
          <div className="text-[11px] text-neutral-500">{today}</div>
        </div>
      </div>
      {brand?.showConfidential && (
        <div className="text-center text-[10px] uppercase tracking-widest text-rose-600">Confidential</div>
      )}
    </div>
  );
}
