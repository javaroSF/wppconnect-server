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

# To make sure yarn 4 uses node-modules linker
COPY .yarnrc.yml ./

# Copy only package.json to leverage Docker cache
COPY package.json ./
COPY yarn.lock ./
# Yarn resolutions reference these reviewed local artifacts during the first
# install, so they must be present before dependency resolution begins.
COPY vendor/deepmerge-4.3.2+wppconnect.1.tgz vendor/
COPY vendor/wppconnect-minimatch-legacy-compat-1.0.3.tgz vendor/

# Enable corepack and prepare yarn 4.14.1
RUN corepack enable && \
    corepack prepare yarn@4.14.1 --activate

# Install dependencies with immutable lockfile
RUN yarn install --immutable

FROM base AS build
WORKDIR /usr/src/wpp-server
COPY . .
RUN NODE_ENV=development yarn install --immutable && yarn build

FROM base
WORKDIR /usr/src/wpp-server/
RUN apk add --no-cache chromium && test -x /usr/bin/chromium-browser
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY . .
COPY --from=build /usr/src/wpp-server/ /usr/src/wpp-server/
EXPOSE 21465
CMD ["node", "dist/server.js"]
