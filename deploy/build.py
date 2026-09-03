#!/usr/bin/env python3
"""
Monta a pasta `dist/` e o tar.gz de publicacao da landing do Infinity System.

Roda em qualquer lugar com Python 3 (Windows, Linux, macOS), sem dependencias.
Uso:  python deploy/build.py     (a partir da raiz do projeto)

O que entra:  as paginas, styles.css, script.js, robots.txt, sitemap.xml e
              apenas os assets efetivamente referenciados pelo HTML/CSS.
O que fica de fora: LOGOS/, _backup-original/, deploy/, README.md, dist/ e os
              assets orfaos (PNGs de origem, variantes de icone nao usadas).
"""
import os, re, io, shutil, tarfile, datetime, sys

DOMAIN = "https://goinfinity.com.br/"
ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST   = os.path.join(ROOT, "dist")
PAGES  = ["index.html", "404.html", "politica-de-privacidade.html",
          "politica-de-cookies.html", "termos-de-uso.html"]
FLAT   = ["styles.css", "script.js", "robots.txt", "sitemap.xml"]

os.chdir(ROOT)

def referenced_assets():
    ref = set()
    def add(u):
        u = u.strip().lstrip("/")
        if u.startswith(DOMAIN[8:]):            # url absoluta sem o esquema
            u = u.split("/", 1)[1]
        if u.startswith(DOMAIN):
            u = u[len(DOMAIN):]
        if u.startswith("assets/"):
            ref.add(u)
    for p in PAGES:
        s = io.open(p, encoding="utf-8").read()
        for m in re.findall(r'(?:src|href|content)="([^"]+)"', s): add(m)
        for m in re.findall(r'srcset="([^"]+)"', s):
            for part in m.split(","): add(part.strip().split()[0])
        for m in re.findall(r'"(https://[^"]*?/assets/[^"]+)"', s): add(m)
    css = io.open("styles.css", encoding="utf-8").read()
    for m in re.findall(r'url\(["\']?(?:\./)?([^"\')]+)', css):
        ref.add("assets/fonts/" + m) if m.endswith(".woff2") and "/" not in m else add(m)
    return ref

assets = referenced_assets()
faltando = sorted(a for a in assets if not os.path.exists(a))
if faltando:
    sys.exit("ABORTADO - assets referenciados que nao existem:\n  " + "\n  ".join(faltando))

# O projeto vive no OneDrive. Com "Arquivos sob Demanda", um arquivo pode existir
# como placeholder sem conteudo local: ele aparece no ls, mas a leitura falha com
# OSError 22. Detectar aqui evita um dist/ silenciosamente incompleto.
def ilegivel(path):
    try:
        with open(path, "rb") as fh:
            fh.read(1)
        return False
    except OSError:
        return True

fantasmas = sorted(a for a in assets if ilegivel(a))
if fantasmas:
    sys.exit(
        "ABORTADO - arquivos presentes mas sem conteudo local (OneDrive sob demanda):\n  "
        + "\n  ".join(fantasmas)
        + "\n\nBaixe o conteudo antes de gerar o pacote. No Windows, a partir da\n"
          "raiz do projeto:\n\n"
          "    attrib +P -U /s /d assets\n\n"
          "ou, no Explorer, botao direito na pasta assets -> "
          "\"Sempre manter neste dispositivo\"."
    )

if os.path.isdir(DIST):
    shutil.rmtree(DIST)
os.makedirs(DIST)

for f in PAGES + FLAT:
    shutil.copy2(f, os.path.join(DIST, f))
for a in sorted(assets):
    dest = os.path.join(DIST, a)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(a, dest)

stamp = datetime.date.today().strftime("%Y%m%d")
tar_path = os.path.join(ROOT, f"infinity-landing-{stamp}.tar.gz")
with tarfile.open(tar_path, "w:gz") as t:
    for name in sorted(os.listdir(DIST)):
        t.add(os.path.join(DIST, name), arcname=name)

total = sum(os.path.getsize(os.path.join(r, f))
            for r, _, fs in os.walk(DIST) for f in fs)
n = sum(len(fs) for _, _, fs in os.walk(DIST))
print(f"dist/            {n} arquivos, {total/1024/1024:.2f} MB")
print(f"{os.path.basename(tar_path)}   {os.path.getsize(tar_path)/1024/1024:.2f} MB")

orfaos = []
for r, _, fs in os.walk("assets"):
    for f in fs:
        p = os.path.join(r, f).replace("\\", "/")
        if p not in assets:
            orfaos.append(p)
if orfaos:
    peso = sum(os.path.getsize(p) for p in orfaos)
    print(f"\nassets nao publicados ({len(orfaos)}, {peso/1024/1024:.2f} MB) — "
          "ficam no projeto como origem, fora do dist:")
    for p in sorted(orfaos):
        print("  " + p)
