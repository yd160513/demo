import semver from 'semver';
/**
 * TODO: 增加 assert { type: 'json' } 的原因:
 * 1. package.json 设置了 "type": "module", 导致项目是按照 ESModule 的方式加载模块的。
 * 如果不增加 assert { type: 'json' }，那么 import packageJson from '../package.json' 会报错:
 *      TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module "file:///xxx/xxx/xxx/demo/package.json" needs an import attribute of type "json"
 * 提示需要明确的类型断言来确定文件的类型。
 */
import packageJson from '../package.json' assert { type: 'json' };

const requiredVersion = packageJson.engines.node;
const currentVersion = process.version;

console.log('当前 Node.js 版本：', currentVersion);
console.log('要求 Node.js 版本：', requiredVersion);

if (!semver.satisfies(currentVersion, requiredVersion)) {
    console.error(`当前 Node.js 版本为 ${currentVersion}，但此项目要求 Node.js 版本为 ${requiredVersion}。请更新 Node.js 版本。`);
    process.exit(1);
}

console.log('Node.js 版本检查通过。');
