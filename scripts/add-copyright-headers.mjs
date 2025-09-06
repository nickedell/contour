import fs from 'fs';

const header = `/**
 * Contour — Integrated System Map
 * © 2025 ResonantAI Ltd. All rights reserved.
 * Proprietary and confidential. See /COPYRIGHT.txt.
 */
`;

const files = [
  'components/HybridFrameworkPro/index.jsx',
  'components/HybridFrameworkPro/JourneyView/JourneyTrack.jsx',
  'components/HybridFrameworkPro/LensView/LensGrid.jsx',
  'components/HybridFrameworkPro/SidePanel/SidePanel.jsx',
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (src.startsWith('/**\n * Contour')) continue; // already has header
  fs.writeFileSync(f, header + '\n' + src, 'utf8');
  console.log('Prepended header:', f);
}
