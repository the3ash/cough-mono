import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createReleaseManifest,
  getReleaseStatus,
} from "../scripts/release-metadata.mjs";

test("release manifest describes an immutable published release", () => {
  assert.deepEqual(createReleaseManifest("1.26.1"), {
    schemaVersion: 1,
    version: "1.26.1",
    fontVersion: "1.026",
    tag: "v1.26.1",
    cssUrl: "https://cough-mono.the3ash.com/cough-mono.css",
    glyphsUrl: "https://cough-mono.the3ash.com/glyphs.json",
    archiveUrl:
      "https://github.com/the3ash/cough-mono/releases/download/v1.26.1/CoughMono-1.26.1.zip",
    releaseUrl:
      "https://github.com/the3ash/cough-mono/releases/tag/v1.26.1",
  });
});

test("a release is required only when the package version increases", () => {
  assert.deepEqual(
    getReleaseStatus({
      previousVersion: "1.26.0",
      currentVersion: "1.26.0",
    }),
    { releaseRequired: false, version: "1.26.0", tag: "v1.26.0" },
  );
  assert.deepEqual(
    getReleaseStatus({
      previousVersion: "1.26.0",
      currentVersion: "1.26.1",
    }),
    { releaseRequired: true, version: "1.26.1", tag: "v1.26.1" },
  );
});

test("a manual retry releases the current package version", () => {
  assert.deepEqual(
    getReleaseStatus({
      previousVersion: null,
      currentVersion: "1.26.1",
      force: true,
    }),
    { releaseRequired: true, version: "1.26.1", tag: "v1.26.1" },
  );
});
