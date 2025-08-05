const fs = require('fs');
const rollup = require('rollup');
const { default: typescript } = require('@rollup/plugin-typescript');
const { default: replace } = require('@rollup/plugin-replace');
const { default: terser } = require('@rollup/plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { default: legacy } = require('@rollup/plugin-legacy');
const license = require('rollup-plugin-license');
const { srcPath, version } = require('./utils.cjs');

const VER = version();
const REV = VER.commit.slice(0, 8);

const SRC = 'src/core/index.ts';
const cclFile = srcPath('core', '../lib/CommentCoreLibrary.js');

const outputFiles = [
    `build/assets/player.${REV}.min.js`, //     (prod, prj) false false
    `build/assets/player.${REV}.all.min.js`, // (prod, all) false true
    'public/player.js', //                      (dev,  prj) true  false
    'public/player.all.js', //                  (dev,  prj) true  true
];

/** @type {import('@rollup/plugin-terser').Options}*/
const terserOptions = {
    compress: { pure_funcs: ['console.debug'] },
    format: { comments: false },
};

const replacePlugin = (ver) => {
    return replace({
        include: 'src/core/index.ts',
        // (!) [plugin replace] @rollup/plugin-replace: 'preventAssignment' currently defaults to false. It is recommended to set this option to `true`, as the next major version will default this option to `true`.
        preventAssignment: true,
        values: {
            // _version_: `JSON.parse('${JSON.stringify(ver)}');`,
            _version_: JSON.stringify(ver) + ';',
        },
    });
};

const licensePlugin = (verText, withDependencies = false) => {
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
Version: v<%= pkg.version %> - ${verText}
Copyright (C) 2022-<%= moment().format('YYYY') %> AUIOC.ORG
Copyright (C) 2018-2022 PCC-Studio
Licensed under GNU Affero General Public License v3.0 (https://github.com/auioc/BilibiliLocalPlayerH5/blob/main/LICENSE)
${withDependencies ? dependencies : ''}
`.trim(),
        },
    });
};

/*
Plugins order:
legacy       (for all bundle)
nodeResolve  (for all bundle)
typescript
replace
terser       (for prod build)
license
*/

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

    const ver = Object.assign({}, VER);
    ver.bundle = all ? 'all' : 'default';

    /** @type {import('rollup').InputOptions} */
    const input = { input: SRC, context: 'window' };

    /** @type {import('rollup').OutputOptions} */
    const output = { format: 'iife', name: 'player' };

    output.file = outputFiles[(dev ? 2 : 0) + (all ? 1 : 0)];

    output.sourcemap = dev;

    const plugins = [];

    if (all) {
        plugins.push(
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

    plugins.push(
        typescript({ sourceMap: dev }), //
        replacePlugin(ver) // TODO
    );

    if (!dev) {
        plugins.push(terser(terserOptions));
    }

    plugins.push(licensePlugin(ver.text, all));

    input.plugins = plugins;

    return { input, output };
};

/**
 * @param {boolean} dev
 * @param {boolean} all
 */
async function generate(dev, all) {
    const {
        input: inputOptions, //
        output: outputOptions,
    } = buildOptions(dev, all);

    let bundle;
    let output;
    let error;
    try {
        bundle = await rollup.rollup(inputOptions);
        output = (await bundle.generate(outputOptions)).output;
    } catch (e) {
        error = e;
    }
    if (bundle) {
        await bundle.close();
    }
    if (error) {
        throw error;
    }
    return output;
}

module.exports = {
    buildOptions,
    generate,
};
