#!/usr/bin/env python3
"""Read-only live OAuth check: refresh Google OAuth access token; query YouTube channels.list.

No upload, no video mutation. Never prints credentials, access tokens,
refresh tokens or response bodies containing credentials.
"""
import json,os,sys,urllib.parse,urllib.request,urllib.error
REQUIRED=("YOUTUBE_CLIENT_ID","YOUTUBE_CLIENT_SECRET","YOUTUBE_REFRESH_TOKEN")
def request_json(url, data=None, bearer=None):
    headers={"Accept":"application/json","User-Agent":"NOVA10-YouTube-readonly-check"}
    if bearer:headers["Authorization"]="Bearer "+bearer
    if data is not None:
        headers["Content-Type"]="application/x-www-form-urlencoded"
        data=urllib.parse.urlencode(data).encode()
    req=urllib.request.Request(url,data=data,headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=25) as r:
            return r.status,json.loads(r.read(30000))
    except urllib.error.HTTPError as e:
        # never emit error body, which could include potentially sensitive data
        try:
            body=json.loads(e.read(6000))
            error_code=body.get("error","")
            error_code=error_code if error_code in {"invalid_client","invalid_grant","unauthorized_client","invalid_request","access_denied"} else "other_error"
        except Exception:
            error_code="unparsed_error"
        return e.code,{"safe_error_code":error_code}
def main():
    missing=[k for k in REQUIRED if not os.environ.get(k)]
    if missing:
        print("AUTH_STATUS=BLOCKED_MISSING_SECRETS")
        print("MISSING_NAMES="+",".join(missing))
        return 2
    status,result=request_json("https://oauth2.googleapis.com/token",{
        "client_id":os.environ["YOUTUBE_CLIENT_ID"],
        "client_secret":os.environ["YOUTUBE_CLIENT_SECRET"],
        "refresh_token":os.environ["YOUTUBE_REFRESH_TOKEN"],
        "grant_type":"refresh_token"})
    token=result.get("access_token")
    if status!=200 or not token:
        print("AUTH_STATUS=FAILED")
        print("TOKEN_ENDPOINT_HTTP="+str(status))
        print("GOOGLE_ERROR_CODE="+str(result.get("safe_error_code","unknown")))
        print("NO_UPLOAD_PERFORMED=true")
        return 1
    print("AUTH_STATUS=SUCCESS")
    print("ACCESS_TOKEN_RECEIVED=true")
    scope=result.get("scope","")
    print("SCOPE_YOUTUBE_UPLOAD="+str("https://www.googleapis.com/auth/youtube.upload" in scope.split() if scope else "NOT_RETURNED"))
    # Read-only channel identity check. Scope youtube.upload may not permit channels.list.
    code,response=request_json("https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true",bearer=token)
    print("CHANNEL_ENDPOINT_HTTP="+str(code))
    if code==200 and response.get("items"):
        for item in response["items"][:3]:
            snippet=item.get("snippet",{})
            print("CHANNEL_ID="+str(item.get("id","")))
            print("CHANNEL_TITLE="+str(snippet.get("title","")).replace("\n"," "))
        print("CHANNEL_CHECK=SUCCESS")
    else:
        print("CHANNEL_CHECK=UNCONFIRMED")
        print("CHANNEL_CHECK_NOTE=Upload-only OAuth scope may not permit channels.list; no upload attempted")
    print("NO_UPLOAD_PERFORMED=true")
    return 0
if __name__=="__main__":sys.exit(main())
