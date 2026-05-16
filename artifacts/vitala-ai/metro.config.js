const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
// Navigate up to the monorepo root (two levels: artifacts/vitala-ai -> artifacts -> root)
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo so Metro can resolve workspace packages
config.watchFolders = [workspaceRoot];

// Resolve modules from both the project and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Ensure Metro resolves symlinked workspace packages correctly
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
