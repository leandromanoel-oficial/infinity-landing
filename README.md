# Infinity System — Landing Page Refrisat

Landing page estática (HTML + CSS + JS, sem build step) pronta para publicação
como página independente ou integração ao WordPress.

```
index.html      estrutura, sprite de ícones SVG, dados estruturados (JSON-LD)
styles.css      design system em tokens + layout responsivo
script.js       menu, scroll-spy, UTMs, contexto de CTA, animações
assets/         imagens tratadas (PNG com transparência + WebP) e fontes
```

---

## Domínio de produção

```
https://goinfinity.com.br
```

Domínio próprio, não subdomínio da Refrisat. O `A` do apex já aponta para a
VPS `nnoconn.com.br` (187.127.41.11), onde a landing roda em container atrás
do Traefik. Já aplicado em `<link rel="canonical">`, `og:url`,
`og:image`, `twitter:image`, no bloco JSON-LD do `index.html` e no `canonical`
das três páginas legais.

Consequência de SEO a considerar: por ser domínio novo e sem histórico, ele
não herda autoridade de `refrisat.com.br`. Vale um link do site institucional
para cá e o cadastro no Google Search Console assim que publicar.

---

## Antes de publicar — obrigatório

1. **Confirmar a designação formal do Encarregado.** As páginas indicam
   `dpo@refrisat.com.br`. A LGPD (Art. 41) exige que o controlador — Santana
   Refrigeração e Instrumentação Ltda. — indique formalmente o encarregado; o
   endereço de e-mail publicado precisa corresponder a uma designação real, e
   alguém precisa efetivamente monitorar a caixa dentro dos prazos legais.
2. **Rodar o checklist de testes** no ambiente final (ver ao fim deste
   documento).

---

## CTA e integração com o Ploomes

Todos os botões comerciais apontam para `#contato` e usam o mesmo formulário:

```
https://forms.ploomes.com/form/4e3b3aabeecc45ac935a021d79d59610?iframe=true
```

O `script.js` acrescenta à URL do iframe, quando disponíveis:

| Parâmetro | Origem |
|---|---|
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | query string da visita atual (sessionStorage — ver *Páginas legais*) |
| `origem_cta` | qual botão foi clicado (`hero_principal`, `plano_energy`, …) |
| `plano_interesse` | plano do card clicado |
| `landing_page`, `page_url` | fixos |

### Comportamento do iframe

O formulário só é recarregado **enquanto o visitante ainda não interagiu com
ele**. A partir do primeiro foco dentro do iframe, cliques em outros CTAs
atualizam apenas a mensagem de contexto e o `dataLayer` — o `src` não é
reescrito, para não apagar o que já foi digitado.

### Estado da integração

Integração com o Ploomes **confirmada** (03/09/2026). Os envios chegam ao CRM.

Como o iframe é de outro domínio, a landing não consegue preencher campos
internos por JavaScript (same-origin policy): ela apenas acrescenta os
parâmetros à URL do iframe. Se algum dia um parâmetro parar de chegar ao CRM,
o problema está na configuração do formulário no Ploomes — não no
`script.js`.

---

## Páginas legais

```
politica-de-privacidade.html
politica-de-cookies.html
termos-de-uso.html
```

### Por que documentos próprios

O rodapé apontava para `https://refrisat.com.br/politica-de-privacidade`, que
**retorna 404** — o site institucional da Refrisat não publica política de
privacidade, de cookies nem termos de uso. Não havia, portanto, documento
corporativo a reaproveitar. Os três arquivos passaram a ser servidos pela
própria landing.

O controlador continua sendo a mesma pessoa jurídica do site institucional:
**Santana Refrigeração e Instrumentação Ltda.**, CNPJ 54.250.048/0001-87, que
atua sob o nome comercial Refrisat. Encarregado (DPO): `dpo@refrisat.com.br`.
As páginas identificam a razão social, não apenas a marca — a LGPD exige a
identificação do controlador, e "Refrisat" isoladamente não identifica uma
pessoa jurídica.

Consequência: se a Refrisat publicar uma política corporativa no futuro, estes
documentos precisam ser reconciliados com ela. Duas políticas do mesmo
controlador dizendo coisas diferentes é pior do que uma só.

