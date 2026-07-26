import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Ensures dist/index.js imports dist/index.css for consumers. */
function injectCssImport() {
  return {
    name: 'inject-css-import',
    closeBundle() {
      const jsPath = resolve(__dirname, 'dist/index.js')
      const cssPath = resolve(__dirname, 'dist/index.css')
      if (!existsSync(jsPath) || !existsSync(cssPath)) return

      const source = readFileSync(jsPath, 'utf8')
      if (
        source.includes("import './index.css'") ||
        source.includes('import "./index.css"')
      ) {
        return
      }

      writeFileSync(jsPath, `import './index.css';\n${source}`)
    },
  }
}

/**
 * - `vite` / `vite --mode demo`: playground app
 * - `vite build`: library build → dist/index.js + dist/index.css
 * - `vite build --mode demo`: playground build → dist-demo
 */
export default defineConfig(({ command, mode }) => {
  const isDemoBuild = mode === 'demo'
  const isLibBuild = command === 'build' && !isDemoBuild

  if (isLibBuild) {
    return {
      plugins: [react(), tailwindcss(), injectCssImport()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'OmidReactEditor',
          formats: ['es'],
          fileName: () => 'index.js',
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            'react-dom/client',
          ],
          output: {
            assetFileNames: (assetInfo) => {
              if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                return 'index.css'
              }
              return assetInfo.name ?? 'asset-[name][extname]'
            },
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
        cssCodeSplit: false,
        emptyOutDir: true,
        copyPublicDir: false,
        sourcemap: true,
      },
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist-demo',
      emptyOutDir: true,
    },
  }
})
