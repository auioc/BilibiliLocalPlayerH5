const { DEV, inputs, outputs } = require('./const.cjs');
const fs = require('fs');
const { minify } = require('html-minifier-terser');
const { html: terserOptions } = require('./terser.config.cjs');
const { readFile, writeFile } = require('./utils.cjs');

if (DEV) {
    fs.copyFileSync(inputs.style, outputs.style.dev);
} else {
    const css = readFile(inputs.style);
    (async () => {
        const minCss = await minify(css, terserOptions);

        writeFile(outputs.style.prod, minCss);
    })();
}