### Decisão sobre consentimento

A versão anterior da Política de Cookies descrevia um "banner de privacidade"
com escolha de medição. Esse banner nunca existiu, e o `script.js` gravava a
primeira origem (`infinity_utm_first`) em `localStorage` sem pedir nada — o
texto contradizia o comportamento.

Optou-se por **eliminar o armazenamento persistente** em vez de construir o
banner:

- o `script.js` usa apenas `sessionStorage` (`infinity_utm_current` e
  `infinity_cta_context`), descartado ao fechar a aba;
- não há `localStorage`, cookie de terceiro, analytics ou pixel;
- sem armazenamento não necessário, não há consentimento a coletar, e a
  landing dispensa banner.

**O que se perdeu:** atribuição de primeira origem entre visitas. Se o lead
chega por um anúncio, sai e volta depois pelo orgânico para converter, a
campanha original não é mais creditada — o formulário recebe apenas os UTMs da
visita em que houve conversão. Reverter essa decisão implica reintroduzir o
`localStorage`, construir o banner de consentimento com gate no script e
reescrever a Política de Cookies.

### Ao editar

- As três páginas usam o mesmo `styles.css` (bloco `PÁGINAS LEGAIS` ao final) e
  reaproveitam as classes de marca do cabeçalho (`.brand`, `.brand-mark`,
  `.brand-by`, `.brand-refrisat`).
- Não têm JavaScript.
- A Política de Cookies descreve o comportamento real do `script.js`. Qualquer
  mudança no armazenamento do script exige uma mudança correspondente ali.

---

## Planos publicados

| Plano | Mensal | Anual |
|---|---|---|
| Exclusive | R$ 299 | R$ 3.588 |
| Energy | R$ 399 | R$ 4.788 |
| Medical | R$ 399 | R$ 4.788 |
| Plant Control | a partir de R$ 999 | R$ 11.988 |

O mensal tem maior hierarquia visual; o anual aparece como referência.
Tabela conferida contra o material comercial em 03/09/2026. Os mesmos valores
alimentam as `Offer` do JSON-LD — alterar preço exige alterar os dois lugares.

---

## Claims mantidos fora da página

Por decisão do projeto, nenhuma afirmação quantitativa não validada foi
publicada. Continuam **fora** da landing:

- redução de curva de aprendizado em 70%;
- disponibilidade +20% a +60%;
- redução de manutenção -10% a -40%;
- eficiência energética -5% a -20%;
- ROI em poucos meses;
- SLA 99,99%;
- machine learning preditivo como promessa de produto.

Quando algum desses números for validado pela Refrisat, o lugar natural para
ele é uma seção de prova entre "Da visibilidade à decisão por dados" e "Como
funciona".

---

## Assets

As imagens originais vinham em RGB **com fundo preto sólido** (sem canal alpha),
o que produzia caixas pretas atrás do logo e dos equipamentos. Todas foram
recortadas para transparência e reexportadas:

| Arquivo | Uso |
|---|---|
| `infinity-logo.png/.webp` | logo escuro — cabeçalho (fundo claro) |
| `infinity-logo-light.png/.webp` | logo branco — rodapé (fundo escuro) |
| `infinity-mark.png/.webp` | símbolo isolado |
| `infinity-mark-light.png/.webp` | símbolo branco — usado dentro dos diagramas SVG |
| `chiller.png/.webp` | arquitetura |
| `gateway.png/.webp` | arquitetura |
| `dashboard-*.jpg/.webp` | telas da plataforma |
| `og-infinity.jpg` | Open Graph 1200×630 |
| `favicon-32/180/512.png`, `apple-touch-icon.png` | ícones |
| `refrisat.svg` / `refrisat-white.svg` | logo Refrisat em vetor, extraído de `LOGOS/Refrisat/REFRISAT-logo-s-slogan.pdf` — cabeçalho e rodapé |
| `grupo/*.svg` e `grupo/ener.*` | marcas do grupo HBR Holding Brasil (ver seção abaixo) |
| `fonts/inter-latin*.woff2` | Inter variável, self-hosted |

