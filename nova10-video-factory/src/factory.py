#!/usr/bin/env python3
"""NOVA10 Video Factory: free offline vertical video renderer; no automatic social posting."""
import argparse, hashlib, json, re, shutil, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output"

def tracking(url, platform):
    if not url.startswith("https://"):
        return ""
    u=urlparse(url)
    q=dict(parse_qsl(u.query))
    q.update(utm_source=platform,utm_medium="organic_social",utm_campaign="nova10_video_factory")
    return urlunparse(u._replace(query=urlencode(q)))

def validate(p):
    for key in ("id","title"):
        if not isinstance(p.get(key),str) or not p[key].strip():
            raise ValueError("Missing "+key)
    if not re.fullmatch(r"[a-zA-Z0-9_-]+",p["id"]):
        raise ValueError("Unsafe product ID")
    if p.get("media") and not p.get("approved_media"):
        raise ValueError("Product media has not been approved for commercial reuse")
    if p.get("media") and not (ROOT/p["media"]).resolve().is_relative_to(ROOT):
        raise ValueError("Media must be inside the project")
    return p

def render(p, demo):
    media=ROOT/p["media"] if p.get("media") else None
    approved=bool(media and media.is_file() and p.get("approved_media"))
    if not approved and not demo:
        raise ValueError("Approved real product media missing; use --demo for a labeled test")
    OUT.mkdir(parents=True,exist_ok=True)
    dest=OUT/(p["id"]+".mp4")
    font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    if not Path(font).exists():
        raise RuntimeError("DejaVu font is required")
    titles=["NOVA10 DEMO" if not approved else "NOVA10",p["title"],"Découvrez notre sélection","Voir la fiche produit"]
    yvals=[430,550,720,860]
    vf="scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=25" if approved else "format=yuv420p"
    vf+=",drawbox=x=32:y=390:w=656:h=570:color=black@0.75:t=fill"
    textfiles=[]
    for i,title in enumerate(titles):
        f=OUT/("title_"+str(i)+".txt")
        f.write_text(re.sub(r"\s+"," ",title)[:34],encoding="utf-8")
        textfiles.append(f)
        vf+=",drawtext=fontfile="+font+":textfile="+str(f)+":fontsize=38:fontcolor=white:x=(w-text_w)/2:y="+str(yvals[i])
    if approved:
        inputs=["-stream_loop","-1","-i",str(media)]
    else:
        inputs=["-f","lavfi","-i","color=c=0x071b33:s=720x1280:r=25"]
    cmd=["ffmpeg","-y","-hide_banner","-loglevel","error",*inputs,"-t","12","-vf",vf,"-an","-c:v","libx264","-preset","ultrafast","-crf","30","-pix_fmt","yuv420p",str(dest)]
    try:
        done=subprocess.run(cmd,capture_output=True,text=True)
        if done.returncode:
            raise RuntimeError(done.stderr[-2000:])
    finally:
        for f in textfiles:
            f.unlink(missing_ok=True)
    return {"file":dest.name,"sha256":hashlib.sha256(dest.read_bytes()).hexdigest(),"bytes":dest.stat().st_size,"demo":not approved,"links":{k:tracking(p.get("url",""),k) for k in ("youtube","instagram","tiktok")}}

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--demo",action="store_true")
    opt=a.parse_args()
    OUT.mkdir(exist_ok=True)
    audit={"utc":datetime.now(timezone.utc).isoformat(),"status":"failed","publishing":"DISABLED","videos":[]}
    try:
        config=json.loads((ROOT/"config/products.json").read_text(encoding="utf-8"))
        for p in config["products"]:
            validate(p)
            video=render(p,opt.demo)
            video["product_id"]=p["id"]
            audit["videos"].append(video)
        audit["status"]="rendered"
        print(json.dumps(audit,ensure_ascii=False,indent=2))
    except Exception as exc:
        audit["error"]=str(exc)
        print(str(exc),file=sys.stderr)
        raise
    finally:
        (OUT/"audit.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding="utf-8")
if __name__=="__main__":
    main()
