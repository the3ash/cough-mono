import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("CDN build generates a sorted Unicode character catalog", async () => {
  await execFileAsync(process.execPath, ["scripts/build-cdn.mjs"], { cwd: root });

  const glyphs = JSON.parse(
    await readFile(resolve(root, "dist/glyphs.json"), "utf8"),
  );
  const codePoints = glyphs.characters.map((character) =>
    character.codePointAt(0),
  );

  assert.equal(glyphs.count, 161);
  assert.equal(glyphs.count, glyphs.characters.length);
  assert.equal(new Set(glyphs.characters).size, glyphs.characters.length);
  assert.deepEqual(codePoints, codePoints.toSorted((a, b) => a - b));
  assert.equal(glyphs.characters[0], " ");
  assert.ok(glyphs.characters.includes("A"));
  assert.ok(glyphs.characters.includes("0"));
});

test("CDN build publishes the current release manifest", async () => {
  await execFileAsync(process.execPath, ["scripts/build-cdn.mjs"], { cwd: root });

  const packageJson = JSON.parse(
    await readFile(resolve(root, "package.json"), "utf8"),
  );
  const manifest = JSON.parse(
    await readFile(resolve(root, "dist/manifest.json"), "utf8"),
  );

  assert.equal(manifest.version, packageJson.version);
  assert.equal(manifest.tag, `v${packageJson.version}`);
});
