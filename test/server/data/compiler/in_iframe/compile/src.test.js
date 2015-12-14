'@fixture Test fixture';
'@page http://my.page.url';

'@test'['Test1'] = {
    '1.Do smthg cool in iframe from function': inIFrame(
        function () {
            return 'iframe';
        },
        function () {
            var foo = 'bar';

            act.click(foo);
        }
    ),

    '2.Do smthg cool in iframe from selector': inIFrame('iframe',
        function () {
            var foo = 'bar';

            act.click(foo);
        }
    )
};