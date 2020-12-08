/* eslint-env node */
/* eslint-disable no-restricted-globals */

import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

const GLOBALS = {
    'hammerhead':             'window[\'%hammerhead%\']',
    'testcafe-automation':    'window[\'%testCafeAutomation%\']',
    'testcafe-core':          'window[\'%testCafeCore%\']',
    'testcafe-ui':            'window[\'%testCafeUI%\']',
    'testcafe-legacy-runner': ' window[\'%testCafeLegacyRunner%\']'
};

export default {
    input:    'index.js',
    external: Object.keys(GLOBALS),

    output: {
        file:    '../../lib/client/index.js',
        format:  'iife',
        globals: GLOBALS,
        // NOTE: 'use strict' in our scripts can break user code
        // https://github.com/DevExpress/testcafe/issues/258
        strict:  false,
        // NOTE: we cannot freeze namespaces since RunnerBase extends actionsAPI
        // https://github.com/DevExpress/testcafe-legacy-api/blob/60cd17a636359d14e4ffbec4316421e9ca1ab3b5/src/client/runner-base.js#L82
        freeze:  false
    },

    plugins: [
        //resolve(),
        commonjs(),
        typescript({ include: ['*.+(j|t)s', '**/*.+(j|t)s', '../**/*.+(j|t)s'] })
    ]
};