[ function() {
    act.click(getButtonSelector("btnEditLayout"), '#4');
}, function() {
    ok(getLeftDockZone().containsPanel(getDockPanel("panel1")), '#5');
    ok(getRightDockZone().containsPanel(getDockPanel("panel2")), '#6');
    ok(getRightDockZone().containsPanel(getDockPanel("panel3")), '#7');
    act.click(getButtonSelector("btnEditLayout"), '#8');
}, function() {
    act.drag(getDockPanel("panel3").getHeader(), getLeftDockZone().$el, '#9');
}, function() {
    ok(getLeftDockZone().containsPanel(getDockPanel("panel3")), '#0');
    eq(getRightDockZone(), getDockPanel("panel2"), '#1');
    act.click(getButtonSelector("btnSave"), '#2');
}, function() {
    act.click(getButtonSelector("btnRestore"), '#3');
}, function() {
    act.click(getButtonSelector("btnSave"), '#10');
}, function() {
    ok(getLeftDockZone().containsPanel(getDockPanel("panel1")), '#11');
    notEq(getRightDockZone(), getDockPanel("panel2"), '#12');
    notOk(getRightDockZone().containsPanel(getDockPanel("panel3")), '#13');
}, function() {
    ok(getLeftDockZone().containsPanel(getDockPanel("panel3")), '#0');
    eq(getRightDockZone(), getDockPanel("panel2"), '#1');
    act.click(getButtonSelector("btnSave"), '#2');
}, function() {
    act.click(getButtonSelector("btnRestore"), '#3');
}, function() {
    act.click(function() {
        return "#test";
    }, {
        alt: true,
        ctrl: false
    }, '#23');
}, inIFrame(function() {
    return "#frame";
}, function() {
    notEq(document.getElementById("#yo"), 1, '#24');
    ok(true, '#25');
}) ]