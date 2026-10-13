#!/usr/bin/env python3
"""Turns the game page (src/operacion-insurgentes.html, made by src/build.sh) into a normal standalone web page:
a full document head, three.js and the fonts inlined (no outside requests), and the phone extras from extras.js.

  python3 web/build.py                  the live site: writes index.html, manifest.webmanifest and .nojekyll at the repo root
  python3 web/build.py --out DIR        the same, into DIR (icons and preview image are copied along)
  python3 web/build.py --single DIR     one self-contained index.html in DIR (icons inlined, no other files needed)
"""
import argparse, base64, json, os, shutil

SITE = 'https://mrbbqgc-pixel.github.io/operacion-insurgentes/'
ap = argparse.ArgumentParser()
ap.add_argument('--out', default='')
ap.add_argument('--single', default='')
ap.add_argument('--base', default=SITE)
ap.add_argument('--src', default='')
a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
rd = lambda p, m='r': open(p, m, **({} if 'b' in m else {'encoding': 'utf8'})).read()
b64 = lambda p: base64.b64encode(rd(p, 'rb')).decode()

src = rd(a.src or os.path.join(root, 'src/operacion-insurgentes.html'))
s0, s1 = src.index('<style>'), src.index('</style>') + len('</style>')
pre, style, rest = src[:s0], src[s0:s1], src[s1:]
assert '<title>Operación Insurgentes</title>' in pre and 'fonts.googleapis.com' in pre and pre.count('<') == 3, pre
CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
assert rest.count(CDN) == 1 and rest.rstrip().endswith('</script>')
three = rd(os.path.join(here, 'vendor/three.min.js'))
assert '</script' not in three.lower() and '<!--' not in three and '"128"' in three
peer = rd(os.path.join(here, 'vendor/peerjs.min.js'))  # browser-to-browser connections for multiplayer; the game page itself does not ask for it
assert '</script' not in peer.lower() and '<!--' not in peer and 'peerjs' in peer
rest = rest.replace(CDN, '<script>' + three.rstrip() + '\n</script>\n<script>' + peer.rstrip() + '\n</script>')
assert 'http://' not in style and 'https://' not in style

FONTS = [('Saira Stencil One', 400, 'saira-stencil-one-latin-400-normal.woff2'),
         ('Saira Condensed', 400, 'saira-condensed-latin-400-normal.woff2'),
         ('Saira Condensed', 600, 'saira-condensed-latin-600-normal.woff2'),
         ('Saira Condensed', 700, 'saira-condensed-latin-700-normal.woff2')]
fontcss = ''.join("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}\n"
                  % (n, w, b64(os.path.join(here, 'vendor/fonts', f))) for n, w, f in FONTS)

TITLE = 'Operación Insurgentes'
DESC = ('A first-person shooter set in Ciudad Insurgentes, Baja California Sur, on the town’s real street grid. '
        'Plays in the browser on a phone or a computer, nothing to install.')
single = bool(a.single)
out = os.path.abspath(a.single or a.out or root)
base = '' if single else a.base.rstrip('/') + '/'
head = ['<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">',
        '<title>%s</title>' % TITLE,
        '<meta name="description" content="%s">' % DESC,
        '<meta name="theme-color" content="#15110c">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
        '<meta name="apple-mobile-web-app-title" content="Insurgentes">',
        '<meta property="og:type" content="website">',
        '<meta property="og:title" content="%s">' % TITLE,
        '<meta property="og:description" content="%s">' % DESC]
if base:
    head += ['<link rel="canonical" href="%s">' % base,
             '<meta property="og:url" content="%s">' % base,
             '<meta property="og:image" content="%spreview.jpg">' % base,
             '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
             '<meta name="twitter:card" content="summary_large_image">',
             '<link rel="manifest" href="manifest.webmanifest">',
             '<link rel="icon" type="image/png" href="icon-64.png">',
             '<link rel="apple-touch-icon" href="icon-180.png">']
else:
    head += ['<link rel="icon" type="image/png" href="data:image/png;base64,%s">' % b64(os.path.join(root, 'icon-64.png')),
             '<link rel="apple-touch-icon" href="data:image/png;base64,%s">' % b64(os.path.join(root, 'icon-180.png'))]
head += ['<!-- Operación Insurgentes. Engine: three.js r128 (MIT). Connections: PeerJS 1.5.5 (MIT). Fonts: Saira Stencil One and Saira Condensed, (c) The Saira Project Authors, SIL Open Font License 1.1. -->',
         '<style>',
         'html,body{margin:0;padding:0;overscroll-behavior:none}[hidden]{display:none!important}',
         '.over{overscroll-behavior:contain;touch-action:manipulation}',
         '.tip{margin:0;font-size:12.5px;line-height:1.35;opacity:.9;max-width:56ch}',
         '@media (max-height:350px){body.iostip .eyebrow{display:none}}',
         fontcss.rstrip(), '</style>', style, '</head>', '<body>',
         '<noscript><p style="position:fixed;left:16px;top:16px;z-index:9;margin:0;font:16px sans-serif;color:#f3e8d3">This game needs JavaScript to run.</p></noscript>']

extras = rd(os.path.join(here, 'extras.js'))
assert '</script' not in extras.lower()
html = '\n'.join(head) + rest.rstrip() + '\n<script>\n' + extras.rstrip() + '\n</script>\n</body>\n</html>\n'

os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(html)
if base:
    if out != root:
        for f in ('icon-64.png', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'preview.jpg'):
            shutil.copy(os.path.join(root, f), os.path.join(out, f))
    man = {'name': TITLE, 'short_name': 'Insurgentes', 'description': DESC, 'start_url': './', 'scope': './', 'display': 'fullscreen',
           'orientation': 'landscape', 'background_color': '#15110c', 'theme_color': '#15110c',
           'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'}]}
    open(os.path.join(out, 'manifest.webmanifest'), 'w', encoding='utf8').write(json.dumps(man, ensure_ascii=False, indent=1) + '\n')
    open(os.path.join(out, '.nojekyll'), 'w').write('')
print('wrote', os.path.join(out, 'index.html'), len(html.encode('utf8')), 'bytes', '(hosted at ' + base + ')' if base else '(single file)')
