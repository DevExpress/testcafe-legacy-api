var expect                  = require('chai').expect;
var path                    = require('path');
var fs                      = require('fs');
var stripBom                = require('strip-bom');
var multl                   = require('multiline');
var Promise                 = require('pinkie');
var hammerheadProcessScript = require('testcafe-hammerhead').wrapDomAccessors;
var CompilerAdapter         = require('../../lib').Compiler;
var RequireAnalyzer         = require('../../lib/compiler/legacy/analysis/require_analyzer');


describe('Legacy compiler adapter', function () {
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

    it('Should mark test as "legacy"', function () {
        var compiler = new CompilerAdapter(hammerheadProcessScript);
        var filename = path.resolve('test/server/data/adapter-test-suite/top.test.js');
        var code     = stripBom(fs.readFileSync(filename));

        return compiler
            .compile(code, filename)
            .then(function (tests) {
                expect(tests[0].isLegacy).to.be.true;
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
