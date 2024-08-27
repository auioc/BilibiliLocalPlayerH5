const path = require('path');
const fs = require('fs');
const _execSync = require('child_process').execSync;

const execSync = (cmd) => _execSync(cmd).toString().trim();
const commitHash = () => execSync('git rev-parse --verify HEAD');
const branch = () => execSync('git branch --show-current');
const isDirty = () => execSync('git status --short').length !== 0;
const version = () => {
    const r = {
        branch: branch(),
        commit: commitHash(),
        dirty: isDirty(),
        text: '',
        textShort: '',
    };
    r.text = `${r.branch}@${r.commit}${r.dirty ? '(dirty)' : ''}`;
    r.textShort = `${r.branch}@${r.commit.slice(0, 8)}${r.dirty ? '*' : ''}`;
    return r;
};

const srcPath = (...p) => path.resolve(__dirname, '../src', ...p);
const buildPath = (...p) => path.resolve(__dirname, '../build', ...p);
const publicPath = (...p) => path.resolve(__dirname, '../public', ...p);

function writeFile(file, text) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, 'utf8');
}

function readFile(file) {
    return fs.readFileSync(file, 'utf-8');
}

module.exports = {
    version,
    srcPath,
    buildPath,
    publicPath,
    readFile,
    writeFile,
};
