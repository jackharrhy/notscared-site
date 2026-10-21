FROM node:24.22.1-alpine@sha256:6a1c190e17215d844926b0677f4bf87273ff7d5e54db06d3b5b5863ab0b09a3d AS base
RUN apk upgrade --no-cache && apk add --no-cache ca-certificates && update-ca-certificates
RUN npm install -g pnpm@10.34.3
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS dependency-base
RUN apk add --no-cache python3 make g++

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
