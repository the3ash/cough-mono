import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("release check emits GitHub Actions outputs", async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    [
      "scripts/check-release.mjs",
      "--previous",
      "1.26.0",
      "--current",
      "1.26.1",
    ],
    { cwd: root },
  );

  assert.equal(
    stdout,
    "release_required=true\nversion=1.26.1\ntag=v1.26.1\n",
  );
});
