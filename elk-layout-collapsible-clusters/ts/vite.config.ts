import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        // `@joint/layout-elk` runs ELK in a Web Worker it locates relative to its own
        // files - pre-bundling the package would move it away from the worker file.
        exclude: ['@joint/layout-elk'],
        // The (CommonJS) ELK files the package imports still need to be pre-bundled.
        include: [
            '@joint/layout-elk > elkjs/lib/elk-api.js',
            '@joint/layout-elk > elkjs/lib/elk.bundled.js'
        ]
    }
});
