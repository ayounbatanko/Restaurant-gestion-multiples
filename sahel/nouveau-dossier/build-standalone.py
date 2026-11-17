#!/usr/bin/env python3
"""Régénère SAHEL_CONNECT_STANDALONE.html (CSS, JS et logo intégrés) à partir de index.html. Usage : python3 build-standalone.py"""
import base64,re,pathlib
d=pathlib.Path(__file__).parent
h=(d/'index.html').read_text(encoding='utf-8')
css=(d/'css/styles.css').read_text(encoding='utf-8')
js=(d/'js/modules.js').read_text(encoding='utf-8')+'\n'+(d/'js/app.js').read_text(encoding='utf-8')
svg=base64.b64encode((d/'assets/logo.svg').read_bytes()).decode()
uri='data:image/svg+xml;base64,'+svg
h=h.replace('<link rel="stylesheet" href="css/styles.css?v=3">','<style>'+css+'</style>')
h=re.sub(r'<link rel="manifest"[^>]*>|<link rel="apple-touch-icon"[^>]*>','',h)
h=h.replace('<script src="js/modules.js?v=3"></script><script src="js/app.js?v=3"></script>','<script>'+js+'</script>')
h=h.replace('assets/logo.svg',uri)
(d/'SAHEL_CONNECT_STANDALONE.html').write_text(h,encoding='utf-8')
print('OK',len(h))
