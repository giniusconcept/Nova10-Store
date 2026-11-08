#!/usr/bin/env python3
"""NOVA10 factual image-to-video preview: never publishes; watermarked INTERNAL PREVIEW.

Downloads only an exact allowlisted Shopify CDN image and generates a 9:16 silent MP4.
Supplier license remains unverified; use solely for internal review.
"""
import hashlib
import ipaddress
import json
import subprocess
import sys
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import urlopen,Request
from PIL import Image,ImageOps,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output"
CONFIG=ROOT/"config/shopify_preview.json"

def safe_url(url):
    p=urlsplit(url)
    if p.scheme!="https" or p.hostname!="cdn.shopify.com" or p.username or p.password or p.port or not p.path.startswith("/s/files/"):
        raise ValueError("Only Shopify CDN images are permitted")
    return url

def read_image(url):
    safe_url(url)
    request=Request(url,headers={"User-Agent":"NOVA10VideoFactory/1.0"})
    with urlopen(request,timeout=25) as response:
        if urlsplit(response.geturl()).hostname!="cdn.shopify.com":
            raise ValueError("Redirect outside Shopify CDN")
        raw=response.read(10_000_001)
        if len(raw)>10_000_000: raise ValueError("Image exceeds 10 MB")
    media=OUT/"shopify_source.jpg"
    media.write_bytes(raw)
    with Image.open(media) as im:
        im.verify()
    with Image.open(media) as im:
        return ImageOps.exif_transpose(im.convert("RGB"))

def txt(d,x,y,label,size=41,color="#FFFFFF",max_width=980):
    font_path="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    font=ImageFont.truetype(font_path,size)
    # Wrap by measured text length.
    lines=[];line=""
    for word in label.split():
        proposed=(line+" "+word).strip()
        if d.textbbox((0,0),proposed,font=font)[2]>max_width and line:
            lines.append(line);line=word
        else:line=proposed
    if line: lines.append(line)
    for part in lines:
        d.text((x,y),part,font=font,fill=color,stroke_width=1,stroke_fill="#071225")
        y+=size+14
    return y

def generate(config):
    if config.get("rights_approved") is not False or config.get("draft") is not True or config.get("product_status")!="DRAFT":
        raise ValueError("Internal preview mode requires explicit rights_approved=false and DRAFT status")
    OUT.mkdir(parents=True,exist_ok=True)
    photo=read_image(config["image_url"])
    W,H=720,1280
    canvas=Image.new("RGB",(W,H),"#071b33")
    # Product image is letterboxed, not distorted.
    tile=ImageOps.contain(photo,(650,630),Image.Resampling.LANCZOS)
    canvas.paste(tile,((W-tile.width)//2,235+(630-tile.height)//2))
    draw=ImageDraw.Draw(canvas)
    draw.rounded_rectangle((20,18,700,185),24,fill="#0b2b42")
    txt(draw,42,40,"NOVA10 | APERÇU INTERNE",size=35,color="#54f2c7",max_width=630)
    txt(draw,42,105,"Produit en brouillon - non publié",size=24,max_width=635)
    draw.rounded_rectangle((20,890,700,1250),22,fill="#092a2c")
    y=txt(draw,42,916,"Buse rotative haute pression",size=29,max_width=625)
    y=txt(draw,42,y+10,"Raccord rapide 1/4 pouce",size=26,max_width=625)
    y=txt(draw,42,y+8,"2500 PSI annoncés par le fournisseur",size=23,color="#c5e9eb",max_width=625)
    txt(draw,42,y+45,"Ne pas appliquer sur la peinture.",size=22,color="#f3c66b",max_width=625)
    still=OUT/"shopify_real_product_preview.png"
    canvas.save(still)
    video=OUT/"nova10-buse-preview.mp4"
    r=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1","-framerate","25","-i",str(still),"-t","10","-c:v","libx264","-preset","veryfast","-crf","28","-pix_fmt","yuv420p","-movflags","+faststart",str(video)],capture_output=True,text=True)
    if r.returncode: raise RuntimeError(r.stderr[-1000:])
    audit={"status":"PREVIEW_ONLY","utc":datetime.now(timezone.utc).isoformat(),"product_id":config["product_id"],"rights_approved":False,"social_publishing_enabled":False,"video":video.name,"sha256":hashlib.sha256(video.read_bytes()).hexdigest(),"source_image":config["image_url"]}
    (OUT/"preview_audit.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(audit,ensure_ascii=False,indent=2))

if __name__=="__main__":
    generate(json.loads(CONFIG.read_text(encoding="utf-8")))
