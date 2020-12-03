import { readSync as read } from 'read-file-relative';
import CompilerAdapter from './compiler';
import TestRun from './test-run';
import TEST_RUN_ERROR_TYPE from './test-run-error/type';
import TestRunErrorFormattableAdapter from './test-run-error/formattable-adapter';

const CLIENT_RUNNER_SCRIPT = read('./client/index.js');

export {
    TEST_RUN_ERROR_TYPE,
    CLIENT_RUNNER_SCRIPT,
    CompilerAdapter as Compiler,
    TestRun,
    TestRunErrorFormattableAdapter
};
