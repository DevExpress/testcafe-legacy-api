'@fixture Test fixture';
'@page http://my.page.url';


function ultraSuperHelperFunc() {
    return 'nothing';
}

'@test'['My first test'] = {

};

var someUselessVar = 'blahblahblah';

'@test'['I want more tests!'] = {
    '1.Here we go' : function () {
        while (true) {
            var a = 3 + 2;
            console.log('This is infinite loop lol');
        }
    },

    "2.I'm really tired creating stupid names for test steps" : function () {
        callSomeUselessFunc();
        act.drag();
    },

    '3.This is a final step' : function () {
        finish();
    }
};

alert('Hi there!');