import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = join(process.cwd(), "node_modules", "pg-cloudflare");
if (!existsSync(root)) process.exit(0);

const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });

// Ensure require("./dist/index.js") always resolves for esbuild.
const indexJs = join(dist, "index.js");
writeFileSync(
  indexJs,
  `// patched for OpenNext/esbuild bundling on non-workerd platforms
module.exports = {
  CloudflareSocket: class CloudflareSocket {
    constructor() {
      throw new Error("pg-cloudflare CloudflareSocket is only available in workerd");
    }
  },
};
`,
);

const emptyJs = join(dist, "empty.js");
if (!existsSync(emptyJs)) {
  writeFileSync(emptyJs, "module.exports = {};\n");
}

// Keep package.json main intact
const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.main = "dist/index.js";
if (!pkg.exports) pkg.exports = {};
pkg.exports["."] = {
  workerd: {
    import: "./esm/index.mjs",
    require: "./dist/index.js",
  },
  default: "./dist/index.js",
};
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("patched pg-cloudflare for OpenNext bundling");
