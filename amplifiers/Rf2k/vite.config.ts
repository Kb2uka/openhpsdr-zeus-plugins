import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build the Openhpsdr-Zeus RF2K-S amplifier plugin UI module.
//
// Output: `ui/rf2k.es.js` — an ESM bundle the host loads at runtime
// after plugin activation. React + react-dom are provided by the host
// shell (via the zeus-sdk shims at /zeus-sdk/react.js +
// /zeus-sdk/react-jsx-runtime.js landed in zeus PR #370). Mirrors the
// audio-plugin UI build harness (audio/Eq/vite.config.ts).
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'ui',
        emptyOutDir: false,
        lib: {
            entry: 'ui/rf2k.tsx',
            formats: ['es'],
            fileName: () => 'rf2k.es.js',
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
        },
        target: 'esnext',
        minify: false,
    },
});
