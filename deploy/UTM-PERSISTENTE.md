# Atribuição de campanha persistente — landing → Ploomes

Como a landing captura a origem de campanha, como ela persiste por 90 dias e
o que precisa estar configurado **no formulário do Ploomes** para o dado chegar
ao CRM. Configuração da landing: já feita no `script.js` (10/09/2026).

---

## 1. O que a landing envia

A landing só acrescenta parâmetros à **URL do iframe** do formulário
(`https://forms.ploomes.com/form/4e3b3aabeecc45ac935a021d79d59610?iframe=true&...`).
Ela não preenche campos por JavaScript — o iframe é de outro domínio. Se um
parâmetro não chega ao CRM, o problema está **na configuração do formulário no
Ploomes**, não no `script.js`.

### Parâmetros enviados

| Parâmetro na URL | Significado | Quando vem preenchido |
|---|---|---|
| `utm_source` `utm_medium` `utm_campaign` `utm_content` `utm_term` | **Origem efetiva.** Last-touch: a campanha da visita em que o lead converteu. Se a conversão foi numa visita direta/orgânica, cai automaticamente para o valor do first-touch. | Sempre que houver UTM na visita atual **ou** um first-touch válido guardado |
| `gclid` `fbclid` `msclkid` | ID de clique de anúncio (Google / Meta / Microsoft), para casar o lead com o clique pago na plataforma de mídia | Quando o link de anúncio trouxe o parâmetro |
| `utm_source_first` `utm_medium_first` `utm_campaign_first` `utm_content_first` `utm_term_first` | **Origem da primeira visita** (first-touch), guardada por até 90 dias. É o que justifica o gasto: qual campanha *trouxe* o contato pela primeira vez. | Quando existe first-touch guardado |
| `utm_first_seen` | Data da primeira visita (`AAAA-MM-DD`) | idem |
| `utm_first_referrer` | URL de onde veio a primeira visita | idem, se o navegador informou |
| `origem_cta` | Qual botão da landing abriu o formulário (`hero_principal`, `plano_energy`, `footer`, …) | Ao clicar num CTA |
| `plano_interesse` | Plano do card clicado (`Exclusive`, `Energy`, `Medical`, `Plant Control`) | Ao clicar num CTA de plano |
| `landing_page` | Fixo: `Infinity System` | Sempre |
| `page_url` | URL da página no momento do envio | Sempre |

### Regra de atribuição (resumo)

- **1ª visita com `?utm_*`** → grava `infinity_utm_first` no `localStorage`
  (com os UTMs, click IDs e referrer) e um carimbo de validade de 90 dias.
- **Visitas seguintes** (incluindo acesso direto dias depois, sem parâmetros)
  → o first-touch continua sendo enviado como `*_first`, e também preenche os
  `utm_*` efetivos porque não há last-touch concorrente.
- **Nova visita com `?utm_*` diferente** → os `utm_*` efetivos passam a ser os
  novos (last-touch); os `*_first` continuam apontando para a origem original.
- **Após 90 dias sem conversão** → o first-touch expira e é descartado.
- **Opt-out** (botão na Política de Cookies) → nada é persistido; só o
  last-touch da sessão é enviado.

---

## 2. Configuração no Ploomes (acesso admin, sem código)

O objetivo é ter **um campo no formulário para cada parâmetro** acima, marcado
para receber o valor da URL e gravar no Contato e/ou na Negociação.

### 2.1 Criar os campos personalizados

Em **Administração → Campos personalizados** (Contatos e Negociações), criar,
como texto simples:

```
utm_source            utm_source_first        gclid
utm_medium            utm_medium_first        fbclid
utm_campaign          utm_campaign_first       msclkid
utm_content           utm_content_first        utm_first_seen   (tipo data ou texto)
utm_term              utm_term_first           utm_first_referrer
origem_cta            plano_interesse          page_url
```

> Se já existem campos de UTM no CRM (a integração de 03/09 usava os 5 UTMs),
> **reaproveite** — não duplique. Só falta criar os `*_first`, os click IDs,
> `utm_first_seen`, `utm_first_referrer`.

Sugestão: agrupar todos num grupo "Origem / Marketing" e deixá-los **somente
leitura** na ficha, para ninguém editar à mão.

### 2.2 Mapear os campos no formulário

No editor do formulário (`forms.ploomes.com` → este formulário → Editar):

1. Adicionar cada campo ao formulário como **campo oculto** (hidden).
2. Em cada campo oculto, definir o **valor padrão a partir de parâmetro da
   URL** / "preencher pela URL", usando **exatamente** o nome do parâmetro da
   tabela 1 (sem `?`, sem espaços, minúsculas: `utm_source`, `utm_campaign_first`,
   `gclid`, …).
3. Garantir que o formulário **cria/atualiza Contato e Negociação** e que esses
   campos estão na lista de "campos gravados" da automação do formulário.
4. Se o Ploomes tiver limite de campos ocultos por formulário e faltar espaço,
   priorize nesta ordem: `utm_*_first` (5) → `utm_campaign`/`utm_source`
   efetivos → `gclid`/`fbclid` → `origem_cta`/`plano_interesse` → resto.

### 2.3 Deduplicação de contato

Se o mesmo e-mail já existir, configurar o formulário para **não sobrescrever**
`utm_*_first` e `utm_first_seen` quando já preenchidos (a primeira origem é
imutável). Os `utm_*` efetivos e `page_url` podem sobrescrever (last-touch).
No Ploomes isso costuma ser "atualizar campo somente se vazio".

---

## 3. Teste de ponta a ponta

1. Aba anônima. Abrir:
   `https://goinfinity.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=teste-infinity&gclid=TESTE123`
2. DevTools → Application → Local Storage → confirmar `infinity_utm_first`.
3. **Fechar a aba.** Reabrir `https://goinfinity.com.br/` (sem parâmetros).
4. Inspecionar o `<iframe id="ploomes-form">` → o `src` deve conter
   `utm_source=google` **e** `utm_source_first=google` **e** `utm_first_seen=...`.
5. Preencher e enviar o formulário.
6. No Ploomes, abrir o Contato/Negociação criado e conferir que todos os campos
   chegaram. Ajustar o mapeamento do que faltar e repetir.

---

## 4. Como usar no relatório de marketing

- **Verba por campanha:** relatório de Negociações agrupado por
  `utm_campaign_first` (não o efetivo) — mostra qual campanha *originou* o
  pipeline, mesmo que o lead tenha voltado pelo orgânico para fechar.
- **First vs. last touch:** comparar `utm_campaign_first` × `utm_campaign` para
  ver quanto do fechamento a última visita "rouba" da campanha original.
- **Janela de conversão:** `data de criação da negociação` − `utm_first_seen`.
- **Mídia paga:** cruzar `gclid` / `fbclid` com o relatório da plataforma de
  anúncio para custo real por lead e por negócio ganho.

---

## 5. Se o DPO pedir consentimento em vez de opt-out

A gravação persistente está isolada num único ponto do `script.js`
(`if (optedOut()) ... else if (Object.keys(fromUrl).length && ...) store.set(localStorage, FIRST_KEY, ...)`).
Trocar o opt-out por opt-in = não gravar até um `localStorage` de consentimento
existir, e trocar o botão da Política de Cookies por um banner na landing.
Ver `README.md` → "Decisão sobre consentimento".
