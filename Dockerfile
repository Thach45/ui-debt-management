# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1 — Build: cài dependencies và biên dịch sang static assets
# -----------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2 — Serve: chỉ image nginx + thư mục dist (image nhỏ, không có Node)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS serve

COPY --from=build /app/dist /usr/share/nginx/html

# SPA + proxy /api → backend (cùng Docker network: service name `backend`)
RUN rm -f /etc/nginx/conf.d/default.conf && cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    listen [::]:80;
    root /usr/share/nginx/html;
    index index.html;

    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
