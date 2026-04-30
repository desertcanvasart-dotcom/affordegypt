# syntax=docker/dockerfile:1.6
# AffordEgypt — production image with build-time prerendering.
#
# We need Chromium at *build* time so @prerenderer/rollup-plugin can
# generate static HTML for the public marketing routes during `vite build`.
# At runtime the server is a plain Node/Express app — Chromium is unused.
FROM node:20-bookworm-slim

# Tell Puppeteer not to download its own Chromium — we use the apt-installed
# system binary at /usr/bin/chromium.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

# System packages: Chromium + the dependency set Puppeteer's troubleshooting
# guide recommends for Debian. `libgcc-s1` is the Bookworm name for the
# transition library; `libasound2` is correct on Bookworm (Trixie renamed
# it to libasound2t64).
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      ca-certificates \
      fonts-liberation \
      fonts-noto-color-emoji \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgbm1 \
      libgcc-s1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxss1 \
      libxtst6 \
      libxkbcommon0 \
      lsb-release \
      wget \
      xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy lockfiles first so the dependency layer caches across source changes.
# We need devDependencies (vite, esbuild, prerenderer plugin) for the build
# step, so use NODE_ENV=development for `npm ci`. We then prune in a later
# step to keep the runtime image lean.
COPY package.json package-lock.json ./
RUN NODE_ENV=development npm ci --include=dev

# Copy the rest of the source.
COPY . .

# Build: vite build (which runs the prerenderer plugin via Chromium) +
# esbuild bundle of the Express server.
RUN npm run build

# Drop devDependencies now that the build is done.
RUN npm prune --omit=dev && npm cache clean --force

EXPOSE 5000

CMD ["npm", "start"]
