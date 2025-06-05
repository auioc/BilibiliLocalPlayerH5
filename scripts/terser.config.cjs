const html = { collapseWhitespace: true, minifyJS: true, removeComments: true };
const javascript = { compress: { pure_funcs: ['console.debug'] } };

module.exports = { html, javascript };
