'@fixture Test fixture';
'@page http://my.page.url';

'@require ./req.js';

'@mixin'['MixinInFixture'] = {
    '1. Check panel3 docking and save layout via button "Save" click': function () {
        ok(getLeftDockZone().containsPanel(getDockPanel("panel3")));
        eq(
            getRightDockZone(),
            getDockPanel("panel2")
        );
        act.click(getButtonSelector("btnSave"));
    },
    '2. Restore layout via button "Restore" click': function () {
        act.click(getButtonSelector("btnRestore"));
    }
};

'@test'['Test1'] = {
    '1. Set default layout - click button "EditLayout"': function () {
        act.click(getButtonSelector("btnEditLayout"));
    },

    '2. Check default panels layout and button "EditLayout" click': function () {
        ok(getLeftDockZone().containsPanel(getDockPanel("panel1")));
        ok(getRightDockZone().containsPanel(getDockPanel("panel2")));
        ok(getRightDockZone().containsPanel(getDockPanel("panel3")));
        act.click(getButtonSelector("btnEditLayout"));
    },

    '3. Dock panel3 to left dock zone': function () {
        act.drag(getDockPanel("panel3").getHeader(), getLeftDockZone().$el);
    },

    '4. With mixin': '@mixin MixinInFixture',

    '6. Save layout via button "Save" click': function () {
        act.click(getButtonSelector("btnSave"));
    },

    '7. Check restored panels positions': function () {
        ok(getLeftDockZone().containsPanel(getDockPanel("panel1")));
        notEq(getRightDockZone(), getDockPanel("panel2"));
        notOk(getRightDockZone().containsPanel(getDockPanel("panel3")));
    },

    '8. With Mixin': '@mixin MixinInFixture',
    '9. With req mixin': '@mixin MixinInReq'
};

'@test'['Test2'] = {
    '@testCases': [
        {'@name': 'Case1', field1: 'field1val1'},
        {'@name': 'Case2', field1: 'field1val2'}
    ],

    '1. Check folder tree content and select "Raphael" folder': function () {
        ok(getFileManager().getFoldersTreeView().getVisibleNodes().length > 1);
        act.click(getFileManager().getFolderExpandSelector("Raphael"), {
            alt: true
        });
    },

    '2. Select "1505 - 1510" folder': function () {
        act.click(getFileManager().getFolderClickSelector("1505 - 1510"));
    },

    '3. Check quantity of files and select "1928 - 1935" folder': function () {
        ok(getFileManager().getFiles().length > 1);
        this.folderFiles1 = getFilesInnerMarkups();
        act.click(getFileManager().getFolderClickSelector("1928 - 1935"));
    },

    '4. Check quantity of files and check different folder content': function () {
        ok(getFileManager().getFiles().length > 1);
        var folderFiles2 = getFilesInnerMarkups();
        notEq(this.folderFiles1, folderFiles2);
    }
};

function checkSomething() {
    eq('yyoyooy', document.location);
    ok(window.top);
}