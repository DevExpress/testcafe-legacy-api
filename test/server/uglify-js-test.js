var expect   = require('chai').expect;
var uglifyJs = require('../../lib/compiler/tools/uglify-js/uglify-js');

const parser = uglifyJs.parser;
const pro    = uglifyJs.uglify;

// NOTE: for details see https://github.com/DevExpress/testcafe-legacy-api/issues/26
describe('uglify-js issues', function () {
    it('Incorrect Handling of Non-Boolean Comparisons During Minification', function () {
        // https://nodesecurity.io/advisories/39
        // Test copied from the original commit with the fix:
        // https://github.com/mishoo/UglifyJS2/commit/905b6011784ca60d41919ac1a499962b7c1d4b02#diff-da11f2d01f8e5ed77dd7e790483536fb
        const code                 = 'var match = !x && (!z || c) && (!k || d) && the_stuff();';
        const expectedMinifiedCode = 'var match=!x&&(!z||c)&&(!k||d)&&the_stuff()';
        let ast                    = parser.parse(code);

        ast = pro.ast_mangle(ast, { mangle: true });

        /* eslint-disable camelcase */
        ast = pro.ast_squeeze(ast, { no_warnings: true });
        /* eslint-enable camelcase */

        ast = pro.ast_squeeze_more(ast);

        const minified = uglifyJs.uglify.gen_code(ast);

        expect(minified).to.be.equal(expectedMinifiedCode);
    });

    it('Regular Expression Denial of Service', function () {
        // https://nodesecurity.io/advisories/48
        const NS_PER_SEC = 1e9;
        const getTime    = hrtime => hrtime[0] * NS_PER_SEC + hrtime[1];

        const genstr = function (len, chr) {
            let result = '';

            for (let i = 0; i <= len; i++)
                result += chr;

            return result;
        };

        let startTime = process.hrtime();

        try {
            uglifyJs.parser.parse('var a = ' + genstr(10000, '1') + '.1ee7;');
        }
        catch (e) {
            // parsing should be failed
        }

        const firstTime = getTime(process.hrtime(startTime));

        startTime = process.hrtime();

        try {
            uglifyJs.parser.parse('var a = ' + genstr(100000, '1') + '.1ee7;');
        }
        catch (e) {
            // parsing should be failed
        }

        const secondTime = getTime(process.hrtime(startTime));

        expect(secondTime - firstTime).lt(firstTime * 20);
    });
});