O azul primário da página (`--blue-600: #076ab3`) é o azul institucional
amostrado do próprio logo vetorial da Refrisat.

A fonte é servida do próprio domínio (sem Google Fonts) — evita a
transferência de IP dos visitantes para terceiros, o que simplifica a
adequação à LGPD.

### Seção "HBR Holding Brasil"

Faixa clara entre o formulário de contato e o rodapé, com as 7 marcas do grupo,
espelhando o bloco institucional de `hbr.net`. Cada logo é um link externo:

| Marca | Origem do arquivo | Link |
|---|---|---|
| HBR | `LOGOS/_logos em vetor/HBR.pdf` | hbr.net |
| Air Delivery | `LOGOS/Air Delivery/Logo_AirDelivery_Aprovado.pdf` | hbr.net/aluguel/air-delivery/ |
| Oceânica | `LOGOS/Oceanica/Logo Oceânica_horizontal.pdf` | oceanicabr.com |
| Ener | `LOGOS/ENER/ENER.jpg` (**único sem vetor**) | enerbr.com |
| Tegris | `LOGOS/Tegris/logomarca_horizontal.ai` | tegris.com.br |
| Fieldlink | `LOGOS/FieldLink/fieldlink.svg` | fieldlink.me |
| Refrisat | `LOGOS/Refrisat/REFRISAT-logo-s-slogan.pdf` | refrisat.com.br |

O lockup "HBR Holding Brasil" do título vem de `LOGOS/Holding/Logo_Holding.pdf`.

As alturas de cada marca são definidas individualmente em `.gl-*` no CSS — as
proporções variam de 2.66:1 (HBR) a 6.37:1 (Oceânica), então igualar largura ou
altura de forma automática desequilibraria o conjunto.

#### Paleta da faixa

A faixa é o único trecho da página que **não** usa a paleta Refrisat. Ela segue
a paleta institucional da holding, tirada do manual da marca
(`LOGOS/Holding/MANUAL POCKET_CURVAS.pdf`), declarada em tokens `--hbr-*` no
`:root`:

| Token | Valor | Pantone | Uso |
|---|---|---|---|
| `--hbr-navy` | `#003c64` | 2965C | filete sob o lockup |
| `--hbr-gray` | `#5f5f64` | 425C | texto de apoio (5.6:1 sobre a faixa — AA) |
| `--hbr-steel` | `#5f87a0` | 5415C | borda e anel de foco |
| `--hbr-wash` | `#ecf1f4` | — | 5415C a 12% sobre branco; fundo da faixa |

O filete era `#d6252b`, um vermelho que não pertence nem à paleta da holding nem
à da landing. O vermelho existe nas marcas individuais (HBR, Ener), mas não no
sistema da holding — por isso saiu.

A faixa tem fundo próprio e borda superior e inferior justamente para se ler
como bloco institucional, separado da página do produto: ela fica entre duas
seções escuras (contato e rodapé).

### Limitações conhecidas dos assets

- `chiller.png` tem apenas **247×206 px** depois do recorte. Serve na
  arquitetura (renderizado a ~134 px), mas não suporta uso em destaque. Um
  render em resolução maior permitiria voltar a usá-lo no hero.
- O logo foi **regerado em 03/09/2026** a partir dos arquivos limpos em
  `LOGOS/Infinity/` (`FINAL INFINITY-02.png`, 2481², canal alpha; `INFINITY.png`).
  O serrilhado sumiu. Fluxo: recorte por bounding box das faixas (símbolo +
  wordmark + assinatura, excluindo o selo "HBR Holding Brasil"), versão escura
  gerada por recolorização do master branco para o navy do logo `#2b4b6b`, e
  `fit: contain` nas mesmas dimensões dos assets antigos (logo 640×461, símbolo
  400×171) — nenhuma mudança de HTML/CSS foi necessária. Os favicons **não**
  foram trocados: o símbolo tem traço fino demais e some a 16 px; seguem no
  raster serrilhado anterior.
- A assinatura ainda traz "Infinitas **váriaveis**" (grafia incorreta de
  *variáveis*) — o arquivo de origem já vem assim. Corrigir exige editar o
  vetor na origem (Refrisat).
