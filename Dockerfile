# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
# Do NOT set NODE_ENV=production before npm ci: the variant bins run the TS
# sources via `tsx` (a devDependency), so devDependencies must be present.
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ src/
COPY packages/ packages/
COPY server.mjs ./
ENV MCP_VARIANT=diagnostic \
    MCP_PORT=8000
EXPOSE 8000
ENTRYPOINT ["node", "server.mjs"]
