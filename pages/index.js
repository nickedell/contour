// pages/index.js
import Head from 'next/head'
import dynamic from 'next/dynamic'

const HybridFrameworkPro = dynamic(
  () => import('@/components/HybridFrameworkPro').then(m => m.default || m),
  { ssr: false }
)

export default function Home() {
  return (
	<>
	  <Head>
		<title>Contour — Integrated System Map</title>
	  </Head>
	  <div className="w-full">
		{/* NEW: suppressHeader to hide the internal page header/tool-title */}
		<HybridFrameworkPro suppressHeader />
	  </div>
	</>
  )
}