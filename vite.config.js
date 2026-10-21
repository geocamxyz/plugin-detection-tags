import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/ — matches the other geocamxyz plugin builds.
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'detectionTags',
            fileName: 'detection-tags',
          },
   }
})
