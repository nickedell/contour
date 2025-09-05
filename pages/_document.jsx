// pages/_document.jsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

// 1) Early bootstrap: theme + left drawer state (runs before first paint)
const THEME_BOOTSTRAP = `
(function () {
  try {
	var raw = localStorage.getItem('hsm:prefs');
	var prefs = raw ? JSON.parse(raw) : {};
	var mql = window.matchMedia('(prefers-color-scheme: dark)');
	var followSystem = (typeof prefs.followSystem === 'boolean') ? prefs.followSystem : true;
	var dark = followSystem ? mql.matches : !!prefs.dark;

	if (dark) document.documentElement.classList.add('dark');
	else document.documentElement.classList.remove('dark');

	// Left panel defaults to OPEN on first visit
	var leftOpen = (typeof prefs.leftOpen === 'boolean') ? !!prefs.leftOpen : true;
	document.documentElement.setAttribute('data-left', leftOpen ? 'open' : 'closed');
  } catch (e) {
	// Safe defaults if localStorage fails
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	  document.documentElement.classList.add('dark');
	}
	document.documentElement.setAttribute('data-left', 'open');
  }
})();`;

// 2) CSS so the left drawer respects <html data-left="..."> before React hydrates
const LEFT_BOOTSTRAP_CSS = `
:root[data-left="open"]  .left-drawer { transform: translateX(0); }
:root[data-left="closed"] .left-drawer { transform: translateX(-100%); }
`;

export default class MyDocument extends Document {
  render() {
	return (
	  <Html lang="en">
		<Head>
		  <meta name="color-scheme" content="light dark" />

		  {/* Run early: sets .dark and data-left before first paint */}
		  <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />

		  {/* Make the aside obey data-left before React mounts */}
		  <style id="left-bootstrap" dangerouslySetInnerHTML={{ __html: LEFT_BOOTSTRAP_CSS }} />

		  {/* (Optional) metadata/IP breadcrumbs (non-UI) */}
		  <meta name="author" content="ResonantAI Ltd" />
		  <meta name="publisher" content="ResonantAI Ltd" />
		  <meta name="copyright" content="© 2025 ResonantAI Ltd. All rights reserved." />
		  <link rel="license" href="/LICENSE.txt" />
		</Head>
		<body>
		  <Main />
		  <NextScript />
		</body>
	  </Html>
	);
  }
}
