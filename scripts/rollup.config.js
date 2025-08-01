import { getRollupOptions } from './build-script.cjs';

const devBuild = process.env.NODE_ENV !== 'production';
const bundleAll = process.env.BUNDLE_TYPE === 'all';

const { input, output } = getRollupOptions(devBuild, bundleAll);

export default { ...input, output: output };
