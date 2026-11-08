#!/usr/bin/env python3
"""One-off, PRIVATE, original-media YouTube upload API test.

Separate from commercial uploader; does NOT alter commercial approval gates.
Requires explicit GitHub Action trigger and authorized credentials.
No stored credentials or upload session URLs are logged.
"""
import hashlib,json,os,sys,urllib.parse,urllib.request,urllib.error
from pathlib import Path
def fetch(req):
    try:
        with urllib.request.urlopen(req,timeout=90) as res:
            return res.status,dict(res.headers),res.read(20000)
    except urllib.error.HTTPError as err:
        return err.code,{},err.read(16000)

def error_code(body):
    try:
        data=json.loads(body)
        error=data.get("error",{})
        if isinstance(error,str):return error[:90]
        if isinstance(error,dict):
            reasons=error.get("errors",[])
            if reasons and isinstance(reasons[0],dict):
                return str(reasons[0].get("reason","unknown"))[:90]
            return str(error.get("status","unknown"))[:90]
    except Exception:pass
    return "unclassified"

def main():
    media=Path("nova10-video-factory/output/nova10-private-test.mp4")
    if not media.is_file() or media.stat().st_size<1024:
        print("UPLOAD_STATUS=FAILED_NO_ORIGINAL_TEST_MEDIA");return 2
    required=("YOUTUBE_CLIENT_ID","YOUTUBE_CLIENT_SECRET","YOUTUBE_REFRESH_TOKEN")
    missing=[x for x in required if not os.environ.get(x)]
    if missing:
        print("UPLOAD_STATUS=FAILED_MISSING_SECRETS")
        print("MISSING_SECRET_NAMES="+",".join(missing));return 2
    # OAuth refresh
    payload=urllib.parse.urlencode({
        "client_id":os.environ["YOUTUBE_CLIENT_ID"],
        "client_secret":os.environ["YOUTUBE_CLIENT_SECRET"],
        "refresh_token":os.environ["YOUTUBE_REFRESH_TOKEN"],
        "grant_type":"refresh_token"}).encode()
    code,_,body=fetch(urllib.request.Request("https://oauth2.googleapis.com/token",
        data=payload,headers={"Content-Type":"application/x-www-form-urlencoded"},method="POST"))
    if code!=200:
        print("OAUTH_HTTP="+str(code))
        print("OAUTH_ERROR_CODE="+error_code(body))
        return 1
    token=json.loads(body)["access_token"]
    print("OAUTH_REFRESH=SUCCESS")
    # Upload original branded synthetic test media as private; never public/unlisted.
    title="NOVA10 - TEST PRIVE "+os.environ.get("NOVA10_TEST_VARIANT","X")+" - "+os.environ.get("GITHUB_RUN_ID","")
    data=json.dumps({
        "snippet":{"title":title,
                   "description":"Test technique prive "+os.environ.get("NOVA10_TEST_VARIANT","X")+" du systeme NOVA10 VIDEO FACTORY. Video originale creee automatiquement. Aucune demonstration produit. Ne pas diffuser.",
                   "categoryId":"22"},
        "status":{"privacyStatus":"private","selfDeclaredMadeForKids":False}
    }).encode()
    init=urllib.request.Request(
        "https://www.googleapis.com/upload/youtube/v3/videos?"+urllib.parse.urlencode({"uploadType":"resumable","part":"snippet,status"}),
        data=data,method="POST",
        headers={"Authorization":"Bearer "+token,"Content-Type":"application/json; charset=UTF-8",
                 "X-Upload-Content-Type":"video/mp4",
                 "X-Upload-Content-Length":str(media.stat().st_size)})
    code,headers,body=fetch(init)
    if code not in (200,201):
        print("UPLOAD_INIT_HTTP="+str(code))
        print("UPLOAD_INIT_ERROR="+error_code(body))
        return 1
    session=headers.get("Location")
    if not session or not session.startswith("https://"):
        print("UPLOAD_STATUS=FAILED_NO_SESSION")
        return 1
    # A tiny original test clip, loaded only after OAuth and session approval.
    media_bytes=media.read_bytes()
    upload_req=urllib.request.Request(session,data=media_bytes,method="PUT",
        headers={"Content-Type":"video/mp4","Content-Length":str(len(media_bytes))})
    code,_,body=fetch(upload_req)
    if code not in (200,201):
        print("UPLOAD_FINAL_HTTP="+str(code))
        print("UPLOAD_FINAL_ERROR="+error_code(body))
        return 1
    response=json.loads(body)
    vid=response.get("id")
    actual_privacy=response.get("status",{}).get("privacyStatus")
    if not vid or actual_privacy!="private":
        print("UPLOAD_STATUS=UNCONFIRMED_PRIVACY")
        print("REPORTED_PRIVACY="+str(actual_privacy))
        return 1
    print("UPLOAD_STATUS=SUCCESS")
    print("VIDEO_PRIVACY=private")
    print("VIDEO_ID="+vid)
    print("VIDEO_URL=https://www.youtube.com/watch?v="+vid)
    print("SOURCE=ORIGINAL_SYNTHETIC_TEST")
    print("MEDIA_SHA256="+hashlib.sha256(media_bytes).hexdigest())
    return 0

if __name__=="__main__":sys.exit(main())
