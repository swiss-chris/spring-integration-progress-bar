import { configDefaults, defineConfig } from 'vitest/config'
import * as path from 'path';

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, 'packages/template/*']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../main/typescript')
        }
    }
})
