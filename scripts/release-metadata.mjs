const CDN_ORIGIN = "https://cough-mono.the3ash.com";
const RELEASES_URL = "https://github.com/the3ash/cough-mono/releases";
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function parseVersion(version) {
  const match = SEMVER_PATTERN.exec(version);
  if (!match) {
    throw new Error(`Invalid package version: ${version}`);
  }

  const [, major, minor, patch] = match;
  return {
    major,
    minor,
    parts: [major, minor, patch].map(Number),
  };
}

export function createReleaseManifest(version) {
  const { major, minor } = parseVersion(version);
  const tag = `v${version}`;

  return {
    schemaVersion: 1,
    version,
    fontVersion: `${major}.${minor.padStart(3, "0")}`,
    tag,
    cssUrl: `${CDN_ORIGIN}/cough-mono.css`,
    glyphsUrl: `${CDN_ORIGIN}/glyphs.json`,
    archiveUrl: `${RELEASES_URL}/download/${tag}/CoughMono-${version}.zip`,
    releaseUrl: `${RELEASES_URL}/tag/${tag}`,
  };
}

export function getReleaseStatus({ previousVersion, currentVersion, force = false }) {
  const current = parseVersion(currentVersion);
  if (force) {
    return {
      releaseRequired: true,
      version: currentVersion,
      tag: `v${currentVersion}`,
    };
  }

  const previous = parseVersion(previousVersion);
  const comparison = current.parts.findIndex(
    (part, index) => part !== previous.parts[index],
  );

  if (
    comparison !== -1 &&
    current.parts[comparison] < previous.parts[comparison]
  ) {
    throw new Error(
      `Package version must increase: ${previousVersion} -> ${currentVersion}`,
    );
  }

  return {
    releaseRequired: comparison !== -1,
    version: currentVersion,
    tag: `v${currentVersion}`,
  };
}
