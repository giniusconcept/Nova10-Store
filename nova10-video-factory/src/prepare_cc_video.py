#!/usr/bin/env python3
"""Prepare a real pressure-washer demo by Pondguru from Wikimedia Commons.
License CC BY 3.0. This video demonstrates a Karcher Dirtblaster, NOT NOVA10's CJ nozzle.
Never misrepresent the filmed hardware.
"""
import hashlib,subprocess,urllib.parse,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output"
OUT.mkdir(parents=True,exist_ok=True)
FILENAME="Kärcher K3.550 pressure washing using a Dirtblaster wand attachment.webm"
url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+urllib.parse.quote(FILENAME,safe="")
req=urllib.request.Request(url,headers={"User-Agent":"NOVA10-VideoFactory/1.0 (Wikimedia Commons CC-BY attribution)"})
source=OUT/"pondguru_karcher_dirtblaster.webm"
with urllib.request.urlopen(req,timeout=60) as r:
    destination=r.geturl()
    if not destination.startswith("https://upload.wikimedia.org/"):
        raise RuntimeError("Unexpected source host")
    with source.open("wb") as f:
        while True:
            part=r.read(1024*1024)
            if not part:break
            f.write(part)
            if f.tell()>100_000_000:
                raise RuntimeError("Source video unexpectedly large")
if source.stat().st_size<100_000:
    raise RuntimeError("Downloaded video invalid")
target=OUT/"nova10-real-pressure-washing-ccby-private.mp4"
# Real footage. Convert aspect to vertical with padding, NOT creative replacement of footage.
subprocess.run([
    "ffmpeg","-hide_banner","-loglevel","error","-y",
    "-ss","00:00:15","-i",str(source),"-t","25",
    "-vf","scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=0x081527,drawtext=text='Demonstration Karcher Dirtblaster (modele different)':fontcolor=white:fontsize=16:x=(w-text_w)/2:y=1150",
    "-an","-c:v","libx264","-preset","veryfast","-crf","27","-pix_fmt","yuv420p",
    "-movflags","+faststart",str(target)],check=True)
if target.stat().st_size<100_000:raise RuntimeError("Transcoded clip invalid")
print("MEDIA_SOURCE=wikimedia_commons_cc_by_3_0")
print("SOURCE_AUTHOR=Pondguru")
print("SOURCE_IS_EXACT_NOVA10_PRODUCT=false")
print("CLIP_PREPARED=true")
print("CLIP_SHA256="+hashlib.sha256(target.read_bytes()).hexdigest())
