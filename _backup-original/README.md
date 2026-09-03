# Infinity System — Landing Page Refrisat

Landing one-page estática pronta para integração ao WordPress ou publicação como página independente.

## Arquivos

- `index.html` — estrutura completa da landing.
- `styles.css` — layout responsivo desktop/tablet/mobile.
- `script.js` — menu mobile, animações, CTA único, contexto de plano e persistência UTM.
- `assets/` — logos, screenshots reais extraídos do material fornecido e imagens de apoio.

## CTA / Ploomes

Todos os botões comerciais apontam para `#contato` e usam o mesmo formulário:

`https://forms.ploomes.com/form/4e3b3aabeecc45ac935a021d79d59610?iframe=true`

O JavaScript acrescenta ao iframe, quando disponíveis:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `first_utm_*` para primeira origem
- `origem_cta`
- `plano_interesse`
- `landing_page`
- `page_url`

### Atenção importante sobre Ploomes

A landing já preserva e envia os parâmetros na URL do iframe. Para que esses valores sejam efetivamente gravados nos campos do CRM, os campos correspondentes devem existir no formulário/Ploomes e o comportamento de prefill por query string precisa ser validado na configuração do formulário. Como o iframe é de outro domínio, a landing não pode preencher campos internos diretamente por JavaScript (same-origin policy).

A documentação oficial do Ploomes confirma suporte a campos personalizados, campos invisíveis e regras de formulário, mas a documentação pública consultada não confirmou a convenção específica de preenchimento de formulário externo por query string. Portanto, esse mapeamento deve ser testado antes da publicação.

## Planos

A página usa a estrutura mais recente fornecida:

- Exclusive — R$ 299/mês — R$ 3.588/ano
- Energy — R$ 399/mês — R$ 4.788/ano
- Medical — R$ 399/mês — R$ 4.788/ano
- Plant Control — a partir de R$ 999/mês — R$ 11.988/ano

O mensal tem maior hierarquia visual e o anual aparece como referência secundária.

## Claims que devem ser validados antes de publicar

Não foram colocadas como promessa explícita na landing as afirmações quantitativas ainda não validadas, como:

- redução de curva de aprendizado em 70%;
- disponibilidade +20% a +60%;
- redução de manutenção -10% a -40%;
- eficiência energética -5% a -20%;
- ROI em poucos meses;
- SLA 99,99%;
- machine learning preditivo como promessa de produto.

## Deploy rápido

### Página estática

Publique o conteúdo da pasta no document root do domínio/subdomínio.

### WordPress

Há duas opções recomendadas:

1. criar um template de página customizado e separar HTML/CSS/JS nos arquivos do tema/child theme; ou
2. adaptar o HTML para um bloco/template do construtor utilizado, mantendo CSS e JS próprios.

Evite colar a página inteira em um único bloco HTML se a intenção for manutenção de longo prazo.

## Testes finais obrigatórios

1. CTA de Hero → `#contato`.
2. CTA de cada plano → mesmo `#contato`.
3. `plano_interesse` muda conforme o botão clicado.
4. UTMs permanecem no iframe Ploomes.
5. Testar envio real e verificar campos no Ploomes.
6. Validar responsividade em 1920, 1440, 1366, tablet e celular.
7. Testar Chrome, Edge e Safari/iOS.
8. Configurar GTM/GA4 se aprovado e ligar o evento `infinity_cta_click`.
9. Validar Política de Privacidade e consentimento LGPD/cookies conforme os scripts instalados.
