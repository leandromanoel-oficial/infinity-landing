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

Domínio próprio, não subdomínio da Refrisat. O `A` do apex aponta para a
**VPS da Refrisat / HBR Holding** (`srv1202507.hstgr.cloud`, `72.61.44.210`),
onde a landing roda em container atrás do nginx do host — ver **Deploy**.
Já aplicado em `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`,
no bloco JSON-LD do `index.html` e no `canonical` das três páginas legais.

> Migrado da VPS de teste `nnoconn.com.br` (187.127.41.11, Portainer + Traefik)
> em 03/09/2026. Passo a passo e retrato da VPS de destino em
> `deploy/MIGRACAO-REFRISAT.md`.

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
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `msclkid` | **efetivo**: last-touch da visita (sessionStorage) com fallback para o first-touch persistido |
| `utm_source_first`, `utm_medium_first`, `utm_campaign_first`, `utm_content_first`, `utm_term_first` | snapshot do **first-touch** (`localStorage` `infinity_utm_first`, TTL 90 dias) |
| `utm_first_seen`, `utm_first_referrer` | data e referrer da primeira visita |
| `origem_cta` | qual botão foi clicado (`hero_principal`, `plano_energy`, …) |
| `plano_interesse` | plano do card clicado |
| `landing_page`, `page_url` | fixos |

Mapeamento completo desses campos no formulário do Ploomes: **`deploy/UTM-PERSISTENTE.md`**.

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

### Decisão sobre consentimento (revista em 10/09/2026)

Histórico: a Política de Cookies chegou a descrever um "banner de privacidade"
que nunca existiu; em 03/09/2026 optou-se por **eliminar o `localStorage`** e
usar só `sessionStorage`, dispensando banner — ao custo de perder a atribuição
de primeira origem entre visitas.

**Em 10/09/2026 o first-touch persistente foi reintroduzido** a pedido do
Leandro, para dar base a decisões de verba de mídia. Modelo:

- `localStorage` `infinity_utm_first` — origem da **primeira** visita (UTMs,
  `gclid`/`fbclid`/`msclkid`, referrer), **TTL de 90 dias**, expira sozinho;
- `localStorage` `infinity_utm_optout` — registra a oposição do visitante;
- **base legal:** legítimo interesse (LGPD Art. 7º, IX) — dado de origem, não
  identifica a pessoa, sem cookie de terceiro, sem perfil comportamental, sem
  rastreio entre sites;
- **em vez de banner:** opt-out. Botão `#campanha-optout` na Política de
  Cookies chama `window.infinityCampanhaOptOut()`, que apaga o registro e
  bloqueia novas gravações. Por isso `politica-de-cookies.html` passou a
  carregar `script.js` (`defer`).

**Pendência:** chancela do DPO (`dpo@refrisat.com.br`) sobre o legítimo
interesse. Se exigir consentimento, trocar o opt-out por gate de opt-in — a
gravação persistente está isolada num único ponto do `script.js`.

Mapeamento dos parâmetros no CRM: `deploy/UTM-PERSISTENTE.md`.

### Ao editar

- As três páginas usam o mesmo `styles.css` (bloco `PÁGINAS LEGAIS` ao final) e
  reaproveitam as classes de marca do cabeçalho (`.brand`, `.brand-mark`,
  `.brand-by`, `.brand-refrisat`).
- Só a **Política de Cookies** carrega JavaScript (`script.js`, `defer`), e
  apenas para o botão de opt-out `#campanha-optout`. Privacidade e Termos não
  têm script.
- As Políticas de Cookies **e** de Privacidade descrevem o comportamento real
  do `script.js`. Qualquer mudança no armazenamento do script exige mudança
  correspondente nos dois documentos.

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

**Em produção desde 03/09/2026 na VPS da Refrisat / HBR Holding**
(`srv1202507.hstgr.cloud`, `72.61.44.210`). Modelo: container só serve o
estático numa porta de loopback; o **nginx do host** faz proxy, TLS
(**certbot**) e cabeçalhos de segurança. Não há Portainer nem Traefik nessa
VPS. Retrato completo da máquina e passo a passo da migração em
**`deploy/MIGRACAO-REFRISAT.md`**.

Repositório: `git@github.com:hbr-holding/infinity-landing.git` (privado). A VPS
clona por **deploy key** read-only (`~/.ssh/infinity_deploy`, alias
`github-infinity` no `~/.ssh/config`).

