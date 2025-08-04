const sass = require('sass');
const { DEV, srcPath: src, writeFile } = require('./utils.cjs');
const { outputs } = require('./const.cjs');

// TODO copyright notice

const INPUT = src('style/main.scss');

const generate = (dev) => {
    return sass.compile(INPUT, {
        style: dev ? 'expanded' : 'compressed',
        sourceMap: dev,
    });
};

module.exports = {
    generate,
};

if (require.main === module) {
    const result = generate(DEV);
    writeFile(outputs.style[DEV ? 'dev' : 'prod'], result.css);
}
