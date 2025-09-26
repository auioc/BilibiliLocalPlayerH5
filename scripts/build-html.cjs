const {
    DEV,
    github,
    license,
    outputs,
    externalAssets,
    projectAssets,
} = require('./const.cjs');
const HTMLParser = require('node-html-parser');
const { minify } = require('html-minifier-terser');
const { writeFile, version, srcPath: src, readFile } = require('./utils.cjs');
const { generate: generateStyle } = require('./build-style.cjs');
const { generate: generateScript } = require('./rollup.cjs');

const INPUT = src('html/index.html');

/** @type {import('html-minifier-terser').Options} */
const TERSER_OPTIONS = {
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
};

class HTML {
    html;
    constructor() {
        this.html = HTMLParser.parse(
            readFile(INPUT), //
            {
                comment: true,
                voidTag: { closingSlash: true },
            }
        );
    }

    toString() {
        return this.html.toString();
    }

    setVersion(noDep, allInOne) {
        const v = version();
        this.html
            .getElementById('github')
            ?.setAttribute('href', github)
            .removeAttribute('id');
        this.html
            .getElementById('license')
            ?.setAttribute('href', github + '/blob/main/LICENSE')
            .set_content(license)
            .removeAttribute('id');
        this.html
            .getElementById('year')
            .set_content('' + new Date().getFullYear())
            .removeAttribute('id');
        this.html
            .getElementById('version')
            ?.set_content(v.text)
            .setAttribute('href', github + (v.dirty ? '' : `/tree/${v.commit}`))
            .removeAttribute('id');
        this.html
            .getElementById('build')
            ?.set_content(allInOne ? 'allinone' : noDep ? 'bundled' : 'default')
            .removeAttribute('id');
    }

    /** @param {string} href */
    addStyle(href) {
        this.html
            .getElementsByTagName('head')[0]
            .insertAdjacentHTML(
                'beforeend',
                `<link rel="stylesheet" href="${href}" />`
            );
    }

    /** @param {string} css */
    addStyleInline(css) {
        this.html
            .getElementsByTagName('head')[0]
            .insertAdjacentHTML('beforeend', `<style>${css}</style>`);
    }

    /** @param {string} src */
    addScript(src) {
        this.html
            .getElementsByTagName('body')[0]
            .insertAdjacentHTML('beforeend', `<script src="${src}"></script>`);
    }

    /** @param {string} js */
    addScriptInline(js) {
        this.html
            .getElementsByTagName('body')[0]
            .insertAdjacentHTML('beforeend', `<script>${js}</script>`);
    }
}

/**
 *
 * @param {boolean} dev
 * @param {boolean} noDep
 * @param {boolean} allInOne
 */
const generate = async (dev, noDep, allInOne) => {
    const html = new HTML();

    const buildType = dev ? 'dev' : 'prod';
    const bundleType = noDep ? 'all' : 'default';

    html.setVersion(noDep, allInOne);

    if (!allInOne) {
        if (bundleType !== 'all') {
            for (const a of externalAssets) {
                a.styles?.forEach((x) => html.addStyle(x[buildType]));
                a.scripts?.forEach((x) => html.addScript(x[buildType]));
            }
        }

        for (const a of projectAssets) {
            a.styles?.forEach((x) => html.addStyle(x[buildType][bundleType]));
            a.scripts?.forEach((x) => html.addScript(x[buildType][bundleType]));
        }
    } else {
        // All in one
        if (bundleType !== 'all') {
            throw new Error('All in one html only supports bundle type "all"');
        }

        const style = generateStyle(dev).css;
        const script = (await generateScript(dev, true)) //
            .filter((x) => x.type === 'chunk')[0].code;

        html.addStyleInline(style);
        html.addScriptInline(script);
    }

    const htmlStr = html.toString();

    if (!dev) {
        return await minify(htmlStr, TERSER_OPTIONS);
    }
    return htmlStr;
};

module.exports = {
    generate,
};

// TODO without env, programmatically all in one build

if (require.main === module) {
    const buildType = DEV ? 'dev' : 'prod'; // TODO dev uses version()
    const allInOne = process.env.ALL_IN_ONE === 'true';
    const noDep = allInOne ? true : process.env.BUNDLE === 'all';
    const htmlType = allInOne ? 'all' : noDep ? 'offline' : 'default';

    (async () => {
        let output = await generate(DEV, noDep, allInOne);
        writeFile(outputs.html[buildType][htmlType], output);
    })();
}
