<<<<<<< HEAD
# ============================================================
#  ORDER SERVICE — Dockerfile
# ============================================================

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
=======
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
>>>>>>> 66dea240831aa9ba4ca674ce8a64d1d7f9647c36
COPY . .
EXPOSE 3003
CMD ["node", "src/index.js"]