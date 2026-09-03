# Migração da landing para a VPS da Refrisat / HBR Holding

> **Status: concluída em 03/09/2026.** `https://goinfinity.com.br` serve da VPS
> `72.61.44.210` (nginx do host + certbot). Cert Let's Encrypt `CN=goinfinity.com.br`
> emitido, redirect HTTP→HTTPS ativo, headers de segurança conferidos,
> `refrisizing.refrisat.com.br` intacto. DNS autoritativo (Registro.br) e
> resolvers públicos já apontam para o IP novo. Este doc fica como referência do
> que foi feito e de como republicar.

Origem: VPS `nnoconn.com.br` (187.127.41.11), Portainer Git Stack + Traefik.
Destino: VPS `srv1202507.hstgr.cloud` (Hostinger) da Refrisat.
Domínio: **continua `goinfinity.com.br`**, só repontando o DNS.
Repositório: `https://github.com/hbr-holding/infinity-landing` (privado; a VPS
clona por **deploy key** read-only — `~/.ssh/infinity_deploy`, alias
`github-infinity` no `~/.ssh/config` da VPS).

## Retrato da VPS de destino (inspecionado em 03/09/2026)

| Item | Situação |
|---|---|
| IPv4 | **`72.61.44.210`** — destino do registro `A` |
| IPv6 | `2a02:4780:66:6153::1` existe, mas o nginx só escuta IPv4 — **não criar `AAAA`** |
| SO / recursos | Ubuntu 24.04 · 1 vCPU · 3.9 GB RAM · **sem swap** · 44 GB livres |
| Docker | 29.6.1 + Compose v5.3.1 · git 2.43 |
| Reverse proxy | **nginx 1.24 no host** (fora do Docker), escuta `0.0.0.0:80` e `:443` |
| TLS | **certbot** (plugin `--nginx`), renovação por `certbot.timer` (systemd) |
| Já em produção | `refrisizing.refrisat.com.br` → proxy p/ `127.0.0.1:3100` (container `refrisizing-backend-1`) + Postgres 16. Streamlit avulso em `:8501`. |
| Vhosts nginx | só o `sites-available/default` (editado, com vários backups). **Não mexer nele** — a landing entra em arquivo próprio. |
| Porta livre p/ o container | `127.0.0.1:8081` |
| Não tem | Traefik, Portainer, Nginx Proxy Manager |

Modelo a seguir: o mesmo do `refrisizing` — repo em `/opt`, `docker compose`
buildando a imagem, nginx do host fazendo proxy + TLS.

## Arquivos deste repo usados na migração

| Arquivo | Papel |
|---|---|
| `docker-compose.host-nginx.yml` | sobe o container publicando em `127.0.0.1:8081`, sem Traefik |
| `deploy/goinfinity-proxy.conf` | vhost do nginx do host (proxy → `:8081` + cabeçalhos de segurança) |
| `deploy/Dockerfile` | build do `dist/` (build.py em `python:3.12-alpine`) + `nginx:alpine` |
| `deploy/nginx.conf` | server block **interno do container** (rota sem `.html`, 404, cache, gzip) |

`docker-compose.prod.yml` e `deploy/goinfinity.conf` são do modelo antigo
(Traefik / nginx servindo arquivo direto) — **não são usados aqui**.

---

## Passo a passo

### 1. Código na VPS

```bash
sudo git clone https://github.com/hbr-holding/infinity-landing.git /opt/infinity-landing
cd /opt/infinity-landing
```

### 2. Subir o container (ainda sem tráfego público)

```bash
docker compose -f docker-compose.host-nginx.yml up -d --build
# teste local — deve responder 200 e o HTML da landing:
curl -si -H 'Host: goinfinity.com.br' http://127.0.0.1:8081/ | head -20
curl -s  -H 'Host: goinfinity.com.br' http://127.0.0.1:8081/politica-de-privacidade -o /dev/null -w 'sem .html -> %{http_code}\n'
```

### 3. Instalar o vhost no nginx do host (HTTP só)

