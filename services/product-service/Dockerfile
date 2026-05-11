<<<<<<< HEAD
# ============================================================
#  PRODUCT SERVICE — Dockerfile
# ============================================================

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3002
=======
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3003
>>>>>>> 66dea240831aa9ba4ca674ce8a64d1d7f9647c36
CMD ["node", "src/index.js"]