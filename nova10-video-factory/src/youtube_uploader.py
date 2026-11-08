#!/usr/bin/env python3
"""NOVA10 official YouTube API uploader with strict preview/publication guardrails.

Modes:
 - default: local/offline validation only, no Google credentials required
 - --execute: requires THREE explicit approvals, approved source media and OAuth
No publishing is scheduled. Uploads default to PRIVATE. Does not access any
other social platform. Client credentials are read only from environment.
"""
import argparse
import hashlib
import json
import os
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output"
VALID_PRIVACY={"private","unlisted","public"}
REQUIRED_OAUTH=("YOUTUBE_CLIENT_ID","YOUTUBE_CLIENT_SECRET","YOUTUBE_REFRESH_TOKEN")
SCOPE="https://www.googleapis.com/auth/youtube.upload"

def validate_manifest(data,media,privacy):
    if privacy not in VALID_PRIVACY:
        raise ValueError("invalid privacy")
    if not isinstance(data,dict):
        raise ValueError("manifest must be JSON object")
    for k in ("product_id","title","description"):
        if not isinstance(data.get(k),str) or not data[k].strip():
            raise ValueError("missing manifest field "+k)
    if data.get("product_status")!="ACTIVE":
        raise ValueError("product not ACTIVE on Shopify")
    if data.get("rights_approved") is not True:
        raise ValueError("commercial media rights not approved")
    if data.get("content_approved") is not True:
        raise ValueError("content not approved")
    if data.get("source_type")!="authentic_product_video":
        raise ValueError("authentic approved product video required")
    if data.get("internal_preview") or data.get("demo"):
        raise ValueError("internal previews are not publishable")
    if not media.is_file() or media.suffix.lower()!=".mp4" or media.stat().st_size<1024:
        raise ValueError("valid MP4 missing")
    if not media.resolve().is_relative_to(ROOT):
        raise ValueError("media must be within video factory directory")
    if len(data["title"])>100:
        raise ValueError("YouTube title exceeds 100 characters")
    return {"file_sha256":hashlib.sha256(media.read_bytes()).hexdigest(),
            "media_bytes":media.stat().st_size,"title":data["title"],"privacy":privacy}

def youtube_service(environ):
    # Deferred import: offline tests do not install or require Google API clients.
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    credentials=Credentials(
        token=None,refresh_token=environ["YOUTUBE_REFRESH_TOKEN"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=environ["YOUTUBE_CLIENT_ID"],
        client_secret=environ["YOUTUBE_CLIENT_SECRET"],
        scopes=[SCOPE])
    credentials.refresh(Request())
    return build("youtube","v3",credentials=credentials,cache_discovery=False)

def upload(service,media,manifest,privacy):
    from googleapiclient.http import MediaFileUpload
    request=service.videos().insert(
        part="snippet,status",
        body={"snippet":{"title":manifest["title"],
                          "description":manifest["description"],
                          "categoryId":"22"},
              "status":{"privacyStatus":privacy,
                        "selfDeclaredMadeForKids":False}},
        media_body=MediaFileUpload(str(media),mimetype="video/mp4",
                                   chunksize=1024*1024,resumable=True))
    response=None
    while response is None:
        _progress,response=request.next_chunk()
    video_id=response.get("id")
    if not isinstance(video_id,str) or not video_id:
        raise RuntimeError("YouTube upload finished without video id")
    return video_id

def execute(manifest_path,media,privacy,environ=None,do_upload=False,service_factory=None):
    environ=dict(os.environ if environ is None else environ)
    manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
    checked=validate_manifest(manifest,media,privacy)
    if not do_upload:
        return {"mode":"DRY_RUN","uploads":0,**checked}
    if (environ.get("ENABLE_YOUTUBE_UPLOAD")!="true" or
        environ.get("YOUTUBE_UPLOAD_APPROVED")!="true" or
        manifest.get("youtube_upload_approved") is not True):
        raise ValueError("YouTube upload requires explicit environment and manifest approvals")
    missing=[key for key in REQUIRED_OAUTH if not environ.get(key)]
    if missing:
        raise ValueError("OAuth secrets missing: "+", ".join(missing))
    service=service_factory(environ) if service_factory else youtube_service(environ)
    video_id=upload(service,media,manifest,privacy)
    return {"mode":"UPLOADED","uploads":1,"video_id":video_id,
            "url":"https://www.youtube.com/watch?v="+video_id,
            "timestamp_utc":datetime.now(timezone.utc).isoformat(),**checked}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--manifest",required=True,type=Path)
    p.add_argument("--media",required=True,type=Path)
    p.add_argument("--privacy",choices=sorted(VALID_PRIVACY),default="private")
    p.add_argument("--execute",action="store_true",help="Actual upload; requires all approval gates and OAuth")
    args=p.parse_args()
    OUT.mkdir(exist_ok=True)
    audit={"mode":"FAILED","uploads":0}
    try:
        audit=execute(args.manifest,args.media,args.privacy,do_upload=args.execute)
        print(json.dumps(audit,ensure_ascii=False,indent=2))
    except Exception as exc:
        audit["error_type"]=type(exc).__name__
        audit["error"]=str(exc)
        raise
    finally:
        (OUT/"youtube_upload_audit.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

if __name__=="__main__":
    main()
