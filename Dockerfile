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

# Копируем projects.json в публичную директорию (доступен через fetch('/projects.json'))
COPY --from=builder /app/public/projects.json /usr/share/nginx/html/projects.json

# Настройка Nginx для SPA + API proxy
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # return-bot демо-виджет — должен быть ВЫШЕ общего /api/, иначе nginx не дойдёт \
    location /api/return-bot/ { \
        proxy_pass http://return-bot:8000/api/return-bot/; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_read_timeout 60; \
    } \
    \
    # Портфолио AI-чат бэкенд \
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
    # JSON файлы — без кэша \
    location ~ \\.json$ { \
        add_header Content-Type application/json; \
        add_header Cache-Control "no-cache"; \
        try_files $uri =404; \
    } \
    \
    # SPA — все маршруты на index.html \
    location / { \
        try_files $uri $uri/index.html /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
