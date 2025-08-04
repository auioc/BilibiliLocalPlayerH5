const { buildOptions } = require('./rollup.cjs');

const devBuild = process.env.NODE_ENV !== 'production';
const bundleAll = process.env.BUNDLE_TYPE === 'all';

const { input, output } = buildOptions(devBuild, bundleAll);

export default { ...input, output: output };
