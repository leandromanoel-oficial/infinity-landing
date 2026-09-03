# =============================================================================
#  Infinity System — landing page estática
#  Imagem: build do dist/ com o build.py + nginx:alpine servindo em :80.
#  TLS, HSTS e os redirects (HTTP->HTTPS, www->apex) ficam no Traefik,
#  não aqui — ver docker-compose.prod.yml.
# =============================================================================

# ---- Estágio 1: monta o dist/ (mesmo build.py usado localmente) --------------
FROM python:3.12-alpine AS build
WORKDIR /src
COPY . .
# build.py só usa a stdlib. Gera /src/dist/ com as 5 páginas, styles.css,
# script.js, robots.txt, sitemap.xml e apenas os assets referenciados.
RUN python3 deploy/build.py

# ---- Estágio 2: nginx servindo o estático ------------------------------------
FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/ /usr/share/nginx/html/
EXPOSE 80
