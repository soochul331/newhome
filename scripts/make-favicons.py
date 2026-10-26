"""Export the existing Church AI Lab symbol; requires Pillow, no new artwork."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'src/assets/brand/church-ai-lab-horizontal.png').convert('RGB')
# The left third of the original horizontal logo contains the church/AI symbol.
symbol = source.crop((0, 0, round(source.width * .34), source.height))
mask = symbol.convert('L').point(lambda value: 255 if value < 210 else 0)
symbol = symbol.crop(mask.getbbox())
symbol.thumbnail((452, 452), Image.Resampling.LANCZOS)
canvas = Image.new('RGB', (512, 512), 'white')
canvas.paste(symbol, ((512 - symbol.width) // 2, (512 - symbol.height) // 2))
dest = ROOT / 'src/assets/icons'
dest.mkdir(parents=True, exist_ok=True)
for name, size in [('favicon-16.png', 16), ('favicon-32.png', 32),
                   ('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)]:
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(dest / name, optimize=True)
canvas.save(ROOT / 'src/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print('Exported favicon.ico and five PNG icons from the original logo.')
