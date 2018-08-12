'use strict';

const fs = require('fs');
const path = require('path');

const regex = /module\.exports = promiseRegistry;/;
const esExport = [
    'export {',
    '    once: defaultRegistry.once,',
    '    register: defaultRegistry.register,',
    '    makeRegistry',
    '};',
    'export default promiseRegistry;'
].join('\n');

const sourcePath = path.resolve(__dirname, '../promise-registry.js');
const source = fs.readFileSync(sourcePath, 'utf-8');

if (!regex.test(source)) {
    throw new Error('The library has changed. Please update this script.');
}

const output = source.replace(regex, esExport);
fs.writeFileSync(path.resolve(__dirname, '../promise-registry.es6.js'), output);