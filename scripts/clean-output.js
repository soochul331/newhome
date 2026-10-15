import fs from 'node:fs';
// Remove only this project's generated output, never source or archived designs.
fs.rmSync(new URL('../_site/', import.meta.url), { recursive: true, force: true });
