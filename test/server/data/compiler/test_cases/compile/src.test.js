'@fixture Test fixture';
'@page http://my.page.url';

'@test'['Test1'] = {
    '@testCases': [
        {'@name': 'TestCase1', field1: 'field1val1', field2: [1, 2, 3]},
        {'@name': 'TestCase2', field1: 'field1val2', field2: {'test': 42}},
        {field1: 'field1val3', field2: 'field2val3'}
    ],

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

'@test'['My first test'] = {
    '@testCases': './cases.json',

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
