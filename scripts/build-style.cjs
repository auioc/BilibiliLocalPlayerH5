const sass = require('sass');
const { DEV, srcPath: src, writeFile } = require('./utils.cjs');
const { outputs } = require('./const.cjs');

// TODO copyright notice

const result = sass.compile(src('style/main.scss'), {
    style: DEV ? 'expanded' : 'compressed',
    sourceMap: DEV,
});
writeFile(outputs.style[DEV ? 'dev' : 'prod'], result.css);
