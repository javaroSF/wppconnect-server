FROM node:22.20.0-alpine AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json ./
RUN apk update && \
    apk add --no-cache \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    && rm -rf /var/cache/apk/*
RUN corepack enable && \
    yarn install --production && \
    yarn add sharp --ignore-engines && \
    yarn cache clean

FROM base AS build
WORKDIR /usr/src/wpp-server
COPY . .
RUN corepack enable && yarn build

FROM base
WORKDIR /usr/src/wpp-server/
RUN apk add --no-cache chromium
COPY . .
COPY --from=build /usr/src/wpp-server/ /usr/src/wpp-server/
EXPOSE 21465
CMD ["node", "dist/server.js"]