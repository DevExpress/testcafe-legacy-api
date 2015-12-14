'@mixin'['Peter Parker'] = {
    '1.Type in input "Your name:"': function() {
        var input = $("#Developer_Name");
        act.type(input, "Peter Parker");
    },
    "2.Click div": function() {
        act.click($(".mask-radio").eq(0));
    }
};
