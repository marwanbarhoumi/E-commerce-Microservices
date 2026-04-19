FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install && chmod +x node_modules/.bin/vite
COPY . .
RUN node node_modules/vite/bin/vite.js build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]