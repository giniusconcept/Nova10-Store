#!/usr/bin/env python3
"""Original schematic motion graphic: NOT actual product footage and not commercial media."""
import math,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output"; FRAMES=OUT/"nozzle_frames"
FRAMES.mkdir(parents=True,exist_ok=True)
W,H=480,854
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def font(n,bold=False):
    path="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else FONT
    return ImageFont.truetype(path,n)
def centered(d,txt,y,ft,fill):
    bb=d.textbbox((0,0),txt,font=ft)
    d.text(((W-(bb[2]-bb[0]))/2,y),txt,font=ft,fill=fill)
for frame in range(84):
    t=frame/12
    im=Image.new("RGB",(W,H),(6,24,41))
    d=ImageDraw.Draw(im)
    for yy in range(H):
        if yy%7==0:
            shade=int(6+14*yy/H)
            d.line((0,yy,W,yy),fill=(shade,24+int(23*yy/H),41+int(26*yy/H)),width=7)
    d.rounded_rectangle((25,34,455,173),radius=20,fill=(13,53,71),outline=(47,159,166),width=2)
    centered(d,"NOVA10",49,font(50,True),(230,249,249))
    centered(d,"BUSE ROTATIVE",115,font(27,True),(93,239,211))
    # Original stylized nozzle, NOT photographic representation.
    d.ellipse((143,303,337,487),fill=(15,28,38),outline=(84,226,225),width=4)
    d.polygon([(187,365),(293,365),(274,475),(206,475)],fill=(116,143,156))
    d.polygon([(205,287),(275,287),(287,383),(193,383)],fill=(29,39,49))
    d.rounded_rectangle((198,315,282,365),radius=12,fill=(194,168,67),outline=(247,215,96),width=4)
    d.polygon([(216,286),(264,286),(257,237),(223,237)],fill=(156,167,177))
    d.ellipse((225,226,255,244),fill=(24,32,43),outline=(161,227,235),width=3)
    # Animated water spray fan, representing principle only.
    for k in range(10):
        angle=-1.15+k*(2.3/9)+t*1.4
        radius=65+((frame*7+k*37)%175)
        x=240+math.sin(angle)*radius*0.93
        y=215-math.cos(angle)*radius
        if y>48:
            rad=3+int((k+frame)%3)
            d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=(96,205+int(k%3)*10,242))
    centered(d,"JET ROTATIF",535,font(29,True),(221,250,251))
    centered(d,"Illustration du principe",585,font(22),(162,206,219))
    d.rounded_rectangle((25,671,455,802),radius=17,fill=(10,47,56))
    centered(d,"Raccord rapide 1/4 pouce",692,font(21,True),(222,249,242))
    centered(d,"Pression annoncee : 2500 PSI",733,font(19),(190,221,228))
    centered(d,"VISUEL SCHEMATIQUE - TEST PRIVE",779,font(12),(244,200,116))
    im.save(FRAMES/f"{frame:03d}.png")
out=OUT/"nova10-buse-schematic-private.mp4"
cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-framerate","12","-i",str(FRAMES/"%03d.png"),"-c:v","libx264","-preset","veryfast","-crf","26","-pix_fmt","yuv420p","-movflags","+faststart",str(out)]
subprocess.run(cmd,check=True)
print("VIDEO_PREPARED="+out.name)
print("VISUAL_KIND=original_schematic_animation_not_product_footage")
