const fs = require('fs');
const { exec, spawn } = require('child_process');
const path = require('path');

const packageName = process.argv[2];
const searchTerm = process.argv[3];

process.chdir(path.resolve(__dirname, '..'));

if (!packageName || !searchTerm) {
    console.error('Please provide both a package name and a search term.');
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

fs.readdir(examplesDir, (err, files) => {
    if (err) {
        console.error('Error reading the examples directory:', err);
        return;
    }

    const foundDirs = files.filter(file => {
        const filePath = path.join(examplesDir, file);
        return fs.statSync(filePath).isDirectory() && file.includes(searchTerm);
    });

    if (foundDirs.length === 0) {
        console.error('No matching examples found.');
        process.exit(1);
    } else if (foundDirs.length > 1) {
        console.error('Multiple matches found:', foundDirs.join(', '));
        process.exit(1);
    }

    const examplePath = foundDirs[0];
    const envConfig = {
        env: {
            ...process.env,
            VITE_EXAMPLE_DIR: examplePath
        }
    };

    const child = spawn('npm', ['run', 'dev'], {
        cwd: packageDir,
        env: envConfig.env,
        stdio: 'inherit',
        shell: true
    });

    child.on('exit', (code) => {
        console.log(`Child process exited with code ${code}`);
    });

    child.on('error', (error) => {
        console.error('Failed to start subprocess:', error);
    });
});
