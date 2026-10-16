FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir -p data && chown node:node data
COPY --chown=node:node server.js ./
COPY --chown=node:node public ./public
USER node
ENV NODE_ENV=production PORT=3000 RKS_DATA_DIR=/app/data
EXPOSE 3000
CMD ["node","server.js"]
