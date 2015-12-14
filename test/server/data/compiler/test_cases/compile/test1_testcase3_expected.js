[
    function() {
        this['field1'] = 'field1val3';
        this['field2'] = 'field2val3';
    },

    function () {
        while (true) {
            var a = 3 + 2;
            console.log('This is infinite loop lol');
        }
    },

    function () {
        callSomeUselessFunc();
        act.drag('#0');
    },

    function () {
        finish();
    }
]