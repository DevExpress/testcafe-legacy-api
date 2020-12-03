import util from 'util';
import fs from 'fs';
import stripBom from 'strip-bom';
import { parser as javascriptParser } from '../tools/uglify-js/uglify-js';
import * as ErrCodes from './err_codes';
import promisify from '../../utils/promisify';


var readFile = promisify(fs.readFile);

export function construct (fileName, ownerFilename, callback) {
    readFile(fileName)
        .then(data => {
            data = stripBom(data);

            var constructed = null;

            try {
                constructed = constructFromCode(data, fileName);
            }
            catch(err) {
                callback(err);
                return;
            }

            callback(null, constructed.ast, constructed.preprocessedCode);
        })
        .catch(() => {
            callback({
                type:          ownerFilename ? ErrCodes.FAILED_LOAD_REQUIRE : ErrCodes.READ_FILE_FAILED,
                filename:      fileName,
                ownerFilename: ownerFilename
            });
        });
};

export function constructFromCode (code, fileName) {
    var ast = null;

    code = code.toString().trim();

    //NOTE: perform srcCode preprocessing the same way it's done in the uglify tokenizer, so
    //we'll get correct entities positions for code generator
    code = code.replace(/\r\n?|[\n\u2028\u2029]/g, "\n");

    try {
      ast = javascriptParser.parse(code, false, true);
    } catch (parseErr) {
        throw {
          type: ErrCodes.JAVASCRIPT_PARSING_FAILED,
          filename: fileName,
          parserErr: parseErr
        };
    }

    return {
        ast: ast,
        preprocessedCode: code
    };
};

export function getEntryName (entry) {
    return typeof entry[0] === 'object' ? entry[0].name : entry[0];
};

export function isPathMatch (expectedPath, actualPath, ensureLast) {
    if (expectedPath.length !== actualPath.length - 1)
        return false;

    //NOTE: Check if it is a last entry in the path root
    if (ensureLast && !actualPath[1][0].last)
        return false;

    for (var i = 0; i < expectedPath.length; i++) {
        var hasFlag = util.isArray(expectedPath[i]),
            name = hasFlag ? expectedPath[i][0] : expectedPath[i];

        if (getEntryName(actualPath[i]) !== name || (hasFlag && actualPath[i][1] !== expectedPath[i][1]))
            return false;
    }

    return true;
};

export function getAncestorByName (name, currentAstPath) {
    if (currentAstPath.length > 1) {
        for (var i = currentAstPath.length - 2; i >= 0; i--) {
            if (getEntryName(currentAstPath[i]) === name)
                return currentAstPath[i];
        }
    }

    return null;
};

export function getCurrentSrcLineNum (currentAst) {
    //NOTE: Try to obtain the current line number. currentAst may not contain additional info for unknown reason.
    for (var i = currentAst.length - 1; i >= 0; i--) {
        if (currentAst[i]) {
            if (currentAst[i].start)
                return currentAst[i].start.line;

            if (currentAst[i][0] && currentAst[i][0].start)
                return currentAst[i][0].start.line;
        }
    }

    return 0;
};

export function getRemainderAst (ast) {
    //NOTE: We traverse through statements of the 'toplevel' and
    //just remove those that are marked with 'remove' flag.
    //Everything that's left is a shared code.
    var astBranches = [];

    ast[1].forEach(function (statement) {
        if (!statement[0].remove)
            astBranches.push(statement);
    });

    return astBranches.length ? ['toplevel', astBranches] : null;
};

export function getSrcCodePosFromPath (astPath) {
    return getSrcCodePosFromEntry(astPath[astPath.length - 1]);
};

export function getSrcCodePosFromEntry (astEntry) {
    var pos = {
        start: 0,
        end: 0
    };

    if (astEntry && astEntry[0] && astEntry[0].start) {
        pos.start = astEntry[0].start.pos;
        pos.end = astEntry[0].end.endpos;
    }

    return pos;
};
