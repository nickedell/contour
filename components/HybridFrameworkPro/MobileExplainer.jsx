/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved. Proprietary and confidential.
 */
export default function MobileExplainer() {
  return (
	<div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white text-black dark:bg-[#121417] dark:text-neutral-100">
	  <img
		src="/assets/img/logo.svg"
		alt="Contour logo"
		width={90}
		height={90}
		className="h-[90px] w-[90px] rounded-2xl p-3 bg-neutral-900 dark:bg-transparent"
	  />
	  <h1 className="mt-4 text-2xl font-extrabold tracking-widest uppercase">
		Contour<span className="font-light"> — Integrated System Map</span>
	  </h1>
	  <p className="mt-4 max-w-md text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
		Contour is designed for large screens so you can see stages, moments, and perspectives
		together. Please use a laptop or desktop for the best experience.
	  </p>
	  <p className="mt-2 max-w-md text-xs text-neutral-500">
		Tip: if you’re on a tablet, rotate to landscape and widen the window.
	  </p>
	</div>
  );
}
