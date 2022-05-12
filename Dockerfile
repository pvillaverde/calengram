FROM node:15-alpine
LABEL maintainer="Pablo Villaverde <https://github.com/pvillaverde>"
## Instalar fontes para soportar emojis
RUN apk add --update  --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig
## Instalar librerías gráficas para a edición das imaxes (node-canvas, node-gpy)
RUN apk add --no-cache libc6-compat \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
## Instalación de tzdata e establecer a hora local a Madrid
    tzdata 
ENV TZ Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2
## Install App dependencies
## Using wildcard to copy both package.json and package-lock.json
## This forces Docker not to use cache when we change our dependencies
ADD package*.json /tmp/
RUN cd /tmp && apk add --no-cache --virtual .build-deps \
    make \
    g++ \
	python \
	&& npm install && apk del .build-deps
RUN mkdir -p /opt/calengram && cp -a /tmp/node_modules /opt/calengram
## Now we copy our App source code, having the dependencies previously cached if possible.
ADD ./app/fonts/* /usr/share/fonts/
WORKDIR /opt/calengram
ADD . /opt/calengram

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s \
      CMD node app/healthcheck.js

CMD [ "node", "app/index.js" ]