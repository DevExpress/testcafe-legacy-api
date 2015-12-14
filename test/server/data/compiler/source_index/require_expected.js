function someMethod() {
    notEq(this.prevCssClass, getRoundPanel().attr("class"), '#26');
    eq(dx.checkBox("chkNoHeaderViewSwitch").inst.GetChecked(), isRoundPanelHeaderVisible(), '#27');
};