- A imagem do gateway exibe a marca **Plant Evolution PE100S**, de outro
  fabricante, sob o rótulo "Infinity Gateway". Definir se essa é a
  apresentação desejada.
- O logo da **Ener** é o único do grupo sem arquivo vetorial na pasta `LOGOS`.
  Foi recortado do JPG (fundo branco removido) e fica nítido no tamanho usado,
  mas um SVG ou PDF vetorial seria melhor.

---

## Acessibilidade

- Todo elemento interativo tem anel de foco visível (`:focus-visible`).
- Contraste de texto validado em AA (mínimo 4.5:1 para texto normal).
- Menu mobile fecha com `Esc`, com clique fora e ao seguir um link.
- Ícones decorativos marcados com `aria-hidden`; diagramas SVG têm
  `role="img"` e `aria-label` descritivo.
- Em telas estreitas o diagrama de variáveis é substituído por uma lista —
  o SVG ficaria ilegível.
- `prefers-reduced-motion` desliga animações e o scroll suave.

---

## Deploy

Destino: **VPS `nnoconn.com.br`** (187.127.41.11), um container `nginx:alpine`
atrás do **Traefik** já existente, gerenciado pelo **Portainer como Git Stack**
— mesmo padrão do stack da Acuvia. A aplicação Infinity continua onde está; a
landing ganhará depois um botão apontando para ela.

```
docker-compose.prod.yml   stack Portainer/Traefik — router, TLS, redirects, headers
deploy/Dockerfile         estágio 1: build.py monta dist/ · estágio 2: nginx:alpine
deploy/nginx.conf         server block interno (porta 80): rotas, 404, cache, gzip
deploy/build.py           monta dist/ e o tar.gz (também roda dentro do Dockerfile)
deploy/goinfinity.conf    LEGADO — server block nginx standalone + certbot, não usado
```

O `build.py` roda **dentro da imagem**: copia para o webroot apenas o que a
página usa (as cinco páginas, `styles.css`, `script.js`, `robots.txt`,
`sitemap.xml` e os assets referenciados) e deixa de fora `LOGOS/`,
`_backup-original/`, `deploy/`, este README e ~2,5 MB de assets órfãos. O
`dist/` local **não precisa ser versionado nem gerado à mão** para publicar.

### 1. Repositório

O Portainer clona de um repositório Git. Iniciar um e subir para o GitHub:

```
git init
git add .
git commit -m "landing pronta para deploy via Traefik"
git remote add origin git@github.com:<org>/infinity-landing.git
git push -u origin main
```

`.gitignore` já ignora `dist/`, `*.tar.gz` e `LOGOS/`; `.dockerignore` mantém
esses fora do contexto de build.

### 2. DNS

`A` do apex `goinfinity.com.br` → `187.127.41.11`.

> **Apague os registros `AAAA` (IPv6).** O domínio vinha com `AAAA` apontando
> para `2001:12ff:0:2::95` (parking do Registro.br). O Let's Encrypt, quando
> existe `AAAA`, valida o desafio HTTP-01 **por IPv6 primeiro** — cai no parking,
> recebe 404 e a emissão falha, mesmo com o `A` correto. A VPS não tem IPv6 no
> Traefik, então o `AAAA` tem de sair (apex e `www`).

O `www` **não é usado** — não há registro DNS nem router para ele. Para
habilitar depois: criar `A www.goinfinity.com.br → 187.127.41.11` (sem `AAAA`)
e readicionar o router `infinity-www` no `docker-compose.prod.yml`.

### 3. Stack no Portainer

1. Portainer → **Stacks** → **Add Stack** → nome `infinity-landing`
2. Build method: **Repository** · URL do repo · reference `refs/heads/main`
3. Compose path: `docker-compose.prod.yml`
4. **Environment variables** (todas têm default; confira só a segunda):
   ```
   DOMAIN=goinfinity.com.br
   TRAEFIK_CERTRESOLVER=letsencrypt   # nome do resolver ACME — conferir em /docker/traefik/
   ```
5. **Deploy the stack.** No primeiro deploy o Traefik pede o certificado
   Let's Encrypt e grava em `acme.json`.

