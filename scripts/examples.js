const fs = require('fs');
const { exec, spawn } = require('child_process');
const path = require('path');

const packageName = process.argv[2];
// const searchTerm = process.argv[3];

process.chdir(path.resolve(__dirname, '..'));

if (!packageName) {
    console.error('Please provide a package name.');
    process.exit(1);
}

const packageDir = path.join(process.cwd(), 'packages', packageName);
const examplesDir = path.join(packageDir, 'examples');

if (!fs.existsSync(packageDir)) {
    console.error(`The package '${packageName}' does not exist.`);
    process.exit(1);
}

if (!fs.existsSync(examplesDir)) {
    console.error(`No examples directory found in '${packageName}'.`);
    process.exit(1);
}

const child = spawn('npm', ['run', 'examples'], {
    cwd: packageDir,
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
});

child.on('error', (error) => {
    console.error('Failed to start subprocess:', error);
});