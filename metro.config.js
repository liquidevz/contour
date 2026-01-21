const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .cjs extension support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Enable package exports to properly resolve rxjs modules
config.resolver.unstable_enablePackageExports = true;

// Custom resolver to handle rxjs module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // For rxjs internal modules, redirect to dist/cjs path
    if (moduleName.includes('rxjs/dist/esm5/internal') || moduleName.includes('rxjs/dist/esm/internal')) {
        // Convert ESM path to CJS
        const cjsModuleName = moduleName
            .replace(/rxjs\/dist\/esm5\/internal/, 'rxjs/dist/cjs/internal')
            .replace(/rxjs\/dist\/esm\/internal/, 'rxjs/dist/cjs/internal');

        try {
            return context.resolveRequest(context, cjsModuleName, platform);
        } catch (e) {
            // If CJS resolution fails, fall back to default
        }
    }

    // Use default resolver for everything else
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
