import dynamic from 'next/dynamic';
const HybridFrameworkPro = dynamic(() => import('@/components/HybridFrameworkPro'), { ssr: false });
export default function Home(){ return <main><HybridFrameworkPro /></main>; }
