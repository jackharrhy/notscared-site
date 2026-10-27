FROM platformatic/node-caged:26-slim AS base
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends ca-certificates \
    && update-ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS dependency-base
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
# V8 addons must use this runtime's pointer-compressed headers, not stock prebuilds.
ENV npm_config_build_from_source=true npm_config_nodedir=/usr/local npm_config_jobs=2

FROM dependency-base AS development-dependencies-env
RUN pnpm install --frozen-lockfile
COPY . .

FROM dependency-base AS production-dependencies-env
RUN pnpm install --frozen-lockfile --prod

FROM development-dependencies-env AS build-env
RUN pnpm run build

FROM base
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
CMD ["pnpm", "run", "start"]
