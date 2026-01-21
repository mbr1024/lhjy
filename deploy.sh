#!/bin/bash

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  LHJY Docker 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${RED}错误: .env 文件不存在${NC}"
    echo -e "${YELLOW}请创建 .env 文件并添加以下环境变量：${NC}"
    echo "TURSO_DATABASE_URL=your_database_url"
    echo "TURSO_AUTH_TOKEN=your_auth_token"
    exit 1
fi

# 加载环境变量
source .env

# 检查必需的环境变量
if [ -z "$TURSO_DATABASE_URL" ] || [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo -e "${RED}错误: TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN 未设置${NC}"
    exit 1
fi

# 容器和镜像名称
CONTAINER_NAME="lhjy"
IMAGE_NAME="lhjy-app"
PORT="${PORT:-3000}"

echo -e "\n${YELLOW}[1/5] 停止并删除旧容器...${NC}"
if docker ps -a | grep -q $CONTAINER_NAME; then
    docker stop $CONTAINER_NAME 2>/dev/null
    docker rm $CONTAINER_NAME 2>/dev/null
    echo -e "${GREEN}✓ 旧容器已删除${NC}"
else
    echo -e "${GREEN}✓ 无旧容器需要删除${NC}"
fi

echo -e "\n${YELLOW}[2/5] 删除旧镜像...${NC}"
if docker images | grep -q $IMAGE_NAME; then
    docker rmi $IMAGE_NAME 2>/dev/null
    echo -e "${GREEN}✓ 旧镜像已删除${NC}"
else
    echo -e "${GREEN}✓ 无旧镜像需要删除${NC}"
fi

echo -e "\n${YELLOW}[3/5] 构建新镜像...${NC}"
docker build -t $IMAGE_NAME . || {
    echo -e "${RED}✗ 镜像构建失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 镜像构建成功${NC}"

echo -e "\n${YELLOW}[4/5] 启动容器...${NC}"
docker run -d \
    -p $PORT:3000 \
    --env-file .env \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    $IMAGE_NAME || {
    echo -e "${RED}✗ 容器启动失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 容器启动成功${NC}"

echo -e "\n${YELLOW}[5/5] 等待服务就绪...${NC}"
sleep 3

# 检查容器状态
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✓ 服务运行正常${NC}"
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "访问地址: ${GREEN}http://localhost:$PORT${NC}"
    echo -e "\n查看日志: ${YELLOW}docker logs -f $CONTAINER_NAME${NC}"
    echo -e "停止服务: ${YELLOW}docker stop $CONTAINER_NAME${NC}"
else
    echo -e "${RED}✗ 容器启动失败，查看日志：${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi
