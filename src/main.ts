import * as core from '@actions/core';
import * as fs from 'fs';

export default async function run(): Promise<void> {
  try {
    // Get the inputs
    // Limit "app" to this possible strings: 'quarkus', 'angular'
    const app = core.getInput('app', { required: true });
    if (!['quarkus', 'angular'].includes(app)) {
      throw new Error(`Invalid app: ${app}. At this point, only 'quarkus' and 'angular' are supported.`);
    }

    const errorOnUnknown = core.getInput('error-on-unknown') === 'true';

    const newVersion = core.getInput('new-version', { required: true });

    // Get the path to the project
    const path = core.getInput('path');
    // if path is not provided, set a default value, remove trailing slash
    const pathToUse = path ? `${path.replace(/\/$/, '')}/` : '.';

    let version = null;

    // If the app is 'quarkus', get version from pom.xml
    if (app.toLowerCase() === 'quarkus') {
      const pathToPom = `${pathToUse}/pom.xml`;
      if (!fs.existsSync(pathToPom)) {
        const allFiles = fs.readdirSync(pathToUse);
        core.error(`Files in ${pathToUse}: ${allFiles.join('\n')}`);
        throw new Error(`File not found: ${pathToPom}`);
      }
      const pom = fs.readFileSync(pathToPom, 'utf8');
      const regex = /<version>(.*)<\/version>/;
      const match = pom.match(regex);
      if (match) {
        version = match[1];
      } else {
        throw new Error(`Version not found in: ${pathToPom}`);
      }

      // Update the version in the pom.xml
      const newPom = pom.replace(regex, `<version>${newVersion}</version>`);
      fs.writeFileSync(pathToPom, newPom, 'utf8');
    }

    // If the app is 'angular', get version from package.json
    if (app.toLowerCase() === 'angular') {
      const pathToPackage = `${pathToUse}/package.json`;
      if (!fs.existsSync(pathToPackage)) {
        const allFiles = fs.readdirSync(pathToUse);
        core.error(`Files in ${pathToUse}: ${allFiles.join('\n')}`);
        throw new Error(`File not found: ${pathToPackage}`);
      }
      const pkg = fs.readFileSync(pathToPackage, 'utf8');
      const json = JSON.parse(pkg);
      version = json.version;

      // Update the version in the package.json
      json.version = newVersion;
      fs.writeFileSync(pathToPackage, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    }

    if (errorOnUnknown && version === null) {
      core.setFailed(`Version not found in ${app} project.`);
      return;
    }

    // Return "version" as output
    core.setOutput('oldVersion', version);
    core.setOutput('newVersion', newVersion);
    core.info(`Version bumped from ${version} to ${newVersion}.`);
  } catch (error) {
    core.setOutput('version', null);
    if (error instanceof Error) core.setFailed(`Failed get version: ${error.message}`);
  }
}

if (require.main === module) {
  run();
}
