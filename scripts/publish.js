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

function versionExists(packageName, version, callback) {
    const npmView = spawn('npm', ['view', `${packageName}@${version}`, 'version']);

    let output = '';
    npmView.stdout.on('data', data => output += data.toString());

    npmView.on('close', code => {
        if (code === 0 && output.trim() === version) {
            callback(true);
        } else {
            callback(false);
        }
    });

    npmView.stderr.on('data', data => {
        console.error(`Error: ${data}`);
    });
}

function publishPackages() {
    const npmPublishArgs = process.argv.slice(2);
    const packageFiles = getAllPackageJsonFiles();
    console.log(packageFiles)

    packageFiles.forEach(file => {
        const dir = path.dirname(file);
        const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));
        const { name: packageName, version } = packageJson;

        versionExists(packageName, version, exists => {
            if (!exists) {
                console.log(`Version ${version} of ${packageName} does not exist. Publishing...`);
                const npmPublish = spawn('npm', ['publish', ...npmPublishArgs], {
                    cwd: dir,
                    stdio: 'inherit',
                    shell: true
                });

                npmPublish.on('close', code => {
                    if (code === 0) {
                        console.log(`Successfully published ${packageName}@${version}`);
                    } else {
                        console.error(`Failed to publish ${packageName}@${version}`);
                    }
                });
            } else {
                console.log(`Version ${version} of ${packageName} already exists. Skipping publish.`);
            }
        });
    });
}

publishPackages();
