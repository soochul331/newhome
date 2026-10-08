"""카카오톡·SNS 링크 미리보기 이미지(1200x630, 오픈그래프) 생성기. 로컬 전용.

사용:
  python3 scripts/og/make_og.py                       # src/assets/og.png 생성
  python3 scripts/og/make_og.py --name "신수철 목사" --out /tmp/og-alt.png
디자인: DESIGN.md 3색(배경 #F6F7FB · 글자 #141B34 · 강조 #2747D6), 제목 Black Han Sans · 본문 Noto Sans KR.
강조색은 '성장 — 천천히 그러나 꾸준히'를 뜻하는 오르는 막대 하나에만 쓴다.
"""
import argparse, os, urllib.request
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
FONT_URLS = {
    "BlackHanSans-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/blackhansans/BlackHanSans-Regular.ttf",
    "NotoSansKR.ttf": "https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf",
}

BG, TEXT, ACCENT = (0xF6, 0xF7, 0xFB), (0x14, 0x1B, 0x34), (0x27, 0x47, 0xD6)
def mix(fg, a, bg=BG): return tuple(round(f * a + b * (1 - a)) for f, b in zip(fg, bg))
MUTED, BORDER = mix(TEXT, .62), mix(TEXT, .12)

def ensure_fonts():
    os.makedirs(FONTS, exist_ok=True)
    for name, url in FONT_URLS.items():
        p = os.path.join(FONTS, name)
        if not os.path.exists(p):
            print("글꼴 내려받는 중:", name); urllib.request.urlretrieve(url, p)

def noto(px, weight):
    f = ImageFont.truetype(os.path.join(FONTS, "NotoSansKR.ttf"), px)
    try: f.set_variation_by_axes([weight])
    except Exception: pass
    return f

def render(out, label, lines, name, role, url, S=2):
    W, H = 1200 * S, 630 * S
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    X, R = 80 * S, 1120 * S
    # 라벨
    d.text((X, (72 + 14) * S), label, font=noto(28 * S, 500), fill=MUTED, anchor="lm")
    # 제목(나만의 질문)
    h1 = ImageFont.truetype(os.path.join(FONTS, "BlackHanSans-Regular.ttf"), 76 * S)
    lh, top = 90, 140
    for i, ln in enumerate(lines):
        d.text((X, (top + lh * i + lh / 2) * S), ln, font=h1, fill=TEXT, anchor="lm")
    # 성장 막대 — 유일한 강조 요소
    bw, gap, btop, bh = 30, 14, 150, 230
    x0 = 1120 - (5 * bw + 4 * gap)
    for i, (hp, a) in enumerate([(.22, .18), (.38, .32), (.54, .50), (.74, .72), (1.0, 1.0)]):
        x = x0 + i * (bw + gap); y1 = btop + bh; y0 = y1 - bh * hp
        d.rounded_rectangle([x * S, y0 * S, (x + bw) * S, y1 * S], radius=6 * S, fill=mix(ACCENT, a))
    # 하단 구분선 + 이름·소개·주소
    line_y = 455
    d.rectangle([X, line_y * S, R, (line_y + 2) * S], fill=BORDER)
    d.text((X, (line_y + 28 + 20) * S), name, font=noto(34 * S, 700), fill=TEXT, anchor="lm")
    role_y = line_y + 28 + 41 + 8 + 17
    d.text((X, role_y * S), role, font=noto(26 * S, 400), fill=MUTED, anchor="lm")
    d.text((R, role_y * S), url, font=noto(24 * S, 500), fill=MUTED, anchor="rm")
    im = im.resize((1200, 630), Image.LANCZOS)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out, "PNG", optimize=True)
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "..", "..", "src", "assets", "og.png"))
    ap.add_argument("--label", default="Church AI Lab · 교회AI 컨설턴트")
    ap.add_argument("--lines", default="AI는 교회를|더 사람답게|만들 수 있는가?")
    ap.add_argument("--name", default="신수철 목사")
    ap.add_argument("--role", default="늘푸른진건교회 교육목사 · Church AI Lab 디렉터")
    ap.add_argument("--url", default="newhome-shin.netlify.app")
    a = ap.parse_args()
    ensure_fonts()
    p = render(a.out, a.label, a.lines.split("|"), a.name, a.role, a.url)
    print(os.path.normpath(p), os.path.getsize(p) // 1024, "KB")
