const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Firebase v10+ requires 'cjs' to be explicitly added
config.resolver.sourceExts.push('cjs');

// 3. CRITICAL: Disable 'exports' field resolution in package.json.
//    Without this, Metro reads Firebase's ESM "exports" map and loads @firebase/component
//    from its ESM bundle, while @firebase/auth loads from its React Native CJS bundle.
//    This causes two separate component registries to exist, causing "auth not registered" errors.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
