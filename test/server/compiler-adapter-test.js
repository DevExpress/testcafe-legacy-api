var expect                  = require('chai').expect;
var path                    = require('path');
var fs                      = require('fs');
var read                    = require('read-file-relative').readSync;
var stripBom                = require('strip-bom');
var multl                   = require('multiline');
var Promise                 = require('pinkie');
var hammerheadProcessScript = require('testcafe-hammerhead').processScript;
var { Compiler: CompilerAdapter } = require('../../lib');
var RequireAnalyzer = require('../../lib/compiler/legacy/analysis/require_analyzer');


describe('Legacy compiler adapter', function () {
    function sanitize (code) {
        return code.replace(/(\r\n|\n|\r)/gm, '')
            .replace(/'/gm, '"')
            .replace(/\s+/gm, '');
    }

    function getTestByName (tests, name) {
        for (var i = 0; i < tests.length; i++) {
            if (tests[i].name === name)
                return tests[i];
        }

        return null;
    }

    it('Should compile and provide tests in the current TestCafe format', function () {
        var compiler = new CompilerAdapter(hammerheadProcessScript);
        var filename = path.resolve('test/server/data/compiler/compile/src.test.js');
        var code     = stripBom(fs.readFileSync(filename));

        return compiler
            .compile(code, filename)
            .then(function (tests) {
                expect(tests.length).eql(2);

                var fixture = tests[0].fixture;

                expect(fixture.path).eql(filename);
                expect(fixture.pageUrl).eql('http://my.page.url/');
                expect(fixture.authCredentials.username).eql('myLogin');
                expect(fixture.authCredentials.password).eql('myPassword');

                var expectedRequireJs   = read('./data/compiler/compile/expected_require_js.js');
                var expectedRemainderJs = read('./data/compiler/compile/expected_remainder_js.js');

                expect(sanitize(fixture.getSharedJs())).eql(sanitize(expectedRequireJs + expectedRemainderJs));

                var test1           = getTestByName(tests, 'My first test');
                var expectedTest1Js = read('./data/compiler/compile/test1_expected.js');

                expect(test1.isLegacy).to.be.true;
                expect(Array.isArray(test1.sourceIndex)).to.be.true;
                expect(sanitize(test1.stepData.js)).eql(sanitize(expectedTest1Js));
                expect(test1.stepData.names).eql(['1.Do smthg cool', '2.Stop here']);
                expect(test1.pageUrl).eql('http://my.page.url/');
                expect(test1.authCredentials.username).eql('myLogin');
                expect(test1.authCredentials.password).eql('myPassword');

                var test2           = getTestByName(tests, 'I want more tests!');
                var expectedTest2Js = read('./data/compiler/compile/test2_expected.js');

                expect(test2.isLegacy).to.be.true;
                expect(Array.isArray(test2.sourceIndex)).to.be.true;
                expect(sanitize(test2.stepData.js)).eql(sanitize(expectedTest2Js));
                expect(test2.stepData.names).eql([
                    '1.Here we go',
                    "2.I'm really tired creating stupid names for test steps",
                    '3.This is a final step'
                ]);
            });
    });

    it('Should read each require once and save it to the cache', function () {
        var requireAnalyzingCount    = 0;
        var nativeRequireAnalyzerRun = RequireAnalyzer.run;

        var sources = [
            path.resolve('test/server/data/adapter-test-suite/require1.test.js'),
            path.resolve('test/server/data/adapter-test-suite/require2.test.js')
        ];

        RequireAnalyzer.run = function () {
            requireAnalyzingCount++;
            nativeRequireAnalyzerRun.apply(this, arguments);
        };

        var compiler = new CompilerAdapter(hammerheadProcessScript);

        return Promise
            .all(sources.map(function (filename) {
                var code = stripBom(fs.readFileSync(filename));

                return compiler.compile(code, filename);
            }))
            .then(function () {
                expect(requireAnalyzingCount).eql(1);
            });
    });

    it('Should provide errors for the legacy compiler', function () {
        var compiler = new CompilerAdapter(hammerheadProcessScript);
        var filename = path.resolve('test/server/data/adapter-test-suite/broken.test.js');
        var code     = stripBom(fs.readFileSync(filename));

        return compiler
            .compile(code, filename)
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err).to.be.an.instanceof(Error);
                expect(err.message).not.to.be.empty;
            });
    });

    it('Should test if file can be compiled', function () {
        var testCases = [
            {
                code: multl(function () {
                    /*
                    '@fixture Fix';
                    '@page page';

                    '@test'["Test"] = {};
                    */
                }),

                filename:   'testfile.test.js',
                canCompile: true
            },

            {
                code: multl(function () {
                    /*
                    '@fixture Fix';
                    '@page page';

                    '@test'["Test"] = {};
                    */
                }),

                filename:   'testfile.js',
                canCompile: false
            },

            {
                code: multl(function () {
                    /*
                    '@page page';

                    '@test'["Test"] = {};
                     */
                }),

                filename:   'testfile.js',
                canCompile: false
            },

            {
                code: multl(function () {
                    /*
                    '@fixture Fix';

                    '@test'["Test"] = {};
                    */
                }),

                filename:   'testfile.js',
                canCompile: false
            },

            {
                code: multl(function () {
                    /*
                    '@fixture Fix';

                    '@test'["Test"] = {};
                    */
                }),

                filename:   'testfile.js',
                canCompile: false
            },
            {
                code: multl(function () {
                    /*
                    '@fixture Fix';
                    '@page page';
                    */
                }),

                filename:   'testfile.js',
                canCompile: false
            },

            {
                code: multl(function () {
                    /*
                    '@fixture Fix';
                    '@page page';

                    '@test'["Test'] = {};
                    */
                }),

                filename:   'testfile.js',
                canCompile: false
            }
        ];

        var compiler = new CompilerAdapter();

        testCases.forEach(function (testData) {
            expect(compiler.canCompile(testData.code, testData.filename)).eql(testData.canCompile);
        });
    });
});
