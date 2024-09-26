const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// 定义多个版本的配置
const versions = [
    { name: 'demo-v1', version: '0.0.1', appId: 'com.demo.app.v1' },
    { name: 'demo-v2', version: '0.0.2', appId: 'com.demo.app.v2' },
    // 可以继续添加更多版本
];

// 读取 package.json 文件
const packageJsonPath = path.resolve(__dirname, './../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// 备份原始的 package.json 内容
const originalPackageJson = JSON.stringify({ ...packageJson }, null, 2);

// 执行 clean 命令
execSync('npm run clean', { stdio: 'inherit' });

versions.forEach((config) => {
    // 修改 package.json 中的字段
    packageJson.name = config.name;
    packageJson.version = config.version;
    packageJson.build.appId = config.appId;
    packageJson.build.directories.output = `dist/pc/${config.name}-v${config.version}`;

    // 写回 package.json 文件
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');

    // 执行打包命令
    try {
        execSync('npm run build:pc', { stdio: 'inherit' });
    } catch (error) {
        console.error(`打包 ${config.name} 失败:`, error);
    }
});

// 恢复原始的 package.json 内容
fs.writeFileSync(packageJsonPath, originalPackageJson, 'utf-8');