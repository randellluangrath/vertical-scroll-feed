// Metro config — required by aws-amplify v6.
// Amplify ships CommonJS (.cjs) entrypoints and uses conditional package
// "exports" that Metro's default resolver mishandles, throwing
// "Component auth has not been configured" / unresolved-module errors at
// runtime. The two settings below are the Amplify-documented fix for Expo.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("cjs");
// Amplify's package "exports" map isn't fully compatible with Metro's
// exports resolution yet; disabling it falls back to main/module fields.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
