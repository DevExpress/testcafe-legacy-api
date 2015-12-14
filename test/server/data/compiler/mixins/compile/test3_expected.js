[
    function () {
        act.drag('#4');
    },

    function () {
        callSomeUselessFunc();
        act.drag('#5');
    },

    function () {
        console.log('awesomeness');
    },

    function () {
        act.wait(500, '#6');
    },

    function () {
        ok(true, '#7');
    }
]