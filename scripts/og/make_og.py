"""Generate the 1200x630 sharing card from current homepage data.
Run: python3 scripts/og/make_og.py [--out path]
Re-run after changing the hero or byline. Uses locally cached Noto Sans KR.
"""
import argparse
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / 'scripts/og/fonts/NotoSansKR.ttf'

def font(size, weight=500):
    f = ImageFont.truetype(str(FONT), size)
    f.set_variation_by_axes([weight])
    return f

def render(out):
    data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
        "import fs from 'node:fs';import yaml from 'js-yaml';console.log(JSON.stringify({home:yaml.load(fs.readFileSync('src/_data/home.yml','utf8')),site:yaml.load(fs.readFileSync('src/_data/site.yml','utf8'))}));"], cwd=ROOT))
    studio, site = data['home']['studio'], data['site']
    im = Image.new('RGB', (1200, 630), '#f7f9fc')
    d = ImageDraw.Draw(im)
    navy, muted = '#102858', '#52647f'
    logo = Image.open(ROOT / 'src/assets/brand/church-ai-lab-horizontal.png').convert('RGB')
    mask = logo.convert('L').point(lambda x: 255 if x < 200 else 0)
    logo = logo.crop(mask.getbbox())
    logo.thumbnail((310, 95), Image.Resampling.LANCZOS)
    # Place the existing mark on a clean white brand panel, without recoloring it.
    d.rounded_rectangle((65, 42, 405, 151), radius=12, fill='white')
    im.paste(logo, (80, 50))
    d.text((1125, 90), '목회자를 위한 AI 활용 교육', font=font(25), fill=muted, anchor='rm')
    lines = [studio['hero_line1'], studio['hero_line2']]
    size = 76
    while max(font(size, 700).getlength(line) for line in lines) > 1050:
        size -= 1
    for i, line in enumerate(lines):
        d.text((75, 220+i*98), line, font=font(size, 700), fill=navy, anchor='lt')
    d.line((75, 448, 1125, 448), fill='#ccd8e9', width=2)
    d.text((75, 477), '설교준비 · 목회행정 · 교회교육 · 나만의 AI 도구', font=font(25), fill=muted)
    d.text((75, 548), studio['profile_name'], font=font(27,700), fill=navy)
    d.text((260, 553), site['byline'], font=font(22), fill=muted)
    d.text((1125, 566), 'churchailab.org', font=font(23,600), fill=navy, anchor='rm')
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    im.save(out, optimize=True)
    print(out)

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--out', default=str(ROOT / 'src/assets/og-studio-20261013.png'))
    render(parser.parse_args().out)
