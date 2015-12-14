module.exports = [
    //0
    'ok(getLeftDockZone().containsPanel(getDockPanel("panel3")));',

    //1
    'eq(\n' +
    '    getRightDockZone(),\n' +
    '    getDockPanel("panel2")\n' +
    ');',

    //2
    'act.click(getButtonSelector("btnSave"));',

    //3
    'act.click(getButtonSelector("btnRestore"));',

    //4
    'act.click(getButtonSelector("btnEditLayout"));',

    //5
    'ok(getLeftDockZone().containsPanel(getDockPanel("panel1")));',

    //6
    'ok(getRightDockZone().containsPanel(getDockPanel("panel2")));',

    //7
    'ok(getRightDockZone().containsPanel(getDockPanel("panel3")));',

    //8
    'act.click(getButtonSelector("btnEditLayout"));',

    //9
    'act.drag(getDockPanel("panel3").getHeader(), getLeftDockZone().$el);',

    //10
    'act.click(getButtonSelector("btnSave"));',

    //11
    'ok(getLeftDockZone().containsPanel(getDockPanel("panel1")));',

    //12
    'notEq(getRightDockZone(), getDockPanel("panel2"));',

    //13
    'notOk(getRightDockZone().containsPanel(getDockPanel("panel3")));',

    //14
    'ok(getFileManager().getFoldersTreeView().getVisibleNodes().length > 1);',

    //15
    'act.click(getFileManager().getFolderExpandSelector("Raphael"), {\n' +
    '    alt: true\n' +
    '});',

    //16
    'act.click(getFileManager().getFolderClickSelector("1505 - 1510"));',

    //17
    'ok(getFileManager().getFiles().length > 1);',

    //18
    'act.click(getFileManager().getFolderClickSelector("1928 - 1935"));',

    //19
    'ok(getFileManager().getFiles().length > 1);',

    //20
    'notEq(this.folderFiles1, folderFiles2);',

    //21
    'eq(\'yyoyooy\', document.location);',

    //22
    'ok(window.top);',

    //23
    'act.click(function () {\n' +
    '    return \'#test\'\n' +
    '}, {\n' +
    '    alt: true,\n' +
    '    ctrl: false\n' +
    '});',

    //24
    'notEq(document.getElementById(\'#yo\'), 1);',

    //25
    'ok(true);',

    //26
    'notEq(this.prevCssClass, getRoundPanel().attr("class"));',

    //27
    'eq(dx.checkBox("chkNoHeaderViewSwitch").inst.GetChecked(), isRoundPanelHeaderVisible());'
];