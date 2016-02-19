var expect                  = require('chai').expect;
var fs                      = require('fs');
var read                    = require('read-file-relative').readSync;
var Promise                 = require('pinkie');
var hammerheadProcessScript = require('testcafe-hammerhead').wrapDomAccessors;
var Compiler                = require('../../lib/compiler/legacy/compiler');
var RequireReader           = require('../../lib/compiler/require-reader');
var ERR_CODE                = require('../../lib/compiler/legacy/err_codes');


function compile (filename, opts) {
    opts = opts || {};

    var code          = fs.readFileSync(filename).toString();
    var requireReader = new RequireReader(opts.requiresDescriptorCache, hammerheadProcessScript);
    var compiler      = new Compiler(code, filename, opts.modules, requireReader, opts.sourceIndex, hammerheadProcessScript);

    var compilation = new Promise(function (resolve, reject) {
        compiler.compile(function (errs, out) {
            if (errs)
                reject(errs);
            else
                resolve(out);
        });
    });

    if (opts.shouldFail) {
        compilation = compilation.then(function () {
            throw 'Compilation fail expected';
        });
    }

    return compilation;
}

function sanitize (code) {
    return code.replace(/(\r\n|\n|\r)/gm, '')
        .replace(/'/gm, '"')
        .replace(/\s+/gm, '');
}

function normalizePath (path) {
    return path.replace(/\\/gm, '/');
}

describe('Compiler', function () {
    it('Should compile', function () {
        return compile('test/server/data/compiler/compile/src.test.js', {
            modules: {
                'testModule': [
                    'test/server/data/compiler/compile/module/m_req1.js',
                    'test/server/data/compiler/compile/module/m_req2.js'
                ]
            }
        }).then(function (out) {
            expect(out.fixture).eql('Test fixture');
            expect(out.page).eql('http://my.page.url');
            expect(out.authCredentials.username).eql('myLogin');
            expect(out.authCredentials.password).eql('myPassword');

            var expectedRequireJs = read('./data/compiler/compile/expected_require_js.js');

            expect(sanitize(out.requireJs)).eql(sanitize(expectedRequireJs));

            var expectedRemainderJs = read('./data/compiler/compile/expected_remainder_js.js');

            expect(sanitize(out.remainderJs)).eql(sanitize(expectedRemainderJs));

            var expectedTest1Js = read('./data/compiler/compile/test1_expected.js');

            expect(sanitize(out.testsStepData['My first test'].js)).eql(sanitize(expectedTest1Js));
            expect(out.testsStepData['My first test'].names).eql(['1.Do smthg cool', '2.Stop here']);

            var expectedTest2Js = read('./data/compiler/compile/test2_expected.js');

            expect(sanitize(out.testsStepData['I want more tests!'].js)).eql(sanitize(expectedTest2Js));
            expect(out.testsStepData['I want more tests!'].names).eql([
                '1.Here we go',
                "2.I'm really tired creating stupid names for test steps",
                '3.This is a final step'
            ]);
        });
    });

    it('Should process script in a module', function () {
        return compile('test/server/data/compiler/wrap_dom_accessors/src.test.js')
            .then(function (out) {
                var expectedRequireJs = read('./data/compiler/wrap_dom_accessors/require_expected.js');

                expect(sanitize(out.requireJs)).eql(sanitize(expectedRequireJs));

                var expectedRemainderJs = read('./data/compiler/wrap_dom_accessors/remainder_js_expected.js');

                expect(sanitize(out.remainderJs)).eql(sanitize(expectedRemainderJs));

                var expectedTestJs = read('./data/compiler/wrap_dom_accessors/test_expected.js');

                expect(sanitize(out.testsStepData['My first test'].js)).eql(sanitize(expectedTestJs));
            });
    });

    it('Should compile with mixins', function () {
        return compile('test/server/data/compiler/mixins/compile/src.test.js')
            .then(function (out) {
                var expectedTest1Js = read('./data/compiler/mixins/compile/test1_expected.js');

                expect(sanitize(out.testsStepData['Test1'].js)).eql(sanitize(expectedTest1Js));

                expect(out.testsStepData['Test1'].names).eql([
                    '1.Add mixin | a.This awesome mixin step',
                    '1.Add mixin | b.Do more awesome stuff',
                    '2.Do smthg cool',
                    '3.Stop here'
                ]);

                var expectedTest2Js = read('./data/compiler/mixins/compile/test2_expected.js');

                expect(sanitize(out.testsStepData['Test2'].js)).eql(sanitize(expectedTest2Js));

                expect(out.testsStepData['Test2'].names).eql([
                    '1.Here we go',
                    '2.Do the mix | a.This awesome mixin step',
                    '2.Do the mix | b.Do more awesome stuff',
                    "3.I'm really tired creating stupid names for test steps",
                    '4.This is a final step'
                ]);

                var expectedTest3Js = read('./data/compiler/mixins/compile/test3_expected.js');

                expect(sanitize(out.testsStepData['Test3'].js)).eql(sanitize(expectedTest3Js));

                expect(out.testsStepData['Test3'].names).eql([
                    '1.Yoyo',
                    '2.Shake it, baby',
                    '3.Ready to go | a.Yo dawg',
                    '3.Ready to go | b.I heard you like tests',
                    '3.Ready to go | c.So we put test in your test'
                ]);

                var expectedRemainderJs = read('./data/compiler/mixins/compile/remainder_expected.js');

                expect(sanitize(out.remainderJs)).eql(sanitize(expectedRemainderJs));

                var expectedRequireJs = read('./data/compiler/mixins/compile/req_expected.js');

                expect(sanitize(out.requireJs)).eql(sanitize(expectedRequireJs));
            });
    });

    it('Should provide source index', function () {
        var sourceIndex = [];

        return compile('test/server/data/compiler/source_index/src.test.js', { sourceIndex: sourceIndex })
            .then(function (out) {
                var expectedTest1Js = read('./data/compiler/source_index/test1_expected.js');

                expect(sanitize(out.testsStepData['Test1'].js)).eql(sanitize(expectedTest1Js));

                //Test2Case1
                var expectedTest2Case1Js = read('./data/compiler/source_index/test2_case1_expected.js');

                expect(sanitize(out.testsStepData['Test2   \u2192   Case1'].js)).eql(sanitize(expectedTest2Case1Js));

                //Test2Case2
                var expectedTest2Case2Js = read('./data/compiler/source_index/test2_case2_expected.js');

                expect(sanitize(out.testsStepData['Test2   \u2192   Case2'].js)).eql(sanitize(expectedTest2Case2Js));

                var expectedRemainderJs = read('./data/compiler/source_index/remainder_expected.js');

                expect(sanitize(out.remainderJs)).eql(sanitize(expectedRemainderJs));

                var expectedRequireJs = read('./data/compiler/source_index/require_expected.js');

                expect(sanitize(out.requireJs)).eql(sanitize(expectedRequireJs));

                var expectedSourceIndex = require('./data/compiler/source_index/source_index_expected');

                expect(sourceIndex).eql(expectedSourceIndex);
            });
    });

    it('Should compile `inIFrame` directive', function () {
        return compile('test/server/data/compiler/in_iframe/compile/src.test.js')
            .then(function (out) {
                var expectedTestJs = read('./data/compiler/in_iframe/compile/expected.js');

                expect(sanitize(out.testsStepData['Test1'].js)).eql(sanitize(expectedTestJs));
            });
    });

    it('Should compile test cases', function () {
        return compile('test/server/data/compiler/test_cases/compile/src.test.js')
            .then(function (out) {
                expect(Object.keys(out.testsStepData).length).eql(5);

                var test1ExpectedStepNames = [
                    '-INIT TEST CASE-',
                    '1.Here we go',
                    '2.I\'m really tired creating stupid names for test steps',
                    '3.This is a final step'
                ];

                var test2ExpectedStepNames = [
                    '-INIT TEST CASE-',
                    '1.Do smthg cool',
                    '2.Stop here'
                ];

                //Test1Case1
                var name       = 'Test1   \u2192   TestCase1';
                var expectedJs = read('./data/compiler/test_cases/compile/test1_testcase1_expected.js');

                expect(sanitize(out.testsStepData[name].js)).eql(sanitize(expectedJs));
                expect(out.testsStepData[name].names).eql(test1ExpectedStepNames);
                expect(out.testGroupMap[name]).eql('Test1');

                //Test1Case2
                name       = 'Test1   \u2192   TestCase2';
                expectedJs = read('./data/compiler/test_cases/compile/test1_testcase2_expected.js');

                expect(sanitize(out.testsStepData[name].js)).eql(sanitize(expectedJs));
                expect(out.testsStepData[name].names).eql(test1ExpectedStepNames);
                expect(out.testGroupMap[name]).eql('Test1');

                //Test1Case3
                name       = 'Test1   \u2192   Test case at index 2';
                expectedJs = read('./data/compiler/test_cases/compile/test1_testcase3_expected.js');

                expect(sanitize(out.testsStepData[name].js)).eql(sanitize(expectedJs));
                expect(out.testsStepData[name].names).eql(test1ExpectedStepNames);
                expect(out.testGroupMap[name]).eql('Test1');

                //Test2Case1
                name       = 'My first test   \u2192   OneMoreCase';
                expectedJs = read('./data/compiler/test_cases/compile/test2_testcase1_expected.js');

                expect(sanitize(out.testsStepData[name].js)).eql(sanitize(expectedJs));
                expect(out.testsStepData[name].names).eql(test2ExpectedStepNames);
                expect(out.testGroupMap[name]).eql('My first test');

                //Test2Case2
                name       = 'My first test   \u2192   And more';
                expectedJs = read('./data/compiler/test_cases/compile/test2_testcase2_expected.js');

                expect(sanitize(out.testsStepData[name].js)).eql(sanitize(expectedJs));
                expect(out.testsStepData[name].names).eql(test2ExpectedStepNames);
                expect(out.testGroupMap[name]).eql('My first test');
            });
    });

    describe('Errors', function () {
        it('Javascript parsing failed', function () {
            var filename = 'test/server/data/compiler/parsing_failed.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.JAVASCRIPT_PARSING_FAILED);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].parserErr).to.be.an('object');
                });
        });

        it('Auth directive redefinition', function () {
            var filename = 'test/server/data/compiler/auth_directive_redefinition.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.AUTH_DIRECTIVE_REDEFINITION);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Fixture redefinition', function () {
            var filename = 'test/server/data/compiler/fixture_redefinition.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.FIXTURE_DIRECTIVE_REDEFINITION);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Page directive redefinition', function () {
            var filename = 'test/server/data/compiler/page_directive_redefinition.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.PAGE_DIRECTIVE_REDEFINITION);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Auth credentials invalid format', function () {
            var filename = 'test/server/data/compiler/auth_credentials_invalid_format.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.INVALID_NETWORK_AUTHENTICATION_CREDENTIALS_FORMAT);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Duplicate require', function () {
            var filename = 'test/server/data/compiler/duplicate_require.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.REQUIRED_FILE_ALREADY_INCLUDED);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Misplaced directive expression', function () {
            var filename = 'test/server/data/compiler/misplaced_directive_expression.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MISPLACED_DIRECTIVE);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Misplaced test directive', function () {
            var filename = 'test/server/data/compiler/misplaced_test_directive.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MISPLACED_TEST_DECLARATION);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Duplicate test name', function () {
            var filename = 'test/server/data/compiler/duplicate_test_name.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.DUPLICATE_TEST_NAME);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Empty test name', function () {
            var filename = 'test/server/data/compiler/empty_test_name.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.EMPTY_TEST_NAME);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Invalid test assignment', function () {
            var filename = 'test/server/data/compiler/invalid_test_assignment.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.INVALID_TEST_ASSIGNMENT);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test step is not a function', function () {
            var filename = 'test/server/data/compiler/test_step_is_not_a_function.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_STEP_IS_NOT_A_FUNCTION_OR_MIXIN);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test is empty', function () {
            var filename = 'test/server/data/compiler/test_step_is_not_a_function.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_STEP_IS_NOT_A_FUNCTION_OR_MIXIN);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test step is empty', function () {
            var filename = 'test/server/data/compiler/test_step_is_empty.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_STEP_IS_EMPTY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Action func is not a last entry', function () {
            var filename = 'test/server/data/compiler/action_func_is_not_a_last_entry.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.ACTION_FUNC_IS_NOT_A_LAST_ENTRY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Action func is called in shared code', function () {
            var filename = 'test/server/data/compiler/action_func_call_in_shared_code/src.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(3);
                    expect(errs[0].type).eql(ERR_CODE.ACTION_FUNC_CALL_IN_SHARED_CODE);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');

                    expect(errs[1].type).eql(ERR_CODE.ACTION_FUNC_CALL_IN_SHARED_CODE);
                    expect(normalizePath(errs[1].filename)).not.eql(filename);
                    expect(errs[1].line).to.be.a('number');

                    expect(errs[2].type).eql(ERR_CODE.ACTION_FUNC_CALL_IN_SHARED_CODE);
                    expect(normalizePath(errs[2].filename)).not.eql(filename);
                    expect(errs[2].line).to.be.a('number');
                });
        });

        it('Fixture is undefined', function () {
            var filename = 'test/server/data/compiler/fixture_is_undefined.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.FIXTURE_DIRECTIVE_IS_UNDEFINED);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                });
        });

        it('Load expression is undefined', function () {
            var filename = 'test/server/data/compiler/page_directive_is_undefined.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.PAGE_DIRECTIVE_IS_UNDEFINED);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                });
        });

        it('Async func call', function () {
            var filename = 'test/server/data/compiler/async_func_call/async_func_call.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.ASYNC_FUNC_CALL);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Failed load require', function () {
            var filename = 'test/server/data/compiler/failed_load_require.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.FAILED_LOAD_REQUIRE);
                    expect(normalizePath(errs[0].ownerFilename)).eql(filename);
                    expect(errs[0].filename).to.be.a('string');
                });
        });

        it('Module not found', function () {
            var filename = 'test/server/data/compiler/module_not_found.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MODULE_NOT_FOUND);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Misplaced mixin declaration', function () {
            var filename = 'test/server/data/compiler/mixins/misplaced_mixin_declaration.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MISPLACED_MIXIN_DECLARATION);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Empty mixin name', function () {
            var filename = 'test/server/data/compiler/mixins/empty_mixin_name.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.EMPTY_MIXIN_NAME);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Duplicate mixin name', function () {
            var filename = 'test/server/data/compiler/mixins/duplicate_mixin_name.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.DUPLICATE_MIXIN_NAME);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].name).to.be.a('string');
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Duplicate mixin name in require', function () {
            var filename     = 'test/server/data/compiler/mixins/duplicate_in_require/src.test.js';
            var req1Filename = 'test/server/data/compiler/mixins/duplicate_in_require/req1.js';
            var req2Filename = 'test/server/data/compiler/mixins/duplicate_in_require/req2.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(2);

                    expect(errs[0].type).eql(ERR_CODE.DUPLICATE_MIXIN_NAME_IN_REQUIRE);
                    expect(errs[0].name).eql('Mixin1');
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(normalizePath(errs[0].defFilename1)).eql(req2Filename);
                    expect(normalizePath(errs[0].defFilename2)).eql(req1Filename);

                    expect(errs[1].type).eql(ERR_CODE.DUPLICATE_MIXIN_NAME_IN_REQUIRE);
                    expect(errs[1].name).eql('Mixin2');
                    expect(normalizePath(errs[1].filename)).eql(filename);
                    expect(normalizePath(errs[1].defFilename1)).eql(req2Filename);
                    expect(normalizePath(errs[1].defFilename2)).eql(filename);
                });
        });

        it('Mixin is empty', function () {
            var filename = 'test/server/data/compiler/mixins/mixin_is_empty.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MIXIN_IS_EMPTY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Mixin step is not a function', function () {
            var filename = 'test/server/data/compiler/mixins/mixin_step_is_not_a_function.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MIXIN_STEP_IS_NOT_A_FUNCTION);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Mixin step is empty', function () {
            var filename = 'test/server/data/compiler/mixins/mixin_step_is_empty.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MIXIN_STEP_IS_EMPTY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Invalid mixin assignment', function () {
            var filename = 'test/server/data/compiler/mixins/invalid_mixin_assignment.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.INVALID_MIXIN_ASSIGNMENT);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Async func call in mixin', function () {
            var filename = 'test/server/data/compiler/mixins/async_func_call.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.ASYNC_FUNC_CALL);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Action func is not a last entry in mixin step', function () {
            var filename = 'test/server/data/compiler/mixins/action_func_is_not_a_last_entry.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.ACTION_FUNC_IS_NOT_A_LAST_ENTRY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Mixin inside mixin', function () {
            var filename = 'test/server/data/compiler/mixins/mixin_inside_mixin.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.MIXIN_USED_IN_MIXIN);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Undefined mixin used', function () {
            var filename = 'test/server/data/compiler/mixins/undefined_mixin_used.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.UNDEFINED_MIXIN_USED);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('inIFrame - insufficient arguments', function () {
            var filename = 'test/server/data/compiler/in_iframe/insufficient_arguments.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.INIFRAME_FUNCTION_SHOULD_ACCEPT_TWO_ARGS);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('inIFrame - test step is not a function', function () {
            var filename = 'test/server/data/compiler/in_iframe/test_step_is_not_a_function.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_STEP_IS_NOT_A_FUNCTION_OR_MIXIN);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Failed to read external test case', function () {
            var filename = 'test/server/data/compiler/test_cases/failed_to_read_external_test_cases.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.FAILED_TO_READ_EXTERNAL_TEST_CASES);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                });
        });

        it('External test cases list is not array', function () {
            var filename = 'test/server/data/compiler/test_cases/external_test_cases_list_is_not_array/src.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASES_LIST_IS_NOT_ARRAY);
                    expect(normalizePath(errs[0].filename)).not.eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test cases list is not array', function () {
            var filename = 'test/server/data/compiler/test_cases/test_cases_list_is_not_array.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASES_LIST_IS_NOT_ARRAY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test cases list is empty', function () {
            var filename = 'test/server/data/compiler/test_cases/test_cases_list_is_empty.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASES_LIST_IS_EMPTY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test case is not an object', function () {
            var filename = 'test/server/data/compiler/test_cases/test_case_is_not_an_object.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASE_IS_NOT_AN_OBJECT);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it("Test case doesn't contain any fields", function () {
            var filename = 'test/server/data/compiler/test_cases/test_case_doesnt_contain_any_fields.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASE_DOESNT_CONTAIN_ANY_FIELDS);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test case name is not a string', function () {
            var filename = 'test/server/data/compiler/test_cases/test_case_name_is_not_a_string.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASE_NAME_IS_NOT_A_STRING);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Duplicate test case name', function () {
            var filename = 'test/server/data/compiler/test_cases/duplicate_test_case_name.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.DUPLICATE_TEST_CASE_NAME);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });

        it('Test cases list is empty', function () {
            var filename = 'test/server/data/compiler/test_cases/test_cases_list_is_empty.test.js';

            return compile(filename, { shouldFail: true })
                .catch(function (errs) {
                    expect(errs.length).eql(1);
                    expect(errs[0].type).eql(ERR_CODE.TEST_CASES_LIST_IS_EMPTY);
                    expect(normalizePath(errs[0].filename)).eql(filename);
                    expect(errs[0].line).to.be.a('number');
                });
        });
    });

    describe('Regression', function () {
        it('T105929 - Mixins - Playback and page markup crashed', function () {
            return compile('test/server/data/compiler/mixins/T105929/src.test.js')
                .then(function (out) {
                    expect(out.requireJs).to.be.empty;
                });
        });

        it('T105923 - Error raised when two tests in fixture contain the same mixin (connected via @require directive)', function () {
            var requireCache = {};

            return compile('test/server/data/compiler/mixins/T105923/src.test.js', { requiresDescriptorCache: requireCache })
                .then(function () {
                    return compile('test/server/data/compiler/mixins/T105923/src.test.js', { requiresDescriptorCache: requireCache });
                });
        });

        it('T113201 - Mixin in require with the precending comment causes compilation error', function () {
            return compile('test/server/data/compiler/mixins/T113201/src.test.js')
                .then(function (out) {
                    expect(Object.keys(out.testsStepData).length).eql(1);
                });
        });

        it('T215683 - TestCafe cannot perform Windows authentication if the password contains a colon', function () {
            return compile('test/server/data/compiler/T215683.test.js')
                .then(function (out) {
                    expect(out.authCredentials.username).eql('someName');
                    expect(out.authCredentials.password).eql('d7W:8LK:XKS2w#T');
                });
        });
    });
});
