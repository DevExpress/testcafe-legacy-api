[
    inIFrame(
        function () {
            return 'iframe';
        },
        function () {
            var foo = 'bar';

            act.click(foo, '#0');
        }
    ),

    inIFrame(function () { return 'iframe'; }, function () {
        var foo = 'bar';

        act.click(foo, '#1');
    })
]