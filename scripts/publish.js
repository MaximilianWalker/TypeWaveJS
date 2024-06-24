const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getAllPackageJsonFiles() {
    const baseDir = './packages';
    return fs.readdirSync(baseDir)
        .filter(file => fs.statSync(path.join(baseDir, file)).isDirectory())
        .map(dir => path.join(baseDir, dir, 'package.json'))
        .filter(file => fs.existsSync(file));
}

function versionExists(packageName, version) {
    return new Promise((resolve, reject) => {
        const npmView = spawn('npm', ['view', `${packageName}@${version}`, 'version'], {
            shell: true
        });

        let output = '';
        npmView.stdout.on('data', data => output += data.toString());

        npmView.on('close', code => {
            if (code === 0 && output.trim() === version) {
                resolve(true);
            } else {
                resolve(false);
            }
        });

        npmView.on('error', reject);
    });
}

function publishPackage(dir, packageName, version, npmPublishArgs) {
    return new Promise((resolve, reject) => {
        const npmPublish = spawn('npm', ['publish', ...npmPublishArgs], {
            cwd: dir,
            stdio: 'inherit',
            shell: true
        });

        npmPublish.on('close', code => {
            if (code === 0) {
                console.log(`Successfully published ${packageName}@${version}`);
                resolve();
            } else {
                console.error(`Failed to publish ${packageName}@${version}`);
                reject(new Error('Publish failed'));
            }
        });

        npmPublish.on('error', reject);
    });
}

async function publishPackages() {
    const npmPublishArgs = process.argv.slice(2);
    const packageFiles = getAllPackageJsonFiles();

    for (const file of packageFiles) {
        const dir = path.dirname(file);
        const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));
        const { name: packageName, version } = packageJson;

        try {
            const exists = await versionExists(packageName, version);
            if (!exists) {
                console.log(`Version ${version} of ${packageName} does not exist. Publishing...`);
                await publishPackage(dir, packageName, version, npmPublishArgs);
            } else {
                console.log(`Version ${version} of ${packageName} already exists. Skipping publish.`);
            }
        } catch (error) {
            console.error(`An error occurred while checking or publishing ${packageName}@${version}: ${error}`);
        }
    }
}

publishPackages();
