[
    function() {
        this['field1'] = 'field1val1';
    },

    function () {
        ok(getFileManager().getFoldersTreeView().getVisibleNodes().length > 1, '#14');
        act.click(getFileManager().getFolderExpandSelector("Raphael"), {
            alt: true
        }, '#15');
    },

    function () {
        act.click(getFileManager().getFolderClickSelector("1505 - 1510"), '#16');
    },

    function () {
        ok(getFileManager().getFiles().length > 1, '#17');
        this.folderFiles1 = getFilesInnerMarkups();
        act.click(getFileManager().getFolderClickSelector("1928 - 1935"), '#18');
    },

    function () {
        ok(getFileManager().getFiles().length > 1, '#19');
        var folderFiles2 = getFilesInnerMarkups();
        notEq(this.folderFiles1, folderFiles2, '#20');
    }
]
