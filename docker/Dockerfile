# Builds the Jolt instance server. Run from the repository root:
#   docker build -f docker/Dockerfile -t jolt-server .
FROM node:24-bookworm-slim AS build
RUN corepack enable
WORKDIR /src
COPY . .
RUN pnpm install --frozen-lockfile --filter @getjolt/server... \
 && pnpm --filter @getjolt/protocol --filter @getjolt/server build

FROM node:24-bookworm-slim
ENV NODE_ENV=production JOLT_HOST=0.0.0.0 JOLT_PORT=4000 JOLT_DATABASE=/data/jolt.sqlite
WORKDIR /app
COPY --from=build /src /app
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "packages/server/dist/main.js"]
