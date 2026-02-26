const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const isDryRun = process.argv.includes('--dry-run');

function getWorkspacePackageJsonFiles() {
  const packagesDir = path.join(process.cwd(), 'packages');
  if (!fs.existsSync(packagesDir)) return [];

  return fs
    .readdirSync(packagesDir)
    .filter((entry) => fs.statSync(path.join(packagesDir, entry)).isDirectory())
    .map((entry) => path.join(packagesDir, entry, 'package.json'))
    .filter((filePath) => fs.existsSync(filePath));
}

function versionExistsOnNpm(packageName, version) {
  const result = spawnSync('npm', ['view', `${packageName}@${version}`, 'version'], {
    encoding: 'utf8',
    shell: true
  });

  if (result.status !== 0) return false;
  return result.stdout.trim() === version;
}

function bumpPatch(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}. Expected x.y.z`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]) + 1;
  return `${major}.${minor}.${patch}`;
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function main() {
  const packageFiles = getWorkspacePackageJsonFiles();
  const bumped = [];

  for (const packageFile of packageFiles) {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const { name, version, private: isPrivate } = packageJson;
    const hasBuildScript =
      typeof packageJson.scripts?.build === 'string' && packageJson.scripts.build.trim() !== '';

    if (isPrivate) {
      console.log(`Skipping private package: ${name || packageFile}`);
      continue;
    }

    if (!hasBuildScript) {
      console.log(`Skipping package without build script: ${name || packageFile}`);
      continue;
    }

    if (!name || !version) {
      console.log(`Skipping invalid package.json: ${packageFile}`);
      continue;
    }

    const exists = versionExistsOnNpm(name, version);

    if (!exists) {
      console.log(`Version available for publish: ${name}@${version}`);
      continue;
    }

    const nextVersion = bumpPatch(version);
    console.log(`Bumping ${name}: ${version} -> ${nextVersion}`);
    packageJson.version = nextVersion;

    if (!isDryRun) {
      writeJson(packageFile, packageJson);
    }

    bumped.push({ name, from: version, to: nextVersion, file: packageFile });
  }

  if (bumped.length === 0) {
    console.log('No package versions needed bumping.');
  } else {
    console.log('Version bumps applied:');
    for (const item of bumped) {
      console.log(`- ${item.name}: ${item.from} -> ${item.to}`);
    }
  }
}

main();
