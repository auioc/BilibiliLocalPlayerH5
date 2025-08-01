const {
    DEV,
    BUNDLEALL,
    version,
    srcPath: src,
    prodOutput: prod,
    devOutput: dev,
} = require('./utils.cjs');

const commit = version().commit.slice(0, 8);

const github = 'https://github.com/auioc/BilibiliLocalPlayerH5';
const license = 'AGPL-3.0';

const inputs = {
    html: src('html/index.html'),
};

const outputs = {
    html: {
        dev: {
            default: dev('index.html'), //
            offline: dev('index.offline.html'), // TODO better name?
            all: dev('index.all.html'),
        },
        prod: {
            default: prod('index.html'), //
            offline: prod('index.offline.html'),
            all: prod('index.all.html'),
        },
    },
    style: {
        dev: dev('player.css'),
        prod: prod(`assets/player.${commit}.min.css`),
    },
};

/** @typedef {{dev:{default:string,all:string},prod:{default:string,all:string}}} ProjectAsset */
/** @type {Array<{scripts?:ProjectAsset[],styles?:ProjectAsset[]}>} */
const projectAssets = [
    {
        scripts: [
            {
                dev: {
                    default: 'player.js', //
                    all: 'player.full.js',
                },
                prod: {
                    default: `assets/player.${commit}.min.js`,
                    all: `assets/player.${commit}.full.min.js`,
                },
            },
        ],
        styles: [
            {
                dev: {
                    default: 'player.css',
                    all: 'player.css',
                },
                prod: {
                    default: `assets/player.${commit}.min.css`,
                    all: `assets/player.${commit}.min.css`,
                },
            },
        ],
    },
];

/** @typedef {{dev:string,prod:string}} ExternalAsset */
/** @type {Array<{scripts?:ExternalAsset[],styles?:ExternalAsset[]}>} */
const externalAssets = [
    {
        scripts: [
            {
                dev: '../src/lib/CommentCoreLibrary.js',
                prod: 'https://unpkg.com/comment-core-library@0.11.1/dist/CommentCoreLibrary.min.js',
            },
        ],
        // styles:[]
    },
    {
        scripts: [
            {
                dev: '../node_modules/assjs/dist/ass.js',
                prod: 'https://unpkg.com/assjs@0.0.11/dist/ass.min.js',
            },
        ],
    },
];

module.exports = {
    DEV,
    BUNDLEALL,
    github,
    license,
    inputs,
    outputs,
    projectAssets,
    externalAssets,
};
