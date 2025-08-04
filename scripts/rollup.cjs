const fs = require('fs');
// const rollup = require('rollup');
const { default: typescript } = require('@rollup/plugin-typescript');
const { default: replace } = require('@rollup/plugin-replace');
const { default: terser } = require('@rollup/plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { default: legacy } = require('@rollup/plugin-legacy');
const license = require('rollup-plugin-license');
const { srcPath, version } = require('./utils.cjs');

const ver = version();
const rev = ver.commit.slice(0, 8);

const SRC = 'src/core/index.ts';
const cclFile = srcPath('core', '../lib/CommentCoreLibrary.js');

/** @type {import('rollup').InputOptions} */
const input = { input: SRC, context: 'window' };

/** @type {import('rollup').OutputOptions} */
const output = {
    format: 'iife',
    name: 'player',
};

// const combined = (b1 ? 2 : 0) + (b2 ? 1 : 0)

const outputFiles = [
    `build/assets/player.${rev}.min.js`, //     (prod, prj) false false
    `build/assets/player.${rev}.all.min.js`, // (prod, all) false true
    'public/player.js', //                      (dev,  prj) true  false
    'public/player.all.js', //                  (dev,  prj) true  true
];

/** @type {import('@rollup/plugin-terser').Options}*/
const terserOptions = {
    compress: { pure_funcs: ['console.debug'] },
    format: { comments: false },
};

const plugins = [
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
];

const licensePlugin = (withDependencies = false) => {
    const dependencies = `
Dependencies:
assjs v0.0.11 - MIT - Copyright (c) 2014 weizhenye
CommentCoreLibrary v0.11.1 - MIT Copyright (c) 2014 Jim Chen
`;
    // @ts-ignore
    return license({
        banner: {
            commentStyle: 'ignored',
            content: `
Bundle of BilibiliLocalPlayerH5${withDependencies ? ' (with dependencies)' : ''}
https://github.com/auioc/BilibiliLocalPlayerH5
Generated at <%= moment().format() %>
Version: v<%= pkg.version %> - ${ver.text}
Copyright (C) 2022-<%= moment().format('YYYY') %> AUIOC.ORG
Copyright (C) 2018-2022 PCC-Studio
Licensed under GNU Affero General Public License v3.0 (https://github.com/auioc/BilibiliLocalPlayerH5/blob/main/LICENSE)
${withDependencies ? dependencies : ''}
`.trim(),
        },
    });
};

/**
 *
 * @param {boolean} dev
 * @param {boolean} all
 */
const buildOptions = (dev, all) => {
    if (!fs.existsSync(cclFile)) {
        throw new Error(
            "Dependency 'CommentCoreLibrary' not found, see README.md for more information"
        );
    }

    output.file = outputFiles[(dev ? 2 : 0) + (all ? 1 : 0)];

    output.sourcemap = dev;

    if (!dev) {
        plugins.push(terser(terserOptions));
    }

    if (all) {
        output.sourcemap = false;
        plugins.unshift(
            legacy({
                'src/lib/CommentCoreLibrary.js': {
                    CommentProvider: 'CommentProvider',
                    CommentManager: 'CommentManager',
                    BilibiliFormat: 'BilibiliFormat',
                },
            }),
            nodeResolve()
        );
    } else {
        input.external = ['../lib/CommentCoreLibrary.js', 'assjs'];
        output.globals = {
            ['assjs']: 'ASS',
            [cclFile]: 'window',
        };
    }

    plugins.push(licensePlugin(all));
    input.plugins = plugins;

    return { input, output };
};

module.exports = {
    buildOptions,
};