```bash
sudo cp /opt/infinity-landing/deploy/goinfinity-proxy.conf /etc/nginx/sites-available/goinfinity.com.br
sudo ln -s ../sites-available/goinfinity.com.br /etc/nginx/sites-enabled/goinfinity.com.br
sudo nginx -t && sudo systemctl reload nginx
# teste pelo IP, sem depender do DNS:
curl -si --resolve goinfinity.com.br:80:72.61.44.210 http://goinfinity.com.br/ | head -20
```

Isso **não afeta** o `refrisizing` — o nginx roteia por `server_name`.

### 4. Virada de DNS (Registro.br)

Hoje: `A goinfinity.com.br → 187.127.41.11`, sem `AAAA`.

1. Baixar o TTL do registro `A` para `300` e esperar o TTL antigo expirar.
2. Trocar: `A goinfinity.com.br → 72.61.44.210`. **Não criar `AAAA`.**
3. Aguardar a propagação nos dois lados:
   ```bash
   dig +short goinfinity.com.br A          # deve virar 72.61.44.210
   ```
   A VPS antiga continua servindo enquanto propaga — não desligar nada lá ainda.

### 5. Emitir o certificado (na VPS de destino, após o DNS propagar)

```bash
sudo certbot --nginx -d goinfinity.com.br --redirect \
  -m <email-real> --agree-tos --no-eff-email
```

O certbot: emite o cert (HTTP-01 na :80), adiciona o bloco `443` copiando os
`add_header` do `:80`, converte o `:80` em `301 → https`, e a renovação já entra
no `certbot.timer` existente.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Validação

```bash
curl -sI https://goinfinity.com.br/                       # 200 + Strict-Transport-Security
curl -sI http://goinfinity.com.br/                        # 301 -> https
curl -s  https://goinfinity.com.br/termos-de-uso -o /dev/null -w '%{http_code}\n'   # 200 (sem .html)
curl -sI https://goinfinity.com.br/nao-existe             # 404 (404.html próprio)
curl -sI https://goinfinity.com.br/ | grep -i content-security-policy
echo | openssl s_client -connect goinfinity.com.br:443 -servername goinfinity.com.br 2>/dev/null \
  | openssl x509 -noout -issuer -dates
```

- Abrir a página no navegador: formulário Ploomes (iframe), fontes, menu, logos.
- Rodar os itens 13–18 do `README.md` (checklist pós-publicação).
- Confirmar que `https://refrisizing.refrisat.com.br` continua de pé.

### 7. Desativar na VPS antiga (só depois da validação)

- Portainer (`nnoconn`) → Stacks → `infinity-landing` → **Remove**.
- Atualizar `README.md` / memória com o novo destino e este fluxo.

---

## Republicação, daqui pra frente

```bash
cd /opt/infinity-landing && git pull && \
  docker compose -f docker-compose.host-nginx.yml up -d --build
```

O HTML é revalidado sempre (`Cache-Control: no-cache` no `deploy/nginx.conf`),
então publicação nova aparece na hora. CSS/JS/imagens têm cache de 30 dias — pra
forçar atualização, renomeie o arquivo.

## Notas

- **1 vCPU + sem swap.** O build é leve (script stdlib + copy), mas roda em série
  com o `refrisizing`. Se faltar memória num rebuild, subir um swapfile de 1–2 GB
  antes (`fallocate -l 2G /swapfile`…).
- **Cabeçalhos moram no vhost do host** (`goinfinity-proxy.conf`), não no
  `deploy/nginx.conf` do container. Mexeu na CSP → mexe lá, e provavelmente na
  Política de Cookies.
- **HSTS 1 ano.** Uma vez servido, o navegador força HTTPS em `goinfinity.com.br`
  por 12 meses. Só validar depois que o HTTPS estiver redondo no destino.
- **Sem `AAAA`.** O nginx do host não escuta IPv6; um `AAAA` publicado faz o
  Let's Encrypt tentar validar por IPv6 e falhar a emissão.
- **Portainer no futuro (opcional).** Se a Refrisat instalar Portainer, dá pra
  importar como Git Stack apontando pro `docker-compose.host-nginx.yml` e ganhar
  o botão "Pull and redeploy". O fluxo por SSH acima continua valendo.
