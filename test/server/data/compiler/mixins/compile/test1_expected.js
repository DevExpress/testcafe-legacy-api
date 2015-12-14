[
    function () {
        act.click('#0');
    },

    function () {
        throw 'yo';
    },
    
    function () {
        var foo = 'bar',
            baz = 0;

        for (var i = 0; i < 50; i++)
            baz++;

        act.click(foo, '#1');
    },

    function () {
        act.wait(500, '#2');
    }
]