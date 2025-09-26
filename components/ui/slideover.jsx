// components/ui/SlideOver.jsx
import * as React from 'react';

export default function SlideOver({ open, onClose, title = 'Settings', children }) {
  const panelRef = React.useRef(null);
  const prevFocusRef = React.useRef(null);

  // ESC to close + lock body scroll + restore focus on close
  React.useEffect(() => {
	if (!open) return;

	// remember previously focused element
	prevFocusRef.current = document.activeElement;

	// lock scroll
	const prevOverflow = document.documentElement.style.overflow;
	const prevPadRight = document.documentElement.style.paddingRight;
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	document.documentElement.style.overflow = 'hidden';
	if (scrollbarWidth > 0) {
	  document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
	}

	const onKey = (e) => {
	  if (e.key === 'Escape') onClose?.();
	};
	window.addEventListener('keydown', onKey);

	// focus first focusable in panel (or panel itself)
	const focusFirst = () => {
	  const root = panelRef.current;
	  if (!root) return;
	  const focusables = root.querySelectorAll(
		'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
	  );
	  if (focusables.length) {
		(focusables[0] instanceof HTMLElement) && focusables[0].focus();
	  } else {
		root.focus();
	  }
	};
	// slight defer to allow render
	const tid = setTimeout(focusFirst, 0);

	return () => {
	  window.removeEventListener('keydown', onKey);
	  clearTimeout(tid);

	  // restore scroll + padding
	  document.documentElement.style.overflow = prevOverflow;
	  document.documentElement.style.paddingRight = prevPadRight;

	  // restore previous focus
	  if (prevFocusRef.current && prevFocusRef.current instanceof HTMLElement) {
		prevFocusRef.current.focus();
	  }
	};
  }, [open, onClose]);

  // Focus trap (Tab / Shift+Tab within panel)
  const onKeyDownTrap = React.useCallback((e) => {
	if (e.key !== 'Tab') return;
	const root = panelRef.current;
	if (!root) return;

	const focusables = Array.from(
	  root.querySelectorAll(
		'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
	  )
	).filter(el => el instanceof HTMLElement && !el.hasAttribute('inert'));

	if (focusables.length === 0) {
	  e.preventDefault();
	  root.focus();
	  return;
	}

	const first = focusables[0];
	const last = focusables[focusables.length - 1];
	const current = document.activeElement;

	if (!e.shiftKey && current === last) {
	  e.preventDefault();
	  first.focus();
	} else if (e.shiftKey && current === first) {
	  e.preventDefault();
	  last.focus();
	}
  }, []);

  if (!open) return null;

  return (
	<>
	  {/* Overlay */}
	  <div
		className="fixed inset-0 z-50 bg-black/50"
		onClick={onClose}
		aria-hidden="true"
	  />

	  {/* Panel */}
	  <aside
		ref={panelRef}
		className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl outline-none"
		role="dialog"
		aria-modal="true"
		aria-label={typeof title === 'string' ? title : 'Panel'}
		tabIndex={-1}
		onKeyDown={onKeyDownTrap}
	  >
		{/* Header */}
		<div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
		  <div className="text-xs uppercase tracking-widest text-neutral-500">
			{title}
		  </div>
		  <button
			onClick={onClose}
			className="h-7 w-7 flex items-center justify-center rounded-md
					   bg-white/90 text-neutral-900 dark:bg-neutral-900/90 dark:text-neutral-100
					   shadow-sm hover:bg-white dark:hover:bg-neutral-900 transition focus:outline-none"
			title="Close panel"
			aria-label="Close panel"
		  >
			{'>'}
		  </button>
		</div>

		{/* Body */}
		<div className="p-4 space-y-4 text-sm">
		  {children}
		</div>
	  </aside>
	</>
  );
}