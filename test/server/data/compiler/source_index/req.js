'@mixin'['MixinInReq'] = {
    '1.First step': function () {
        act.click(function () {
            return '#test'
        }, {
            alt: true,
            ctrl: false
        });
    },

    '2.Check': inIFrame('#frame', function () {
        notEq(document.getElementById('#yo'), 1);
        ok(true);
    })
};

function someMethod() {
    notEq(this.prevCssClass, getRoundPanel().attr("class"));
    eq(dx.checkBox("chkNoHeaderViewSwitch").inst.GetChecked(), isRoundPanelHeaderVisible());
}
