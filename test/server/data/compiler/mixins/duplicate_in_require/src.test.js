'@fixture Test fixture';
'@page http://my.page.url';

'@require ./req1.js';
'@require ./req2.js';

'@mixin'['Mixin2'] = {
    '1.Step': function () {
        console.log('Hey there');
    }
};

'@test'['Test1'] = {
    '1.Add mixin': '@mixin Mixin1',

    '2.Do smthg cool': function () {
        var foo = 'bar',
            baz = 0;

        for (var i = 0; i < 50; i++)
            baz++;

        act.click(foo);
    },

    '3.Stop here': function () {
        act.wait(500);
    }
};
