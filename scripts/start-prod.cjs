const path = require("node:path");
const tsConfigPaths = require("tsconfig-paths");
const tsconfig = require("../tsconfig.json");

const compiledBaseUrl = path.join(__dirname, "..", "dist");
const paths = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([alias, targets]) => [
    alias,
    targets.map((target) =>
      target.replace(/^\.\/src\//, "").replace(/^\.\//, ""),
    ),
  ]),
);

tsConfigPaths.register({
  baseUrl: compiledBaseUrl,
  paths,
});

require("../dist/main.js");
