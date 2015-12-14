'@fixture Test fixture';
'@page http://my.page.url';

'@require ./requires/req1.js';
'@require ./requires/2/req2.js';
'@require ./req3.js';

'@require :testModule';

'@auth myLogin:myPassword';

function ultraSuperHelperFunc() {
    return 'nothing';
}

'@test'['My first test'] = {
    '1.Do smthg cool': function () {
        var foo = 'bar',
            baz = 0;

        for (var i = 0; i < 50; i++)
            baz++;

        act.click(foo);
    },

    '2.Stop here': function () {
        act.wait(500);
    }
};

var someUselessVar = 'blahblahblah';

'@test'['I want more tests!'] = {
    '1.Here we go': function () {
        while (true) {
            var a = 3 + 2;
            console.log('This is infinite loop lol');
        }
    },

    "2.I'm really tired creating stupid names for test steps": function () {
        callSomeUselessFunc();
        act.drag();
    },

    '3.This is a final step': function () {
        finish();
    }
};

alert('Hi there!');