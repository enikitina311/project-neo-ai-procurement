const { execSync } = require('child_process');
const pkg = require('../package.json');

const isReleaseArg = process.argv[2] || "false"; 
const isRelease = isReleaseArg.toLowerCase() === "true";

const version = isRelease ? pkg.version : pkg.version + '-SNAPSHOT';

console.log(`Setting Maven version to ${version} (IsRelease=${isRelease})`);

execSync(`mvn versions:set -DnewVersion=${version} -DgenerateBackupPoms=false`, { stdio: 'inherit' });