'@fixture Test fixture';
'@page http://my.page.url';

'@require ./req.js';

function ultraSuperHelperFunc() {
    return 'nothing';
}


'@mixin'['Mixin1'] = {
    'a.This awesome mixin step': function () {
        act.click();
    },

    'b.Do more awesome stuff': function () {
        throw 'yo';
    }
};


var someUselessVar = 'blahblahblah';


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

alert('Hi there!');

'@test'['Test2'] = {
    '1.Here we go': function () {
        while (true) {
            var a = 3 + 2;
            console.log('This is infinite loop lol');
        }
    },

    '2.Do the mix': '@mixin Mixin1',

    "3.I'm really tired creating stupid names for test steps": function () {
        callSomeUselessFunc();
        act.drag();
    },

    '4.This is a final step': function () {
        finish();
    }
};


'@test'['Test3'] = {
    '1.Yoyo': function () {
        act.drag();
    },

    "2.Shake it, baby": function () {
        callSomeUselessFunc();
        act.drag();
    },

    '3.Ready to go': '@mixin More mixins yo'
};



