import { escape as escapeHtml, assignIn, find } from 'lodash';
import highlight from 'highlight-es';
import { Parser } from 'parse5';
import TEMPLATES from './templates';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

var renderer = ['string', 'punctuator', 'keyword', 'number', 'regex', 'comment', 'invalid'].reduce((syntaxRenderer, tokenType) => {
    syntaxRenderer[tokenType] = str => `<span class="syntax-${tokenType}">${escapeHtml(str)}</span>`;

    return syntaxRenderer;
}, {});

var parser = new Parser();

export default class TestRunErrorFormattableAdapter {
    constructor (err, metaInfo) {
        this.TEMPLATES = TEMPLATES;

        this.userAgent      = metaInfo.userAgent;
        this.screenshotPath = metaInfo.screenshotPath;
        this.testRunState   = metaInfo.testRunState;

        assignIn(this, err);

        this.callsite = this.callsite || metaInfo.callsite;
    }

    static _getSelector (node) {
        var classAttr = find(node.attrs, { name: 'class' });
        var cls       = classAttr && classAttr.value;

        return cls ? `${node.tagName} ${cls}` : node.tagName;
    }

    static _decorateHtml (node, decorator) {
        var msg = '';

        if (node.nodeName === '#text')
            msg = node.value;
        else {
            if (node.childNodes.length) {
                msg += node.childNodes
                    .map(childNode => TestRunErrorFormattableAdapter._decorateHtml(childNode, decorator))
                    .join('');
            }

            if (node.nodeName !== '#document-fragment') {
                var selector = TestRunErrorFormattableAdapter._getSelector(node);

                msg = decorator[selector](msg, node.attrs);
            }
        }

        return msg;
    }

    getErrorMarkup (viewportWidth) {
        return this.TEMPLATES[this.type](this, viewportWidth);
    }

    getCallsiteMarkup () {
        if (!this.callsite)
            return null;

        var code     = highlight(this.callsite, renderer);
        var lines    = code.split(NEWLINE);
        var lastLine = lines.pop();

        lastLine = `<div class="code-line-last">${lastLine}</div>`;
        lines    = lines.map(line => `<div class="code-line"><div class="code-line-src">${line}</div></div>`);

        return `<div class="code-frame">${lines.join('')}${lastLine}</div>`;
    }

    formatMessage (decorator, viewportWidth) {
        var msgHtml  = this.getErrorMarkup(viewportWidth);
        var fragment = parser.parseFragment(msgHtml);

        return TestRunErrorFormattableAdapter._decorateHtml(fragment, decorator);
    }
}
