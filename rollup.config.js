import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
const { version, srcPath } = require('./scripts/utils.cjs');
const { javascript: terserOptions } = require('./scripts/terser.config.cjs');

const dev = process.env.NODE_ENV !== 'production';

const ccl = '../lib/CommentCoreLibrary.js';

export default [
    {
        input: 'src/core/index.ts',
        external: [ccl, 'assjs'],
        output: [
            {
                file: dev ? 'public/player.js' : 'build/assets/player.min.js',
                format: 'iife',
                name: 'player',
                sourcemap: dev,
                globals: {
                    ['assjs']: 'ASS',
                    [srcPath('core', ccl)]: 'window',
                },
            },
        ],
        context: 'window',
        plugins: [
            typescript(),
            replace({
                include: 'src/core/index.ts',
                // (!) [plugin replace] @rollup/plugin-replace: 'preventAssignment' currently defaults to false. It is recommended to set this option to `true`, as the next major version will default this option to `true`.
                preventAssignment: true,
                values: { _version_: version() },
            }),
            ...[dev ? [] : [terser(terserOptions)]],
        ],
    },
];
