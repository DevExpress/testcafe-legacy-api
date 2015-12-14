'@fixture Test fixture';
'@page http://my.page.url';

'@test'['Test1'] = {
    '@testCases': [
        {'@name': 'TestCase1', field1: 'field1val1', field2: 'field2val1'},
        {'@name': [1, 2, 3], field1: 'field1val2', field2: 'field2val2'}
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