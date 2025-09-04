import { useEffect, useState } from 'react';

/**
 * CoverPage
 * - Print-only cover with logo, title, client, date
 * - Visible only in print (or if force prop passed)
 */
export default function CoverPage({ force=false }){
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
    <div className={`${force ? '' : 'hidden print:block'} min-h-screen flex flex-col items-center justify-center text-center p-12`}>
      <img src="/logo.svg" alt="Logo" className="h-16 w-auto mb-6" />
      <h1 className="text-3xl font-bold">{brand?.brandName || 'Brand'}</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-1">{brand?.subtitle || 'Hybrid AI Service Design Map'}</p>
      <div className="mt-8 text-xl">{brand?.clientName || 'Client Name'}</div>
      <div className="text-sm text-neutral-500 mt-1">{today}</div>
      {brand?.showConfidential && (
        <div className="mt-6 text-[10px] uppercase tracking-widest text-rose-600">Confidential</div>
      )}
    </div>
  );
}
