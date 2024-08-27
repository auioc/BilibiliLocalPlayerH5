const {
    DEV,
    github,
    inputs,
    outputs,
    styles,
    scripts,
} = require('./const.cjs');
const HTMLParser = require('node-html-parser');
const { minify } = require('html-minifier-terser');
const { html: terserOptions } = require('./terser.config.cjs');
const { readFile, writeFile, version } = require('./utils.cjs');

const html = HTMLParser.parse(
    readFile(inputs.html), //
    {
        comment: true,
        voidTag: { closingSlash: true },
    }
);

const i = DEV ? 0 : 1;
const setCss = (id, /** @type {keyof styles} */ type) =>
    html
        .getElementById(id)
        ?.setAttribute('href', styles[type][i])
        .removeAttribute('id');
const setScript = (id, /** @type {keyof scripts} */ type) =>
    html
        .getElementById(id)
        ?.setAttribute('src', scripts[type][i])
        .removeAttribute('id');

const setVersion = () => {
    const v = version();
    html.getElementById('github')
        ?.setAttribute('href', github)
        .removeAttribute('id');
    html.getElementById('version')
        ?.set_content(v.textShort)
        .setAttribute('href', github + (v.dirty ? '' : `/tree/${v.commit}`))
        .removeAttribute('id');
};
setVersion();

setCss('css-player', 'player');
setCss('css-ccl', 'ccl');

setScript('script-player', 'player');
setScript('script-ccl', 'ccl');
setScript('script-ass', 'ass');

(async () => {
    let output = html.toString();
    if (!DEV) {
        output = await minify(output, terserOptions);
    }

    writeFile(outputs.html[DEV ? 'dev' : 'prod'], output);
})();
