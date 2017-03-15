import * as fs from 'fs';
import * as path from 'path';
import OS from 'os-family';
import stripBom from 'strip-bom';
import { createHash } from 'crypto';
import { resolve as resolveUrl } from 'url';
import Promise from 'pinkie';
import { Compiler as LegacyCompiler, getErrMsg } from './legacy';
import RequireReader from './require-reader';
import promisify from '../utils/promisify';

var readFile = promisify(fs.readFile);

function exists (filePath) {
    return new Promise(resolve => fs.exists(filePath, resolve));
}

const FIXTURE_RE = /(^|;|\s+)('|")@fixture\s+.+?\2/;
const PAGE_RE    = /(^|;|\s+)('|")@page\s+.+?\2/;
const TEST_RE    = /(^|;|\s+)('|")@test\2\s*\[('|").+?\3\]\s*=\s*\{/;

export default class CompilerAdapter {
    constructor (hammerheadProcessScript) {
        this.cache = {
            requires:     {},
            requireJsMap: {},
            sourceIndex:  [],
            configs:      {}
        };

        this.hammerheadProcessScript = hammerheadProcessScript;
        this.requireReader           = new RequireReader(this.cache.requires, this.hammerheadProcessScript);
    }

    static _resolveConfigModules (cfg, dirName) {
        if (cfg.modules) {
            Object.keys(cfg.modules).forEach(name => {
                var mod = cfg.modules[name];

                if (Array.isArray(mod))
                    mod = mod.map(filePath => path.resolve(dirName, filePath));
                else
                    mod = path.resolve(dirName, mod);

                cfg.modules[name] = mod;
            });
        }
    }

    static async _collectDirConfigs (dirName) {
        var cfgs = [];

        var dirHierarchy = dirName
            .split(path.sep)
            .reduce((dirs, chunk) => {
                var dir = null;

                if (dirs.length)
                    dir = path.join(dirs[dirs.length - 1], chunk);
                else if (OS.win)
                    dir = chunk;
                else
                    dir = path.sep + chunk;

                dirs.push(dir);

                return dirs;
            }, []);

        for (var dir of dirHierarchy) {
            var cfgPath  = path.join(dir, 'test_config.json');
            var isExists = await exists(cfgPath);

            if (isExists) {
                var data = await readFile(cfgPath);
                var cfg  = JSON.parse(stripBom(data));

                CompilerAdapter._resolveConfigModules(cfg, dir);
                cfgs.push(cfg);
            }
        }

        return cfgs;
    }

    async _getConfig (filePath) {
        var dirName   = path.dirname(filePath);
        var cfg       = {};
        var cachedCfg = this.cache.configs[dirName];

        if (cachedCfg)
            cfg = cachedCfg;
        else {
            // NOTE: walk up in the directories hierarchy and collect test_config.json files
            var dirConfigs = await CompilerAdapter._collectDirConfigs(dirName);

            cfg = {
                modules: {},
                baseUrl: ''
            };

            dirConfigs.forEach(dirCfg => {
                if (dirCfg.modules) {
                    Object.keys(dirCfg.modules).forEach(name => {
                        cfg.modules[name] = dirCfg.modules[name];
                    });
                }

                if (dirCfg.baseUrl)
                    cfg.baseUrl = resolveUrl(cfg.baseUrl, dirCfg.baseUrl);
            });

            this.cache.configs[dirName] = cfg;
        }

        return cfg;
    }

    _createLegacyCompilerPromise (code, filename, modules) {
        return new Promise((resolve, reject) => {
            var legacyCompiler = new LegacyCompiler(code, filename, modules, this.requireReader, this.cache.sourceIndex, this.hammerheadProcessScript);

            legacyCompiler.compile((errs, out) => {
                if (errs) {
                    var msg = 'There are test compilation errors:\n';

                    msg += errs.map(err => ` * ${getErrMsg(err)}`).join('\n');

                    reject(new Error(msg));
                }
                else
                    resolve(out);
            });
        });
    }

    _createTests (compiled, filePath, baseUrl, requireJsMapKey, remainderJs) {
        var fixture = {
            name:            compiled.fixture,
            path:            filePath,
            pageUrl:         resolveUrl(baseUrl, compiled.page),
            authCredentials: compiled.authCredentials,
            getSharedJs:     () => this.cache.requireJsMap[requireJsMapKey] + remainderJs
        };

        return Object.keys(compiled.testsStepData).map(testName => ({
            name:            testName,
            sourceIndex:     this.cache.sourceIndex,
            stepData:        compiled.testsStepData[testName],
            fixture:         fixture,
            isLegacy:        true,
            pageUrl:         fixture.pageUrl,
            authCredentials: fixture.authCredentials
        }));
    }

    canCompile (code, filename) {
        return /\.test\.js$/.test(filename) &&
               FIXTURE_RE.test(code) &&
               PAGE_RE.test(code) &&
               TEST_RE.test(code);
    }

    async compile (code, filename) {
        var { modules, baseUrl } = await this._getConfig(filename);

        var compiled = await this._createLegacyCompilerPromise(code, filename, modules);

        //NOTE: solve memory overuse issue by storing requireJs in the suite-level hash-based map
        //(see: B237609 - Fixture file compiler memory overuse)
        var hash         = createHash('md5');
        var requireJsMap = this.cache.requireJsMap;
        var remainderJs  = compiled.remainderJs;

        hash.update(compiled.requireJs);

        var requireJsMapKey = hash.digest('hex');

        if (!requireJsMap[requireJsMapKey])
            requireJsMap[requireJsMapKey] = compiled.requireJs;

        return this._createTests(compiled, filename, baseUrl, requireJsMapKey, remainderJs);
    }
}
