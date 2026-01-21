#!/bin/bash

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  上传代码到服务器${NC}"
echo -e "${GREEN}========================================${NC}"

# 配置（请修改这些值）
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-your-server-ip}"
SERVER_PATH="${SERVER_PATH:-~/lhjy}"

# 检查配置
if [ "$SERVER_HOST" = "your-server-ip" ]; then
    echo -e "${RED}错误: 请先配置服务器信息${NC}"
    echo -e "${YELLOW}编辑此脚本，修改以下变量：${NC}"
    echo "  SERVER_USER=your_username"
    echo "  SERVER_HOST=your_server_ip"
    echo "  SERVER_PATH=/path/on/server"
    echo ""
    echo -e "${YELLOW}或使用环境变量：${NC}"
    echo "  SERVER_USER=root SERVER_HOST=1.2.3.4 SERVER_PATH=~/lhjy ./upload-to-server.sh"
    exit 1
fi

echo -e "\n${YELLOW}[1/4] 打包项目文件...${NC}"
tar -czf lhjy.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=lhjy.tar.gz \
    --exclude=.env \
    --exclude=.env.local \
    . || {
    echo -e "${RED}✗ 打包失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 打包完成${NC}"

echo -e "\n${YELLOW}[2/4] 上传到服务器...${NC}"
scp lhjy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/ || {
    echo -e "${RED}✗ 上传失败${NC}"
    rm lhjy.tar.gz
    exit 1
}
echo -e "${GREEN}✓ 上传完成${NC}"

echo -e "\n${YELLOW}[3/4] 在服务器上解压...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    # 创建目录
    mkdir -p SERVER_PATH_PLACEHOLDER
    cd SERVER_PATH_PLACEHOLDER
    
    # 解压
    tar -xzf /tmp/lhjy.tar.gz
    rm /tmp/lhjy.tar.gz
    
    # 给脚本添加执行权限
    chmod +x deploy.sh
    
    echo "✓ 代码已解压到 $(pwd)"
ENDSSH

# 替换占位符
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH} && cd ${SERVER_PATH} && tar -xzf /tmp/lhjy.tar.gz && rm /tmp/lhjy.tar.gz && chmod +x deploy.sh" || {
    echo -e "${RED}✗ 解压失败${NC}"
    rm lhjy.tar.gz
    exit 1
}
echo -e "${GREEN}✓ 解压完成${NC}"

echo -e "\n${YELLOW}[4/4] 清理本地临时文件...${NC}"
rm lhjy.tar.gz
echo -e "${GREEN}✓ 清理完成${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  上传成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}接下来请执行：${NC}"
echo -e "${GREEN}ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
echo -e "${GREEN}cd ${SERVER_PATH}${NC}"
echo -e "${GREEN}# 配置环境变量${NC}"
echo -e "${GREEN}cp env.template .env${NC}"
echo -e "${GREEN}vim .env${NC}"
echo -e "${GREEN}# 执行部署${NC}"
echo -e "${GREEN}./deploy.sh${NC}"
