import testcafeAutomation from './deps/testcafe-automation';
import { preventRealEvents } from './deps/testcafe-core';
import { fill as fillAutomationStorage } from './automation-storage';

var initialized = false;

export default function init () {
    if (initialized)
        return;

    const ACTION_STEP_DELAY      = 60;
    const DRAG_ACTION_STEP_DELAY = 100;

    const automationSettingAsClass = testcafeAutomation.SETTINGS === void 0;
    const AutomationSettings       = automationSettingAsClass ?
                                     testcafeAutomation.AutomationSettings :
                                     testcafeAutomation.SETTINGS;

    if (automationSettingAsClass) {
        // since testcafe v0.13.0
        Object.defineProperty(AutomationSettings.prototype, 'mouseActionStepDelay', { get: () => ACTION_STEP_DELAY });
        Object.defineProperty(AutomationSettings.prototype, 'keyActionStepDelay', { get: () => ACTION_STEP_DELAY });
    }
    else {
        AutomationSettings.ACTION_STEP_DELAY      = ACTION_STEP_DELAY;
        AutomationSettings.DRAG_ACTION_STEP_DELAY = DRAG_ACTION_STEP_DELAY;
    }

    preventRealEvents();
    fillAutomationStorage();
    initialized = true;
}