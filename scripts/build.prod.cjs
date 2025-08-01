const { srcPath, prodOutput, writeFile, version } = require('./utils.cjs');
const sass = require('sass');

const commit = version().commit.slice(0, 8);

// TODO new build script

/** @type {sass.Options} */
const SASS_OPTIONS = {
    style: 'compressed',
    sourceMap: false,
};
const STYLE_OUTPUT = prodOutput(`assets/player.${commit}.min.css`);

const buildStyle = () => {};

const buildScript = () => {};

const buildHtml = () => {};

const build = () => {};
