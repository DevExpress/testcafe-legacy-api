"@fixture Mixin tests";
"@page http://testcafe.devexpress.com/Example";
"@require ./require.js";

"@mixin"["1"] = {
    "1.Step in mixin 1": function () {
        var div = $(".mask").eq(0);
        act.click(div);
    }
};

"@mixin"["2"] = {
    "1.Step in mixin 2": function () {
        act.click($('.mask')[0]);
    }
};

"@test"["1"] = {
    "1": "@mixin 1",
    "2": "@mixin 2",
    "3": "@mixin Peter Parker",
    "4.Click div": function () {
        var div = $(".mask").eq(1);
        act.click(div);
    },
    'getEl fun': function () {
        var div = $(".mask").eq(0);
        act.click(div);
    }
};

function getElement(className) {
    return $('.' + className).eq(0);
}