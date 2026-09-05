#!/usr/bin/env python3
"""Replay a component's synthetic git history.

Not a bank artefact. Estate construction tooling.

The estate has to look like five years of work by many teams. Rather than committing each
component in one lump, a component is built to its final state and then its history is replayed:
this script walks a manifest of commits, checks out or writes the file state each commit describes,
and commits it with a chosen author, date and message.

Two manifest styles are supported.

`paths` commits — the ordinary case. Each entry names the paths that commit should introduce or
touch. Paths are staged from the working tree as it exists now, which means the component must
already be finished on disk before the replay runs. Files that a later commit modifies can be given
an explicit `content` or a `patch` (a list of [find, replace] pairs applied to the file that will
be committed).

`empty` commits — merges, reverts, formatting sweeps and bumps that need to appear in the log
without a file state of their own. They record `--allow-empty`.

Usage:

    replay_history.py --manifest canopy-ui/.history/manifest.json --component canopy-ui

The manifest is a JSON object:

    {
      "component": "canopy-ui",
      "commits": [
        {"date": "2021-03-08T10:14:00", "author": "l.fontaine",
         "message": "CNPY-12 scaffold the Canopy workspace",
         "paths": ["canopy-ui/angular.json", "canopy-ui/package.json"]},
        {"date": "2021-03-09T16:02:00", "author": "h.eriksen",
         "message": "CNPY-19 add the brand palette", "paths": ["canopy-ui/projects/.../tokens"]},
        {"date": "2021-03-12T09:00:00", "author": "l.fontaine", "empty": true,
         "message": "Merge release/2021.03 into main for train 2021.03.2"}
      ]
    }

Every path is relative to the workspace root. A commit whose paths are all already committed and
unchanged is recorded as an empty commit so the log volume still matches the manifest.
"""

from __future__ import annotations

import argparse
import json
import random
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AUTHORS = json.loads((Path(__file__).resolve().parent / "authors.json").read_text())

BY_HANDLE = {e["handle"]: e for e in AUTHORS["engineers"] + AUTHORS["bots"]}
SITES = AUTHORS["sites"]
DOMAIN = AUTHORS["email_domain"]


def git(*args: str, env: dict[str, str] | None = None) -> str:
    result = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True,
                            env=env)
    if result.returncode != 0:
        raise SystemExit("git {} failed:\n{}".format(" ".join(args), result.stderr.strip()))
    return result.stdout.strip()


def identity(handle: str) -> tuple[str, str, str]:
    person = BY_HANDLE.get(handle)
    if person is None:
        raise SystemExit("unknown author handle: {}".format(handle))
    email = "{}@{}".format(handle, DOMAIN)
    return person["name"], email, person["site"]


def stamp(date_str: str, site: str, rng: random.Random) -> str:
    """Turn a manifest date into a git timestamp inside the author's working hours."""
    site_conf = SITES[site]
    when = datetime.fromisoformat(date_str)
    if when.hour == 0 and when.minute == 0:
        low, high = site_conf["hours"]
        when += timedelta(hours=rng.randint(low, high - 1), minutes=rng.randint(0, 59))
    return "{} {}".format(when.strftime("%Y-%m-%dT%H:%M:%S"), site_conf["tz_offset"])


def apply_content(commit: dict) -> None:
    for rel, content in (commit.get("content") or {}).items():
        target = ROOT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
    for rel, pairs in (commit.get("patch") or {}).items():
        target = ROOT / rel
        text = target.read_text(encoding="utf-8")
        for find, replace in pairs:
            if find not in text:
                raise SystemExit("patch target not found in {}: {!r}".format(rel, find))
            text = text.replace(find, replace, 1)
        target.write_text(text, encoding="utf-8")


def stage(commit: dict) -> bool:
    paths = commit.get("paths") or []
    if not paths:
        return False
    existing = [p for p in paths if (ROOT / p).exists()]
    if not existing:
        return False
    git("add", "--", *existing)
    staged = git("diff", "--cached", "--name-only")
    return bool(staged)


def replay(manifest_path: Path, dry_run: bool, seed: int) -> None:
    manifest = json.loads(manifest_path.read_text())
    rng = random.Random(seed)
    commits = manifest["commits"]
    print("replaying {} commits for {}".format(len(commits), manifest.get("component", "?")))

    for index, commit in enumerate(commits, start=1):
        name, email, site = identity(commit["author"])
        when = stamp(commit["date"], site, rng)
        message = commit["message"]
        if dry_run:
            print("{:4d} {} {:<22} {}".format(index, when[:10], commit["author"], message))
            continue

        apply_content(commit)
        has_changes = stage(commit)

        env = {
            "GIT_AUTHOR_NAME": name, "GIT_AUTHOR_EMAIL": email, "GIT_AUTHOR_DATE": when,
            "GIT_COMMITTER_NAME": name, "GIT_COMMITTER_EMAIL": email, "GIT_COMMITTER_DATE": when,
            "PATH": __import__("os").environ["PATH"],
            "HOME": __import__("os").environ["HOME"],
        }
        args = ["commit", "--no-verify", "-m", message]
        if commit.get("body"):
            args += ["-m", commit["body"]]
        if not has_changes:
            args.append("--allow-empty")
        git(*args, env=env)

    if not dry_run:
        print("done, HEAD is now {}".format(git("rev-parse", "--short", "HEAD")))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--seed", type=int, default=20260905)
    args = parser.parse_args()
    path = Path(args.manifest)
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        raise SystemExit("manifest not found: {}".format(path))
    replay(path, args.dry_run, args.seed)


if __name__ == "__main__":
    main()
