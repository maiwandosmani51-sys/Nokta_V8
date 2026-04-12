from pathlib import Path
import re

root = Path(__file__).resolve().parent / 'src'
for path in root.rglob('*.ts'):
    text = path.read_text(encoding='utf-8')
    new = re.sub(r"(from\s+['\"])(\.\.?/[^'\"]+?)\.js(['\"])", r"\1\2\3", text)
    if new != text:
        path.write_text(new, encoding='utf-8')
        print('updated', path)
