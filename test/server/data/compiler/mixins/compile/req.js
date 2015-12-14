alert('require1 loaded');

'@mixin'['More mixins yo'] = {
    'a.Yo dawg': function () {
        console.log('awesomeness');
    },

    'b.I heard you like tests': function () {
        act.wait(500);
    },

    'c.So we put test in your test': function () {
        ok(true);
    }
};

function doTheThings() {
    console.log('Yep!');
}