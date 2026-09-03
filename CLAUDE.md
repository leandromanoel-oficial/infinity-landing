# Infinity System — landing page

Página estática (HTML + CSS + JS puro, **sem build step, sem framework, sem
dependências**) do Infinity System, produto de monitoramento e automação remota
da Refrisat. Vai ao ar em `https://goinfinity.com.br`, servida por um container
`nginx:alpine` atrás do **Traefik** na VPS `nnoconn.com.br` (187.127.41.11),
gerenciado pelo Portainer como Git Stack — mesmo padrão do stack da Acuvia.

Não introduza bundler, framework ou gerenciador de pacotes aqui. A ausência
deles é escolha do projeto, não pendência.

---

## Estado atual

A página está **pronta e conferida**; falta apenas publicar. O `README.md` na
raiz é o log longo do projeto — decisões, limitações de assets, checklist de
testes — e deve ser lido antes de qualquer mudança relevante, e atualizado
junto com ela.

```
index.html                     landing (55 KB) — sprite SVG + JSON-LD inline
politica-de-privacidade.html   \
politica-de-cookies.html        > páginas legais, mesmo styles.css, sem JS
termos-de-uso.html             /
404.html
styles.css                     design system em tokens + layout responsivo
script.js                      menu, scroll-spy, UTMs, contexto de CTA
assets/                        imagens tratadas (PNG/WebP), fontes, logos do grupo
docker-compose.prod.yml        stack Portainer/Traefik (produção)
deploy/Dockerfile              build do dist/ (build.py) + nginx:alpine
deploy/nginx.conf              server block interno do container (porta 80)
deploy/build.py                monta dist/ e o tar.gz de publicação
deploy/goinfinity.conf         server block nginx standalone — LEGADO, não usado no deploy atual
LOGOS/                         material de marca bruto (fonte, não publicado)
_backup-original/              estado anterior à reformulação de 02/09/2026
```

---

## Tarefa imediata: publicar

DNS de `goinfinity.com.br` já aponta para `187.127.41.11` (apex A). O deploy é
via Portainer:

1. Iniciar o repositório git e subir para o GitHub (ainda não versionado).
2. Portainer → Stacks → Add Stack → Repository → `docker-compose.prod.yml`.
   Conferir `TRAEFIK_CERTRESOLVER` (nome do resolver ACME em `/docker/traefik/`).
3. Deploy da stack. O Traefik emite o certificado Let's Encrypt e passa a
   renovar sozinho — **não há certbot**.
4. Rodar o **Checklist de testes** do `README.md`, inclusive os itens 13–18
   (pós-publicação).

Republicação: commit + push → Portainer "Pull and redeploy". O `build.py`
roda dentro da imagem, então o `dist/` local não precisa ser versionado.

---

## Armadilhas já encontradas — não redescobrir

**OneDrive "Arquivos sob Demanda".** O projeto vive em pasta sincronizada. Um
arquivo pode existir como placeholder sem conteúdo local: aparece no `ls`, mas
a leitura falha com `OSError 22 / Invalid argument`. Já aconteceu ao trocar de
computador. Correção na raiz do projeto:

```
attrib +P -U /s /d assets
```

O `build.py` detecta e aborta — nunca contorne essa checagem, ela existe para
não publicar um pacote sem logo e sem imagem de compartilhamento. **No deploy
atual isso não acontece:** o `build.py` roda dentro do `Dockerfile`, sobre a
cópia do repositório (disco Linux normal), não sobre a pasta do OneDrive. A
armadilha só vale para quem rodar `python deploy/build.py` localmente no
Windows para gerar o tar.gz.

**Cabeçalhos de segurança e redirects moram no Traefik**, não no
`deploy/nginx.conf`. TLS + renovação, HTTP→HTTPS, `www`→apex, HSTS, CSP,
`X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` são labels
de middleware no `docker-compose.prod.yml`. O `nginx.conf` do container só faz
roteamento de URL sem `.html`, 404 próprio, cache por tipo e gzip. Ao mexer na
CSP, edite o label `infinity-headers...Content-Security-Policy` no compose — e,
se GTM/analytics entrar, a Política de Cookies junto.

**`deploy/goinfinity.conf` é legado.** Server block nginx standalone com
certbot, da abordagem anterior. Mantido como referência; não é usado pela
stack. Se editar cabeçalho/CSP, o arquivo vivo é o `docker-compose.prod.yml`.

**Git.** Iniciar o repositório é pré-requisito do deploy (Portainer clona do
GitHub). Já existe `.gitignore` (ignora `dist/`, `*.tar.gz`, `LOGOS/`) e
`.dockerignore`. `LOGOS/` fica fora do versionamento (material bruto) ou via
LFS.

---

