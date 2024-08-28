const {
    DEV,
    srcPath: src,
    buildPath: build,
    publicPath: pub,
} = require('./utils.cjs');

const github = 'https://github.com/auioc/BilibiliLocalPlayerH5';

const inputs = {
    html: src('html/index.html'),
};

const outputs = {
    html: {
        dev: pub('index.html'),
        prod: build('index.html'),
    },
};

const styles = {
    player: [
        'player.css', //
        'assets/player.min.css',
    ],
    ccl: [
        '../src/lib/CommentCoreLibrary.css', //
        'https://unpkg.com/comment-core-library@0.11.1/dist/css/style.min.css',
    ],
};

const scripts = {
    player: [
        'player.js', //
        'assets/player.min.js',
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

module.exports = { DEV, github, inputs, outputs, styles, scripts };
