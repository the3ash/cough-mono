import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getReleaseStatus } from "./release-metadata.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const force = args.includes("--force");
const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const currentVersion = option("--current") ?? packageJson.version;
let previousVersion = option("--previous");

if (!force && !previousVersion) {
  const before = option("--before");
  if (!before) {
    throw new Error("Provide --before, --previous, or --force");
  }

  const previousPackageJson = JSON.parse(
    execFileSync("git", ["show", `${before}:package.json`], {
      cwd: root,
      encoding: "utf8",
    }),
  );
  previousVersion = previousPackageJson.version;
}

const status = getReleaseStatus({
  previousVersion,
  currentVersion,
  force,
});

console.log(`release_required=${status.releaseRequired}`);
console.log(`version=${status.version}`);
console.log(`tag=${status.tag}`);