## Decisões firmadas — não reverter sem falar com o Leandro

**Sem banner de consentimento.** O `script.js` usa **apenas `sessionStorage`**
(`infinity_utm_current`, `infinity_cta_context`). O `localStorage` de
first-touch UTM foi removido deliberadamente em 03/09/2026 para dispensar
consentimento: sem armazenamento persistente, não há o que consentir. Custo
aceito: perde-se atribuição de primeira origem entre visitas. **A Política de
Cookies descreve exatamente esse comportamento** — qualquer mudança no
armazenamento do script exige mudança correspondente no documento, e provavelmente
um banner.

**Nada de analytics, pixel ou GTM** sem revisar, juntos: a Política de Cookies,
a Política de Privacidade e a CSP do `deploy/goinfinity.conf`. O `script.js`
empurra eventos para `dataLayer`, mas nenhum GTM está instalado.

**Nenhum claim quantitativo não validado.** Ficam fora da página: ROI em poucos
meses, SLA 99,99%, -70% de curva de aprendizado, +20–60% de disponibilidade,
-10–40% de manutenção, -5–20% de eficiência energética, machine learning
preditivo como promessa. Lista e contexto no `README.md`.

**Duas paletas convivem.** O corpo usa o azul Refrisat `#076AB3`, amostrado do
logo vetorial. A faixa do grupo (`#grupo`) usa a paleta institucional da HBR
Holding, em tokens `--hbr-*` — navy `#003C64`, gray `#5F5F64`, steel `#5F87A0`,
wash `#ECF1F4` — tirada de `LOGOS/Holding/MANUAL POCKET_CURVAS.pdf`. Isso é
intencional: ali quem fala é a holding, não o produto.

**Dados legais conferidos** — não alterar sem fonte:

- Controlador: Santana Refrigeração e Instrumentação Ltda. (nome comercial
  Refrisat), CNPJ 54.250.048/0001-87.
- Encarregado (DPO): `dpo@refrisat.com.br`.
- `refrisat.com.br/politica-de-privacidade` retorna **404** — o site
  institucional não publica política nenhuma. Por isso a landing serve as
  próprias. Não reaponte os links para lá.

**Preços** (mensal): Exclusive R$ 299, Energy R$ 399, Medical R$ 399, Plant
Control a partir de R$ 999. Conferidos em 03/09/2026. Os mesmos valores
alimentam as `Offer` do JSON-LD no `index.html` — **alterar preço exige alterar
os dois lugares**.

**Botão "Login" no header** aponta para `https://infinity-refrisat.com/` (a
aplicação Infinity, domínio separado) com `target="_blank" rel="noopener"` —
abre em nova aba de propósito, para que a aba do `goinfinity.com.br` nunca seja
navegada para fora. Não dá para mascarar a barra de endereço numa navegação
real; mascarar exigiria proxy reverso da app inteira sob o goinfinity (frágil:
cookies, OAuth, URLs absolutas). Não está na CSP porque é navegação de
topo, não iframe/fetch.

**Formulário Ploomes** integrado e funcionando. O iframe é cross-origin: a
landing só acrescenta parâmetros à URL, não preenche campos por JavaScript. Se
um parâmetro parar de chegar ao CRM, o problema está na configuração do
formulário no Ploomes, não no `script.js`. O `src` do iframe não é reescrito
depois que o visitante começa a digitar — reescrever apagaria o que ele já
preencheu.

---

## Pendências externas (dependem da Refrisat)

- Designação formal do Encarregado para a Controladora (LGPD Art. 41) e
  monitoramento efetivo da caixa `dpo@refrisat.com.br`.
- SEO: `goinfinity.com.br` é domínio novo, sem autoridade herdada. Pedir link
  do site institucional e cadastrar no Google Search Console.
- Logo Infinity **vetorial**: o atual é raster com serrilhado, e a assinatura
  traz "Infinitas **váriaveis**" (grafia incorreta de *variáveis*).
- Render maior do `chiller.png` (hoje 247×206 px após o recorte).
- Vetor da Ener — única marca do grupo sem arquivo vetorial.
- Definir se a imagem do gateway deve exibir a marca **Plant Evolution PE100S**,
  de outro fabricante, sob o rótulo "Infinity Gateway".

---

## Convenções

- Comentários, textos e nomes de commit em **português**.
- Acessibilidade é requisito, não extra: foco visível em tudo que é interativo,
  contraste AA validado, `prefers-reduced-motion` respeitado, diagramas SVG com
  `role="img"` e `aria-label`. Não regrida isso.
- Fontes são self-hosted (sem Google Fonts) por LGPD — não voltar a CDN externa.
- Ao mexer no `styles.css`, use os tokens do `:root`; evite valores soltos.
