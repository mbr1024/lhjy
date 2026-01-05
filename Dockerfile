# 多阶段构建 Dockerfile

# 第一阶段：构建应用
FROM node:20-alpine AS builder
WORKDIR /app

# 声明接收 build-args 传入的变量
ARG GEMINI_API_KEY
# 如果你使用的是 Vite，通常需要以 VITE_ 开头才能注入到前端代码
ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM nginx:alpine

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物到 Nginx 静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

