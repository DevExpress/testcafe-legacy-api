import * as sourceIndexTracker from '../../source-index';
import * as actions from './actions';


//NOTE: add sourceIndex wrapper
sourceIndexTracker.wrapTrackableMethods(actions, [
    'click',
    'rclick',
    'dblclick',
    'drag',
    'type',
    'wait',
    'waitFor',
    'hover',
    'press',
    'select',
    'navigateTo',
    'upload',
    'screenshot'
]);

export default actions;