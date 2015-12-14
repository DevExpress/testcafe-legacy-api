[
    function () {
        while (true) {
            var a = 3 + 2;
            console.log('This is infinite loop lol');
        }
    },

    function () {
        act.click('#0');
    },

    function () {
        throw 'yo';
    },

    function () {
        callSomeUselessFunc();
        act.drag('#3');
    },

    function () {
        finish();
    }
]