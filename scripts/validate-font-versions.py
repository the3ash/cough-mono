#!/usr/bin/env python3

import argparse
import re
from pathlib import Path

from fontTools.ttLib import TTFont


FONT_PATHS = (
    Path("fonts/CoughMono-Regular.otf"),
    Path("fonts/CoughMono-Regular.ttf"),
    Path("fonts/CoughMono-Regular.woff2"),
)


def expected_font_version(package_version: str) -> str:
    match = re.fullmatch(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)", package_version)
    if not match:
        raise ValueError(f"Invalid npm version: {package_version}")
    major, minor, _patch = (int(part) for part in match.groups())
    return f"{major}.{minor:03d}"


def validate_font(path: Path, expected_version: str) -> None:
    with TTFont(path, lazy=True) as font:
        revision = font["head"].fontRevision
        expected_revision = float(expected_version)
        if abs(revision - expected_revision) > 1 / 65536:
            raise ValueError(
                f"{path}: head.fontRevision is {revision:g}, expected {expected_version}"
            )

        expected_name = f"Version {expected_version}"
        version_names = {
            record.toUnicode() for record in font["name"].names if record.nameID == 5
        }
        if version_names != {expected_name}:
            raise ValueError(
                f"{path}: nameID 5 values are {sorted(version_names)!r}, "
                f"expected only {expected_name!r}"
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("package_version")
    args = parser.parse_args()

    font_version = expected_font_version(args.package_version)
    for path in FONT_PATHS:
        validate_font(path, font_version)
        print(f"{path}: Version {font_version}")


if __name__ == "__main__":
    main()
