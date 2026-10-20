#!/usr/bin/env python3
"""Snapshot only publicly published Naver posts before the scheduled deploy.
On failure leave the last good snapshot intact and fail the job.
"""
import hashlib
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'src/_data/blogFeed.json'
COVERS = ROOT / 'src/_data/blogCovers.json'

class Content(HTMLParser):
    def __init__(self):
        super().__init__(); self.text = []; self.images = []
    def handle_data(self, data): self.text.append(data)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'img' and a.get('src'): self.images.append(a['src'])

def safe_image(value):
    value = html.unescape(value).replace('http://', 'https://', 1)
    u = urlparse(value)
    return value if u.scheme == 'https' and (u.hostname or '').endswith(('.pstatic.net', '.naver.net')) else None

def cover(post):
    # A topic-specific typographic cover for a post without a representative photo.
    directory = ROOT / 'src/media/blog-covers'; directory.mkdir(parents=True, exist_ok=True)
    lines = []; line = ''
    for word in post['title'].split():
        if line and len(line + ' ' + word) > 17: lines.append(line); line = word
        else: line = (line + ' ' + word).strip()
    if line: lines.append(line)
    text = ''.join(f'<tspan x="54" dy="{0 if i == 0 else 59}">{html.escape(v)}</tspan>' for i, v in enumerate(lines))
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#eaf0f9"/><path d="M54 64H546M54 508H546" stroke="#a9bddb"/><text x="54" y="107" fill="#52647f" font-size="21" font-family="sans-serif">{html.escape(post['category'])}</text><text x="54" y="200" fill="#102858" font-size="36" font-weight="650" font-family="Apple SD Gothic Neo,Noto Sans KR,sans-serif">{text}</text><text x="54" y="550" fill="#52647f" font-size="18" font-family="sans-serif">Church AI Lab · 처치AI랩</text></svg>'''
    (directory / (post['id']+'.svg')).write_text(svg)
    return '/media/blog-covers/'+post['id']+'.svg'

def cache_image(url, post):
    directory = ROOT / 'src/media/blog-covers'; directory.mkdir(parents=True, exist_ok=True)
    name = post['id']+'-'+hashlib.sha256(url.encode()).hexdigest()[:12]+'.jpg'
    target = directory / name
    if not target.exists():
        with urlopen(Request(url,headers={'User-Agent':'ChurchAILab-PublicFeed/1.0'}), timeout=15) as response:
            if not response.headers.get('Content-Type','').startswith('image/'):
                raise ValueError('Representative image did not return an image')
            data = response.read(4_000_001)
            if len(data)>4_000_000 or not data: raise ValueError('Invalid image size')
        target.write_bytes(data)
    return '/media/blog-covers/'+name

def main():
    overrides = json.loads(COVERS.read_text()) if COVERS.exists() else {}
    source = Path(sys.argv[1]).read_bytes() if len(sys.argv)>1 else urlopen(Request('https://rss.blog.naver.com/church_ai_lab.xml', headers={'User-Agent':'ChurchAILab-PublicFeed/1.0'}), timeout=25).read()
    root = ET.fromstring(source)
    posts = []
    now = datetime.now(timezone.utc)
    for item in root.findall('./channel/item'):
        url = (item.findtext('guid') or item.findtext('link') or '').split('?')[0]
        match = re.fullmatch(r'https://blog\.naver\.com/church_ai_lab/(\d+)', url)
        if not match: continue
        date = parsedate_to_datetime(item.findtext('pubDate'))
        if date > now: continue
        title = item.findtext('title', '').strip()
        if not title: continue
        parser = Content(); parser.feed(html.unescape(item.findtext('description', '')))
        excerpt = re.sub(r'\s+', ' ', ''.join(parser.text)).strip().rstrip('.')
        # Some older posts retain a plain source URL above their native link card.
        excerpt = re.sub(r'https?://[^\s]+', '', excerpt).strip()
        excerpt = excerpt[:240].rstrip() + ('…' if len(excerpt)>240 else '')
        post = dict(id=match[1],title=title,url=url,date=date.isoformat(),display_date=date.strftime('%Y-%m-%d'),category=' '.join(item.findtext('category','블로그').split()),excerpt=excerpt,image_alt=title+' 대표 이미지')
        remote_image = next((safe_image(x) for x in parser.images if safe_image(x)), None)
        curated = overrides.get(post['id'])
        if curated and (ROOT / 'src' / curated['image'].lstrip('/')).is_file():
            post['image'] = curated['image']
            post['image_alt'] = curated['alt']
            post['image_label'] = curated.get('label', '')
        elif remote_image:
            try: post['image'] = cache_image(remote_image, post)
            except Exception as error:
                print(f'Image unavailable for {post["id"]}; using topic cover: {error}', file=sys.stderr)
                post['image'] = cover(post)
        else: post['image'] = cover(post)
        posts.append(post)
    if not posts: raise ValueError('No public posts found; refusing to erase the last good feed')
    posts.sort(key=lambda p:p['date'],reverse=True)
    # Deliberately omit fetched_at so unchanged feeds do not cause paid deployments.
    result = {'source':'https://rss.blog.naver.com/church_ai_lab.xml','posts':posts[:6]}
    output = json.dumps(result, ensure_ascii=False, indent=2)+'\n'
    if not OUTPUT.exists() or OUTPUT.read_text()!=output:
        OUTPUT.write_text(output); print(f'Updated {len(result["posts"])} public posts')
    else: print('Public feed unchanged')

if __name__ == '__main__': main()
