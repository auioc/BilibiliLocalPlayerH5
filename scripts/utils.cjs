const path = require('path');
const fs = require('fs');
const _execSync = require('child_process').execSync;

const DEV = process.env.NODE_ENV !== 'production';
const BUNDLEALL = process.env.BUNDLE_TYPE === 'all';

const execSync = (cmd) => _execSync(cmd).toString().trim();
const commitHash = () => execSync('git rev-parse --verify HEAD');
const branch = () => execSync('git branch --show-current');
const isDirty = () => execSync('git status --short').length !== 0;
const version = () => {
    const r = {
        branch: branch(),
        commit: commitHash(),
        dirty: isDirty(),
        dev: DEV,
        text: '',
    };
    r.text = `${r.branch}@${r.commit.slice(0, 8)}`;
    if (r.dirty) {
        r.text += '*';
    }
    if (DEV) {
        r.text += '(dev)';
    }
    return r;
};

const srcPath = (...p) => path.resolve(__dirname, '../src', ...p);
const prodOutput = (...p) => path.resolve(__dirname, '../build', ...p);
const devOutput = (...p) => path.resolve(__dirname, '../public', ...p);

function writeFile(file, text) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, 'utf8');
}

function readFile(file) {
    return fs.readFileSync(file, 'utf-8');
}

module.exports = {
    DEV,
    BUNDLEALL,
    version,
    srcPath,
    prodOutput,
    devOutput,
    readFile,
    writeFile,
};
