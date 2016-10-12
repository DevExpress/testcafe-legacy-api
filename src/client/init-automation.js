import { SETTINGS as AUTOMATION_SETTINGS } from './deps/testcafe-automation';
import { preventRealEvents } from './deps/testcafe-core';
import { fill as fillAutomationStorage } from './automation-storage';

var initialized = false;

export default function init () {
    if (initialized)
        return;

    AUTOMATION_SETTINGS.ACTION_STEP_DELAY      = 60;
    AUTOMATION_SETTINGS.DRAG_ACTION_STEP_DELAY = 100;

    preventRealEvents();
    fillAutomationStorage();
    initialized = true;
}