**HTTPS e renovação são automáticos** — o Traefik renova o certificado sozinho
antes de expirar. Não há certbot, nem cron, nem nada a fazer depois.

O `docker-compose.prod.yml` cuida de: router HTTPS no apex, redirect
`www`→apex (301), redirect HTTP→HTTPS (301) e os cabeçalhos de segurança
(HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
via middleware. O `deploy/nginx.conf` do container só faz roteamento de URL sem
`.html`, o `404.html` próprio, cache por tipo de arquivo e gzip.

> Ao mexer na **CSP**, o arquivo vivo é o label
> `traefik.http.middlewares.infinity-headers.headers.customResponseHeaders.Content-Security-Policy`
> no `docker-compose.prod.yml` — não o `goinfinity.conf`.

### 4. Republicação

`git commit` + `git push` → Portainer → **Pull and redeploy**. O `build.py`
roda de novo na build da imagem. O HTML é servido com `no-cache`, então a nova
versão aparece na hora; CSS, JS e imagens têm cache de 30 dias — se trocar uma
imagem mantendo o nome, visitantes recorrentes podem ver a antiga até o cache
expirar. Para forçar, renomeie o arquivo.

### Gerar o tar.gz avulso (opcional)

Fora do fluxo do Portainer, `python deploy/build.py` ainda gera
`dist/` + `infinity-landing-AAAAMMDD.tar.gz` para publicação manual.

> **OneDrive.** Rodando o `build.py` na pasta sincronizada do Windows, com
> "Arquivos sob Demanda" um asset pode ser um placeholder sem conteúdo local —
> aparece no `ls`, mas a leitura falha. O `build.py` detecta e aborta. Para
> resolver, na raiz do projeto: `attrib +P -U /s /d assets`. (Não afeta o
> deploy via Docker, que roda sobre a cópia do repositório.)

### Alternativa: WordPress

Se um dia a landing precisar viver dentro do site institucional:

1. criar um template de página customizado e separar HTML/CSS/JS nos arquivos
   do tema filho; ou
2. adaptar o HTML para um bloco/template do construtor utilizado, mantendo CSS
   e JS próprios.

Evite colar a página inteira em um único bloco HTML se a intenção for
manutenção de longo prazo.

---

## Checklist de testes

1. CTA do hero → `#contato`.
2. CTA de cada plano → mesmo `#contato`, com `plano_interesse` correto.
3. Preencher parcialmente o formulário, clicar em outro CTA e confirmar que
   **os dados não são apagados**.
4. UTMs permanecem na URL do iframe (inspecionar o elemento) e **nada** é
   gravado em `localStorage` (DevTools → Application → Local Storage vazio).
5. Envio real e conferência dos campos no Ploomes.
6. Responsividade em 1920, 1440, 1366, 1024, tablet e celular.
7. Chrome, Edge, Firefox e Safari/iOS.
8. Navegação apenas por teclado (Tab) do topo ao rodapé.
9. Rich Results Test do Google para o JSON-LD (Product + FAQPage).
10. Preview do compartilhamento (og:image) no LinkedIn e no WhatsApp.
11. GTM/GA4, se aprovado: o evento `infinity_cta_click` já é empurrado para o
    `dataLayer` com `cta_origin` e `plan_interest`.
12. Abrir as três páginas legais e conferir os links cruzados entre elas e o
    retorno para a landing.

### Depois de publicar

13. `https://www.goinfinity.com.br` e `http://goinfinity.com.br` redirecionam
    para `https://goinfinity.com.br`.
14. Uma URL inexistente cai no `404.html` da página, não no 404 padrão do nginx.
15. `/politica-de-privacidade` (sem `.html`) resolve.
16. O formulário do Ploomes carrega — se a CSP estiver errada, o iframe fica em
    branco e o console acusa `frame-src`.
17. `curl -I https://goinfinity.com.br` mostra os cabeçalhos de segurança e
    `Cache-Control: no-cache`; o mesmo em um `.css` deve mostrar `max-age`.
18. `robots.txt` e `sitemap.xml` acessíveis; cadastrar a propriedade no Google
    Search Console e enviar o sitemap.