```
docker-compose.host-nginx.yml   PROD — container em 127.0.0.1:8081, sem Traefik
deploy/goinfinity-proxy.conf    vhost do nginx do host: proxy + headers; certbot adiciona o 443
deploy/Dockerfile               estágio 1: build.py monta dist/ · estágio 2: nginx:alpine
deploy/nginx.conf               server block interno do container (porta 80): rotas, 404, cache, gzip
deploy/build.py                 monta dist/ e o tar.gz (também roda dentro do Dockerfile)
docker-compose.prod.yml         modelo antigo (Portainer + Traefik) — não usado na VPS atual
deploy/goinfinity.conf          LEGADO — nginx standalone servindo arquivo direto, não usado
```

O `build.py` roda **dentro da imagem**: copia para o webroot apenas o que a
página usa (as cinco páginas, `styles.css`, `script.js`, `robots.txt`,
`sitemap.xml` e os assets referenciados) e deixa de fora `LOGOS/`,
`_backup-original/`, `deploy/`, este README e ~2,5 MB de assets órfãos. O
`dist/` local **não precisa ser versionado nem gerado à mão** para publicar.

### Estrutura na VPS

| Local | O quê |
|---|---|
| `/opt/infinity-landing` | clone do repo (segue o padrão do `/opt/refrisizing` deles) |
| container `infinity-landing` | `restart: unless-stopped`, publica em `127.0.0.1:8081` |
| `/etc/nginx/sites-available/goinfinity.com.br` | vhost (proxy → `:8081` + headers + 443 do certbot) |
| `/etc/letsencrypt/live/goinfinity.com.br/` | certificado, renovado pelo `certbot.timer` (systemd) |

### DNS

`A goinfinity.com.br → 72.61.44.210`. **Sem registro `AAAA`** — o nginx do host
só escuta IPv4; um `AAAA` publicado faz o Let's Encrypt validar por IPv6 e
falhar a emissão. `www` não é usado.

### Republicação

```bash
cd /opt/infinity-landing && git pull && \
  docker compose -f docker-compose.host-nginx.yml up -d --build
```

O `build.py` roda de novo na build da imagem. O HTML é servido com `no-cache`,
então a nova versão aparece na hora; CSS, JS e imagens têm cache de 30 dias — se
trocar uma imagem mantendo o nome, visitantes recorrentes podem ver a antiga até
o cache expirar. Para forçar, renomeie o arquivo.

> **CSP e cabeçalhos de segurança** moram no vhost do host
> (`/etc/nginx/sites-available/goinfinity.com.br`, template em
> `deploy/goinfinity-proxy.conf`), **não** no `deploy/nginx.conf` do container.
> Mudou a CSP → muda lá, e provavelmente na Política de Cookies.

> **1 vCPU, sem swap.** O build é leve, mas roda em série com o `refrisizing`.
> Se um rebuild der OOM, criar um swapfile de 2 GB antes (ver
> `deploy/MIGRACAO-REFRISAT.md`).

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
4. Atribuição persistente:
   a. abrir `?utm_source=teste&utm_campaign=abc&gclid=xyz` → conferir
      `localStorage.infinity_utm_first` gravado com `expires` ~90 dias à frente;
   b. fechar a aba, reabrir a landing **sem** parâmetros → a URL do iframe ainda
      leva `utm_source=teste` (efetivo, via fallback) e `utm_source_first=teste`;
   c. Política de Cookies → botão "Desativar atribuição de campanha" → o item
      `infinity_utm_first` some e `infinity_utm_optout=1` aparece; recarregar a
      landing com UTM na URL → nada é persistido em `localStorage`;
   d. botão "Reativar" → volta a persistir.
5. Envio real e conferência dos campos no Ploomes (ver `deploy/UTM-PERSISTENTE.md`).
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

13. `http://goinfinity.com.br` redireciona (301) para `https://goinfinity.com.br`.
    (`www` não tem DNS nem vhost — não é testado.)
14. Uma URL inexistente cai no `404.html` da página, não no 404 padrão do nginx.
15. `/politica-de-privacidade` (sem `.html`) resolve.
16. O formulário do Ploomes carrega — se a CSP estiver errada, o iframe fica em
    branco e o console acusa `frame-src`.
17. `curl -I https://goinfinity.com.br` mostra os cabeçalhos de segurança e
    `Cache-Control: no-cache`; o mesmo em um `.css` deve mostrar `max-age`.
18. `robots.txt` e `sitemap.xml` acessíveis; cadastrar a propriedade no Google
    Search Console e enviar o sitemap.
