[
    function () {
        var foo = 'bar',
            baz = 0;

        for (var i = 0; i < 50; i++)
            baz++;

        act.click(foo, '#0');
    },

    function () {
        act.wait(500, '#1');
    }
]