import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build the Openhpsdr-Zeus Aural Exciter plugin UI module.
//
// Output: `ui/exciter.es.js` — an ESM bundle the host loads at runtime
// after plugin activation. React + react-dom are provided by the host
// shell.
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'ui',
        emptyOutDir: false,
        lib: {
            entry: 'ui/exciter.tsx',
            formats: ['es'],
            fileName: () => 'exciter.es.js',
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
        },
        target: 'esnext',
        minify: false,
    },
});
