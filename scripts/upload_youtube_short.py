import json
import os
from pathlib import Path

import requests

VIDEO = Path("public/videos/nova10_short_01_avant_apres.mp4")
TOKEN = os.environ.get("YOUTUBE_ACCESS_TOKEN", "").strip()

if not TOKEN:
    raise SystemExit("Missing GitHub secret YOUTUBE_ACCESS_TOKEN")
if not VIDEO.exists():
    raise SystemExit(f"Missing video file: {VIDEO}")

metadata = {
    "snippet": {
        "title": "Avant / Après : le nettoyage haute pression en 12 secondes #Shorts",
        "description": (
            "Guide NOVA10 : https://square-sunset-9f1a.giniusconcept.workers.dev/"
            "guides/nettoyeur-haute-pression-sans-fil?utm_source=youtube&utm_medium=short&utm_campaign=l0\n\n"
            "Illustration vidéo issue de Pexels. Produit générique. #NOVA10 #nettoyage #Shorts"
        ),
        "categoryId": "22",
        "tags": ["NOVA10", "nettoyage", "haute pression", "Shorts"],
        "defaultLanguage": "fr",
    },
    "status": {
        "privacyStatus": "public",
        "selfDeclaredMadeForKids": False,
        "containsSyntheticMedia": False,
    },
}

size = VIDEO.stat().st_size
headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Length": str(size),
    "X-Upload-Content-Type": "video/mp4",
}

init_url = (
    "https://www.googleapis.com/upload/youtube/v3/videos"
    "?uploadType=resumable&part=snippet,status"
)

r = requests.post(init_url, headers=headers, json=metadata, timeout=60)
if not r.ok:
    raise SystemExit(f"YouTube upload session failed: {r.status_code} {r.text}")

upload_url = r.headers.get("Location")
if not upload_url:
    raise SystemExit("YouTube did not return a resumable upload URL")

with VIDEO.open("rb") as f:
    up = requests.put(
        upload_url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "video/mp4",
            "Content-Length": str(size),
        },
        data=f,
        timeout=300,
    )

if not up.ok:
    raise SystemExit(f"YouTube media upload failed: {up.status_code} {up.text}")

result = up.json()
video_id = result.get("id")
privacy = result.get("status", {}).get("privacyStatus")
if not video_id:
    raise SystemExit(f"Upload returned no video ID: {json.dumps(result, ensure_ascii=False)}")

url = f"https://www.youtube.com/watch?v={video_id}"
print(f"YOUTUBE_VIDEO_ID={video_id}")
print(f"YOUTUBE_URL={url}")
print(f"YOUTUBE_PRIVACY={privacy}")

with open(os.environ.get("GITHUB_OUTPUT", "/tmp/github_output"), "a", encoding="utf-8") as out:
    out.write(f"video_id={video_id}\n")
    out.write(f"video_url={url}\n")
    out.write(f"privacy={privacy}\n")
