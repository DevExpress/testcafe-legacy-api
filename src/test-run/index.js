import path from 'path';
import { readSync as read } from 'read-file-relative';
import Mustache from 'mustache';
import { Session } from 'testcafe-hammerhead';
import COMMAND from './command';
import ERROR_TYPE from '../test-run-error/type';
import TestRunErrorFormattableAdapter from '../test-run-error/formattable-adapter';

// Const
const TEST_RUN_TEMPLATE        = read('../client/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE = read('../client/test-run/iframe.js.mustache');


const ASYNC_SERVICE_MESSAGE_HANDLERS = [COMMAND.takeScreenshot, COMMAND.fatalError, COMMAND.assertionFailed, COMMAND.done];

export default class LegacyTestRun extends Session {
    constructor ({ test, browserConnection, screenshotCapturer, opts }) { // eslint-disable-line no-unused-vars
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.methodLock = Promise.resolve();

        this.unstable = false;

        this.opts              = opts;
        this.test              = test;
        this.browserConnection = browserConnection;

        this.isFileDownloading = false;

        this.errs                       = [];
        this.nativeDialogsInfo          = null;
        this.nativeDialogsInfoTimeStamp = 0;
        this.stepsSharedData            = {};
        this.screenshotCapturer         = screenshotCapturer;

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-automation.js');
        this.injectable.scripts.push('/testcafe-legacy-runner.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');
    }


    static makeBlocking (target, methodName) {
        const method = target[methodName];

        target[methodName] = function (...args) {
            this.methodLock = this.methodLock
                .then(() => method.apply(this, args));

            return this.methodLock;
        };
    }

    async getPayloadScript () {
        var sharedJs = this.test.fixture.getSharedJs();

        return Mustache.render(TEST_RUN_TEMPLATE, {
            stepNames:                  JSON.stringify(this.test.stepData.names),
            testSteps:                  this.test.stepData.js,
            sharedJs:                   sharedJs,
            testRunId:                  this.id,
            browserId:                  this.browserConnection.id,
            browserHeartbeatUrl:        this.browserConnection.heartbeatUrl,
            browserStatusUrl:           this.browserConnection.statusDoneUrl,
            takeScreenshots:            this.screenshotCapturer.enabled,
            takeScreenshotsOnFails:     this.opts.takeScreenshotsOnFails,
            skipJsErrors:               this.opts.skipJsErrors,
            nativeDialogsInfo:          JSON.stringify(this.nativeDialogsInfo),
            selectorTimeout:            this.opts.selectorTimeout,
            canUseDefaultWindowActions: JSON.stringify(await this.browserConnection.canUseDefaultWindowActions())
        });
    }

    async getIframePayloadScript (iframeWithoutSrc) {
        var sharedJs      = this.test.fixture.getSharedJs();
        var payloadScript = Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            sharedJs:               sharedJs,
            takeScreenshotsOnFails: this.opts.takeScreenshotsOnFails,
            skipJsErrors:           this.opts.skipJsErrors,
            nativeDialogsInfo:      JSON.stringify(this.nativeDialogsInfo),
            selectorTimeout:        this.opts.selectorTimeout
        });

        return iframeWithoutSrc ? 'var isIFrameWithoutSrc = true;' + payloadScript : payloadScript;
    }

    async _takeScreenshot (msg) {
        try {
            return await this.screenshotCapturer.captureAction(msg);
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
            return null;
        }
    }

    async _addError (err) {
        var screenshotPath = null;
        var callsite       = err.__sourceIndex !== void 0 &&
                             err.__sourceIndex !== null &&
                             this.test.sourceIndex[err.__sourceIndex];

        try {
            screenshotPath = await this.screenshotCapturer.captureError(err);
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
        }

        var errAdapter = new TestRunErrorFormattableAdapter(err, {
            userAgent:      this.browserConnection.userAgent,
            screenshotPath: screenshotPath,
            callsite:       callsite
        });

        this.errs.push(errAdapter);
    }

    async _fatalError (err) {
        await this._addError(err);
        this.emit('done');
    }

    getAuthCredentials () {
        return this.test.fixture.authCredentials;
    }

    handleFileDownload () {
        this.isFileDownloading = true;
    }

    handlePageError (ctx, errMsg) {
        this._fatalError({
            type:    ERROR_TYPE.pageNotLoaded,
            message: errMsg
        });

        ctx.redirect(this.browserConnection.forcedIdleUrl);
    }

    async start () {
        // NOTE: required to keep API similar to TestRun. Just do nothing here.
        this.emit('start');
    }

    async initialize () {
        // NOTE: required to keep API compatible to the regular TestRun
    }

    // Service message handlers
    // Asynchronous
    [COMMAND.takeScreenshot] (msg) {
        return this._takeScreenshot(msg);
    }

    [COMMAND.fatalError] (msg) {
        return this._fatalError(msg.err);
    }

    [COMMAND.assertionFailed] (msg) {
        return this._addError(msg.err);
    }

    [COMMAND.done] () {
        this.emit('done');
    }

    // Synchronous
    [COMMAND.setStepsSharedData] (msg) {
        this.stepsSharedData = msg.stepsSharedData;
    }

    [COMMAND.getStepsSharedData] () {
        return this.stepsSharedData;
    }

    [COMMAND.getAndUncheckFileDownloadingFlag] () {
        var isFileDownloading = this.isFileDownloading;

        this.isFileDownloading = false;

        return isFileDownloading;
    }

    [COMMAND.waitForFileDownload] () {
        // NOTE: required to keep API similar to TestRun. Just do nothing here.
    }

    [COMMAND.nativeDialogsInfoSet] (msg) {
        if (msg.timeStamp >= this.nativeDialogsInfoTimeStamp) {
            //NOTE: the server can get messages in the wrong sequence if they was sent with a little distance (several milliseconds),
            // we don't take to account old messages
            this.nativeDialogsInfoTimeStamp = msg.timeStamp;
            this.nativeDialogsInfo          = msg.info;
        }
    }
}

for (const handler of ASYNC_SERVICE_MESSAGE_HANDLERS)
    LegacyTestRun.makeBlocking(LegacyTestRun.prototype, handler);
