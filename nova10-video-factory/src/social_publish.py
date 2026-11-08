#!/usr/bin/env python3
"""NOVA10 Video Factory: social publication safety gate and dry-run readiness audit.

No upload is implemented in this version. No social request or social post can be
sent by this program, even if credentials are set. This prevents accidental
publishing while platform approvals / OAuth are pending.
"""
import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PROVIDERS = {
    "youtube": ("YOUTUBE_ACCESS_TOKEN", "YOUTUBE_CHANNEL_ID"),
    "instagram": ("META_ACCESS_TOKEN", "INSTAGRAM_BUSINESS_ID", "PUBLIC_VIDEO_URL"),
    "facebook": ("META_ACCESS_TOKEN", "FACEBOOK_PAGE_ID", "PUBLIC_VIDEO_URL"),
    "tiktok": ("TIKTOK_ACCESS_TOKEN", "TIKTOK_APP_AUDITED"),
}

def safe_public_media_url(value):
    """Reject local/non-HTTPS URLs; platform must be able to fetch video."""
    if not value:
        return False
    try:
        p = urlsplit(value)
        host = p.hostname or ""
        if p.scheme != "https" or p.username or p.password or p.fragment:
            return False
        if host.lower() in {"localhost", "127.0.0.1", "::1"} or host.endswith(".local"):
            return False
        if "." not in host or any(c.isspace() for c in host):
            return False
        return True
    except ValueError:
        return False

def assess(platform, environ):
    if platform not in PROVIDERS:
        raise ValueError("Unsupported platform")
    missing = [key for key in PROVIDERS[platform] if not environ.get(key)]
    if platform == "tiktok" and environ.get("TIKTOK_APP_AUDITED") != "true":
        if "TIKTOK_APP_AUDITED" not in missing:
            missing.append("TIKTOK_APP_AUDITED=true")
    if platform in {"instagram", "facebook"} and not safe_public_media_url(environ.get("PUBLIC_VIDEO_URL", "")):
        if "PUBLIC_VIDEO_URL" not in missing:
            missing.append("PUBLIC_VIDEO_URL_valid_https")
    # Secrets are never printed; only environment variable names.
    return {"platform": platform, "missing_configuration": missing,
            "configuration_complete": not missing,
            "publishing_enabled": False,
            "status": "BLOCKED_PUBLICATION_NOT_IMPLEMENTED"}

def manifest_ok(path):
    if not path.is_file():
        return False, "video_missing"
    if path.suffix.lower() != ".mp4":
        return False, "not_mp4"
    if path.stat().st_size == 0:
        return False, "video_empty"
    if not path.resolve().is_relative_to(ROOT):
        return False, "video_outside_repository"
    return True, "ok"

def run(path=None, environ=None):
    environ = dict(os.environ if environ is None else environ)
    results = [assess(k, environ) for k in PROVIDERS]
    check = None
    if path:
        ok, detail = manifest_ok(path)
        check = {"video_is_valid_input": ok, "reason": detail}
    return {"date_utc": datetime.now(timezone.utc).isoformat(),
            "mode": "DRY_RUN_ONLY",
            "social_requests_sent": 0,
            "posts_published": 0,
            "video_check": check,
            "platforms": results}

if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--video", help="Optional MP4 to verify. Does not upload.")
    args = cli.parse_args()
    report = run(Path(args.video) if args.video else None)
    out = ROOT / "output"
    out.mkdir(exist_ok=True)
    (out / "social_readiness.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
