// pages/index.js
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

const HybridFrameworkPro = dynamic(
  () =>
	import('@/components/HybridFrameworkPro')
	  .then(m => {
		console.log('[dyn] HybridFrameworkPro loaded:', !!m?.default);
		return m;
	  })
	  .catch(err => {
		console.error('[dyn] import failed:', err);
		// Render a visible fallback so the page isn’t blank
		return { default: () => (
		  <div style={{ padding: 24, fontFamily: 'system-ui' }}>
			<h1>Import failed</h1>
			<pre>{String(err?.stack || err)}</pre>
		  </div>
		) };
	  }),
  { ssr: false, loading: () => <div style={{ padding: 24 }}>Loading…</div> }
);

export default function Home() {
  return (
	<ErrorBoundary>
	  <HybridFrameworkPro />
	</ErrorBoundary>
  );
}
