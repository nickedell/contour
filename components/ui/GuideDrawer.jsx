// components/ui/GuideDrawer.jsx
import * as React from 'react';

export default function GuideDrawer({ open, onClose, title = 'Guide', children }) {
  if (!open) return null;
  return (
	<>
	  {/* Backdrop */}
	  <div
		className="fixed inset-0 z-40 bg-black/40"
		onClick={onClose}
		aria-hidden
	  />
	  {/* Panel */}
	  <aside
		className="fixed right-0 top-0 bottom-0 w-[360px] z-50 bg-[#121417] text-neutral-200
				   border-l border-neutral-800 p-4 overflow-y-auto"
		role="dialog"
		aria-modal="true"
	  >
		<div className="flex items-center justify-between">
		  <div className="text-xs uppercase tracking-widest text-neutral-400">{title}</div>
		  <button
			onClick={onClose}
			className="px-2 py-1 rounded-md hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
			aria-label="Close guide"
			title="Close"
		  >
			› Close
		  </button>
		</div>
		<div className="mt-3 text-sm leading-relaxed text-neutral-300 space-y-3">
		  {children}
		</div>
	  </aside>
	</>
  );
}