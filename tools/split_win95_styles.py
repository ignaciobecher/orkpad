"""Split de estilos dual-theme.
Para cada .vue con estilos modificados:
  <style scoped> actual -> se restaura el bloque HEAD (clásico)
  + se agrega <style> sin scoped con las reglas actuales prefijadas
    por html[data-appearance="win95"].
Uso: python3 tools/split_win95_styles.py [--apply]
Sin --apply solo reporta.
"""
import subprocess
import re
import sys

APPLY = '--apply' in sys.argv
P = 'html[data-appearance="win95"]'
SKIP = {
    'frontend/src/App.vue',
    'frontend/src/components/layout/AppLayout.vue',
}


def parse_blocks(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    blocks = []
    i, n = 0, len(css)
    while i < n:
        while i < n and css[i].isspace():
            i += 1
        if i >= n:
            break
        j = css.find('{', i)
        if j == -1:
            break
        selector = css[i:j].strip()
        if not selector:
            i = j + 1
            continue
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        blocks.append((selector, css[j + 1:k - 1].strip()))
        i = k
    return blocks


def prefix_selector(sel):
    parts = [p.strip() for p in sel.split(',') if p.strip()]
    out = []
    for p in parts:
        if p.startswith(':root'):
            out.append(P)
        elif p == '*':
            out.append(f'{P} *')
        elif p == 'html':
            out.append(P)
        elif p == 'body':
            out.append(f'{P} body')
        elif p.startswith(':'):
            out.append(f'{P}{p}')
        elif p in ('from', 'to') or re.match(r'^\d+(\.\d+)?%$', p):
            out.append(p)
        else:
            p = re.sub(r':deep\(([^)]+)\)', r'\1', p)
            p = re.sub(r':global\(([^)]+)\)', r'\1', p)
            out.append(f'{P} {p}')
    return ', '.join(out)


def convert_css(css):
    # renombra @keyframes a w95-* y reescribe referencias en este mismo css
    names = re.findall(r'@keyframes\s+([\w-]+)', css)
    for name in names:
        css = re.sub(r'@keyframes\s+' + re.escape(name) + r'\b',
                     f'@keyframes w95-{name}', css)
    for name in names:
        css = re.sub(r'(animation(?:-name)?\s*:[^;}]*?)\b' + re.escape(name) + r'\b',
                     rf'\g<1>w95-{name}', css)

    out_chunks = []
    for selector, body in parse_blocks(css):
        if selector.startswith('@keyframes'):
            out_chunks.append(f'{selector} {{\n{body}\n}}')
        elif selector.startswith('@media'):
            inner = []
            for s2, b2 in parse_blocks(body):
                inner.append(f'{prefix_selector(s2)} {{\n{b2}\n}}')
            out_chunks.append(selector + ' {\n' + '\n'.join(inner) + '\n}')
        else:
            out_chunks.append(f'{prefix_selector(selector)} {{\n{body}\n}}')
    return '\n\n'.join(out_chunks)


def main():
    files = subprocess.check_output(
        ['git', 'diff', '--name-only', '--', 'frontend/src']).decode().split()
    vue_files = [f for f in files if f.endswith('.vue') and f not in SKIP]
    changed = []
    for f in vue_files:
        head = subprocess.check_output(['git', 'show', f'HEAD:{f}']).decode()
        cur = open(f).read()
        hm = re.search(r'(<style[^>]*>)(.*?)</style>', head, re.DOTALL)
        cm = re.search(r'(<style[^>]*>)(.*?)</style>', cur, re.DOTALL)
        if not hm or not cm:
            print(f'SKIP-nostyle {f}')
            continue
        if hm.group(2) == cm.group(2):
            continue
        converted = convert_css(cm.group(2))
        new_block = hm.group(1) + hm.group(2) + '</style>'
        new_block += '\n\n<!-- Win95: overrides encapsulados por data-appearance -->\n'
        new_block += '<style>\n' + converted + '\n</style>'
        new_src = cur[:cm.start()] + new_block + cur[cm.end():]
        # sanity: debe seguir teniendo igual cantidad de <style> +1
        assert new_src.count('<style') == cur.count('<style') + 1, f
        changed.append((f, cur, new_src))
        print(f'SPLIT {f} (win95 rules: {converted.count(chr(10)+chr(10))+1})')
    if APPLY:
        for f, cur, new_src in changed:
            open(f, 'w').write(new_src)
        print(f'APLICADO en {len(changed)} archivos')
    else:
        print(f'DRY-RUN: {len(changed)} archivos')


main()
