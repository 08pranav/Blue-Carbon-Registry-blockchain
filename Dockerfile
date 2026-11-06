# Blue Carbon Registry: one image that serves the web app and the API.
#   docker build -t blue-carbon-registry .
#   docker run --rm -p 3000:3001 blue-carbon-registry     # then open http://localhost:3000
#
# The web app is built for the Sepolia test network (the default). Connect MetaMask on Sepolia.
# The backend keeps its data in memory, so projects and listings reset when the container restarts.

# ---- build the frontend ------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime: Express serves /api, /uploads and the built frontend ------------------------
FROM node:20-alpine
ENV NODE_ENV=production \
    PORT=3001 \
    STATIC_DIR=/app/dist \
    UPLOADS_DIR=/data/uploads
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev && npm cache clean --force
COPY backend/ ./backend/
COPY --from=build /app/dist ./dist

RUN addgroup -S app && adduser -S app -G app \
 && mkdir -p /data/uploads && chown -R app:app /data
USER app

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "backend/server.js"]
