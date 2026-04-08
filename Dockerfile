FROM node:22.20.0-slim AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install system libraries for sharp + chromium
RUN apt-get update && apt-get install -y \
    chromium \
    libvips-dev \
    libvips-tools \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

#COPY package.json yarn.lock ./
COPY package.json ./

# Install node dependencies including sharp
RUN yarn install --production --ignore-engines

# -------------------- BUILD STAGE --------------------
FROM base AS build
WORKDIR /usr/src/wpp-server
COPY . .
RUN yarn install --ignore-engines --production=false
RUN yarn build

# -------------------- FINAL IMAGE --------------------
FROM base
WORKDIR /usr/src/wpp-server

COPY --from=build /usr/src/wpp-server/ /usr/src/wpp-server/

EXPOSE 21465
CMD ["node", "dist/server.js"]