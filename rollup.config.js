import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
const license = require('rollup-plugin-license');
const { version, srcPath } = require('./scripts/utils.cjs');
const { javascript: terserOptions } = require('./scripts/terser.config.cjs');

const dev = process.env.NODE_ENV !== 'production';
const ver = version();

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
                values: {
                    // _version_: `JSON.parse('${JSON.stringify(ver)}');`,
                    _version_: JSON.stringify(ver) + ';',
                },
            }),
            license({
                banner: {
                    commentStyle: 'ignored',
                    content: `
Bundle of BilibiliLocalPlayerH5 (https://github.com/auioc/BilibiliLocalPlayerH5)
Generated at <%= moment().format() %>
Version: v<%= pkg.version %> @ ${ver.text}
Copyright (C) 2022-<%= moment().format('YYYY') %> AUIOC.ORG
Copyright (C) 2018-2022 PCC-Studio
Licensed under GNU Affero General Public License v3.0 (https://github.com/auioc/BilibiliLocalPlayerH5/blob/main/LICENSE)
`.trim(),
                },
            }),
            ...[dev ? [] : [terser(terserOptions)]],
        ],
    },
];
