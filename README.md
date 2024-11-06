# easyware-io/bump-version@v1

![CI](https://github.com/easyware-io/bump-version/actions/workflows/build.yml/badge.svg)

Bumps version of an app.

## Usage

### Basic usage

```yaml
- name: Get version of app
  uses: easyware-io/get-version@v1
  with:
    app: angular || quarkus
    new-version: <new version for the app>
```

### Parameters

#### `app`

Valid values are `angular` and `quarkus`.

#### `new-version`

New version to be defined in either pom.xml or package.json

#### `path`

Optional. Path of file to read in case of not root directory. Default is `./`

#### `error-on-unknown`

Optional. If true, throws error if version is not found. Default is false.

### Outputs

#### `oldVersion`

String containing the old app version number. If not found, returns `null`.

#### `newVersion`

String containing the new app version number.
