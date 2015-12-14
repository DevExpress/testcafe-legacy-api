'@fixture Test fixture';
'@page http://my.page.url';

'@require ./require.js';

'@test'['My first test'] = {
    '1.Wait': function () {
        var a = {},
            b = a['src'];

        act.wait(500);
    }
};

function test() {
    return window['location'];
}