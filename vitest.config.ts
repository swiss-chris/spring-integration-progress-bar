import { configDefaults, defineConfig } from 'vitest/config'
import * as path from 'path';

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, 'packages/template/*'],
        root: './src/test/typescript',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/main/typescript')
        }
    }
})
