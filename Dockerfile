FROM node:24-alpine AS base
RUN apk upgrade --no-cache && apk add --no-cache ca-certificates && update-ca-certificates
RUN npm install -g pnpm@10
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
