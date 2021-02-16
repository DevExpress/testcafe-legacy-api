import hammerhead from './deps/hammerhead';

var JSON          = hammerhead.json;
var nativeMethods = hammerhead.nativeMethods;

const STORAGE_KEY_PREFIX = "runner|";

export default class TestContextStorage {
    constructor (window, testRunId) {
        this.storage    = nativeMethods.winSessionStorageGetter.call(window);
        this.storageKey = STORAGE_KEY_PREFIX + testRunId;
        this.data       = null;

        this._loadFromStorage();
    }

    _loadFromStorage () {
        var savedData = nativeMethods.storageGetItem.call(this.storage, this.storageKey);

        if (savedData) {
            this.data = JSON.parse(savedData);
            nativeMethods.storageRemoveItem.call(this.storage, this.storageKey);
        }
    }

    _saveToStorage () {
        nativeMethods.storageSetItem.call(this.storage, this.storageKey, JSON.stringify(this.data));
    }

    get () {
        return this.data;
    }

    set (newData) {
        this.data = newData;
        this._saveToStorage();
    }

    setProperty (prop, value) {
        this.data[prop] = value;
        this._saveToStorage();
    }

    dispose () {
        nativeMethods.storageRemoveItem.call(this.storage, this.storageKey);
    }
};
