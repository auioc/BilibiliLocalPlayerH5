const {
    DEV,
    version,
    srcPath: src,
    buildPath: build,
    publicPath: pub,
} = require('./utils.cjs');

const hash = version().commit.slice(0, 8);

const github = 'https://github.com/auioc/BilibiliLocalPlayerH5';
const license = 'AGPL-3.0';

const inputs = {
    html: src('html/index.html'),
};

const outputs = {
    html: {
        dev: pub('index.html'),
        prod: build('index.html'),
    },
    style: {
        dev: pub('player.css'),
        prod: build(`assets/player.${hash}.min.css`),
    },
};

const styles = {
    player: [
        'player.css', //
        `assets/player.${hash}.min.css`,
    ],
    ccl: [
        '../src/lib/CommentCoreLibrary.css', //
        'https://unpkg.com/comment-core-library@0.11.1/dist/css/style.min.css',
    ],
};

const scripts = {
    player: [
        'player.js', //
        `assets/player.${hash}.min.js`,
    ],
    ccl: [
        '../src/lib/CommentCoreLibrary.js',
        'https://unpkg.com/comment-core-library@0.11.1/dist/CommentCoreLibrary.min.js',
    ],
    ass: [
        '../node_modules/assjs/dist/ass.js', //
        'https://unpkg.com/assjs@0.0.11/dist/ass.min.js',
    ],
};

module.exports = { DEV, github, license, inputs, outputs, styles, scripts };
