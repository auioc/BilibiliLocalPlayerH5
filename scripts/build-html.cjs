const {
    DEV,
    BUNDLEALL,
    github,
    license,
    inputs,
    outputs,
    externalAssets,
    projectAssets,
} = require('./const.cjs');
const HTMLParser = require('node-html-parser');
const { minify } = require('html-minifier-terser');
const {
    readFile,
    writeFile,
    version,
    prodOutput,
    devOutput,
} = require('./utils.cjs');

const html = HTMLParser.parse(
    readFile(inputs.html), //
    {
        comment: true,
        voidTag: { closingSlash: true },
    }
);

const setVersion = () => {
    const v = version();
    html.getElementById('github')
        ?.setAttribute('href', github)
        .removeAttribute('id');
    html.getElementById('license')
        ?.setAttribute('href', github + '/blob/main/LICENSE')
        .set_content(license)
        .removeAttribute('id');
    html.getElementById('year')
        .set_content('' + new Date().getFullYear())
        .removeAttribute('id');
    html.getElementById('version')
        ?.set_content(v.text)
        .setAttribute('href', github + (v.dirty ? '' : `/tree/${v.commit}`))
        .removeAttribute('id');
};
setVersion();

const addStyle = (href) => {
    html.getElementsByTagName('head')[0].insertAdjacentHTML(
        'beforeend',
        `<link rel="stylesheet" href="${href}" />`
    );
};

const addStyleInline = (css) => {
    html.getElementsByTagName('head')[0].insertAdjacentHTML(
        'beforeend',
        `<style>${css}</style>`
    );
};

const addScript = (src) => {
    html.getElementsByTagName('body')[0].insertAdjacentHTML(
        'beforeend',
        `<script src="${src}"></script>`
    );
};

const addScriptInline = (js) => {
    html.getElementsByTagName('body')[0].insertAdjacentHTML(
        'beforeend',
        `<script>${js}</script>`
    );
};

const buildType = DEV ? 'dev' : 'prod';
const bundleType = BUNDLEALL ? 'all' : 'default'; // TODO
const htmlType =
    process.env.ALL_IN_ONE === 'true'
        ? 'all'
        : BUNDLEALL
        ? 'offline'
        : 'default';

if (htmlType !== 'all') {
    if (bundleType !== 'all') {
        for (const assets of externalAssets) {
            assets.styles?.forEach((x) => addStyle(x[buildType]));
            assets.scripts?.forEach((x) => addScript(x[buildType]));
        }
    }

    for (const assets of projectAssets) {
        assets.styles?.forEach((x) => addStyle(x[buildType][bundleType]));
        assets.scripts?.forEach((x) => addScript(x[buildType][bundleType]));
    }
} else {
    if (bundleType !== 'all') {
        throw new Error('All in one html only supports bundle type "all"');
    }
    // TODO all in one html
    for (const assets of projectAssets) {
        const f = DEV ? devOutput : prodOutput;
        assets.styles?.forEach((x) =>
            addStyleInline(readFile(f(x[buildType][bundleType])))
        );
        assets.scripts?.forEach((x) =>
            addScriptInline(readFile(f(x[buildType][bundleType])))
        );
    }
}

(async () => {
    let output = html.toString();
    if (!DEV) {
        /**
         * @type {import('html-minifier-terser').Options}
         */
        const terserOptions = {
            collapseWhitespace: true,
            minifyJS: true,
            removeComments: true,
        };
        output = await minify(output, terserOptions);
    }

    writeFile(outputs.html[buildType][htmlType], output);
})();

// TODO 4? 5? 6?
