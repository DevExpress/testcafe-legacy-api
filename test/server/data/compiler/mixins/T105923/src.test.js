"@fixture Mixin tests";
"@page http://testcafe.devexpress.com/Example";
"@require ./require.js";


"@test"["1"] = {
    "1": function(){
        act.click($('#Developer_Name'));
    },
    "2": "@mixin Peter Parker",
    "3.Click div": function () {
        var div = $(".mask").eq(1);
        act.click(div);
    },
    'getEl fun': function () {
        var div = $(".mask").eq(0);
        act.click(div);
    }
};