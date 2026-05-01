# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем projects.json в публичную директорию
COPY --from=builder /app/projects.json /usr/share/nginx/html/projects.json

# Настройка Nginx для SPA с prerendered страницами и API proxy
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Проксирование API запросов на backend \
    location /api/ { \
        proxy_pass http://chat-backend:8000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_read_timeout 90; \
    } \
    \
    # JSON файлы отдаём как application/json \
    location ~ \\.json$ { \
        add_header Content-Type application/json; \
        add_header Cache-Control "no-cache"; \
        try_files $uri =404; \
    } \
    \
    # Для всех остальных маршрутов \
    location / { \
        # Сначала пытаемся найти точный файл, потом директорию с index.html, потом fallback на корневой index.html \
        try_files $uri $uri/index.html /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
