# 服务器部署指南

## 📋 前置要求

服务器需要安装：
- Git
- Docker
- Docker Compose（可选）

## 🚀 快速部署步骤

### 1. 登录服务器

```bash
ssh user@your-server-ip
```

### 2. 克隆代码仓库

```bash
# 首次部署
git clone <your-git-repo-url> lhjy
cd lhjy

# 更新部署（如果已经克隆过）
cd lhjy
git pull origin main
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（使用 vim 或 nano）
vim .env
```

填入实际的配置：
```env
TURSO_DATABASE_URL=libsql://hot-ppppm.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGci...（你的完整 token）
PORT=3000
```

### 4. 执行部署

#### 方法 A：使用部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

#### 方法 B：使用 Docker Compose

```bash
# 启动服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 方法 C：手动执行 Docker 命令

```bash
# 构建镜像
docker build -t lhjy-app .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name lhjy \
  --restart unless-stopped \
  lhjy-app
```

## 🔍 查看状态和日志

```bash
# 查看容器状态
docker ps

# 查看实时日志
docker logs -f lhjy

# 查看最近 100 行日志
docker logs --tail 100 lhjy
```

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新部署
./deploy.sh

# 或使用 docker-compose
docker-compose up -d --build
```

## 🛑 停止和删除

```bash
# 停止容器
docker stop lhjy

# 删除容器
docker rm lhjy

# 删除镜像
docker rmi lhjy-app

# 或使用 docker-compose
docker-compose down
docker-compose down --rmi all  # 同时删除镜像
```

## 🔐 Nginx 反向代理配置（可选）

如果需要配置域名和 HTTPS，创建 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker logs lhjy

# 检查容器状态
docker ps -a
```

### 环境变量问题

```bash
# 进入容器检查环境变量
docker exec -it lhjy sh
env | grep TURSO
```

### 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 3000

# 或使用 lsof
lsof -i:3000
```

### 重新构建（清除缓存）

```bash
docker build --no-cache -t lhjy-app .
```

## 📊 性能监控

```bash
# 查看容器资源使用情况
docker stats lhjy

# 查看容器详细信息
docker inspect lhjy
```

## 🔒 安全建议

1. **不要将 .env 文件提交到 Git**
   - 已经添加到 .gitignore

2. **使用防火墙限制访问**
   ```bash
   # 只允许特定 IP 访问（可选）
   ufw allow from <trusted-ip> to any port 3000
   ```

3. **定期更新依赖**
   ```bash
   # 本地更新依赖后推送
   npm update
   ```

## 📝 自动化部署（GitHub Actions 示例）

可以在 `.github/workflows/deploy.yml` 中配置自动部署：

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/lhjy
            git pull origin main
            ./deploy.sh
```
