const assert      = require('assert');
const isjQueryObj = require('../../lib/utils/is-jquery-obj').default;

describe('is-jquery-obj test', () => {
    it('Should define jquery object correctly', () => {
        assert.equal(isjQueryObj(void 0), false);
        assert.equal(isjQueryObj({}), false);
        assert.equal(isjQueryObj({ jquery: {} }), true);
    });
});
