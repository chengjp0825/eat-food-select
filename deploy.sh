#!/bin/bash
# ============================================
# 美食分享站部署脚本
# ============================================

set -e

# 配置
IMAGE_NAME="ghcr.io/chengjp/food-select"
CONTAINER_NAME="food-select"
PORT=80

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    log_info "Docker 环境检查通过"
}

# 登录 GitHub Container Registry
login_ghcr() {
    log_info "登录 GitHub Container Registry..."
    # 使用 GitHub Token 登录 (需要设置 GITHUB_TOKEN 环境变量)
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
    else
        log_warn "未设置 GITHUB_TOKEN，将使用公开镜像"
    fi
}

# 拉取最新镜像
pull_image() {
    log_info "拉取最新镜像..."
    docker pull ${IMAGE_NAME}:latest || {
        log_error "拉取镜像失败"
        exit 1
    }
    log_info "镜像拉取成功"
}

# 停止并删除旧容器
remove_old_container() {
    if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
        log_info "停止旧容器..."
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
    fi
}

# 启动新容器
start_container() {
    log_info "启动新容器..."

    # 检查是否有 docker-compose
    if [ -f docker-compose.yml ]; then
        DOCKER_USERNAME=${DOCKER_USERNAME:-chengjp} docker-compose up -d
    else
        docker run -d \
            --name ${CONTAINER_NAME} \
            --restart unless-stopped \
            -p ${PORT}:80 \
            -e TZ=Asia/Shanghai \
            ${IMAGE_NAME}:latest
    fi

    log_info "容器启动成功"
}

# 检查容器状态
check_status() {
    log_info "检查容器状态..."
    docker ps -a | grep ${CONTAINER_NAME} || true

    # 健康检查
    sleep 3
    if curl -sf http://localhost:${PORT}/health > /dev/null 2>&1; then
        log_info "✅ 服务运行正常"
    else
        log_warn "⚠️ 健康检查失败，请检查容器日志"
        docker logs ${CONTAINER_NAME} --tail 20
    fi
}

# 查看日志
show_logs() {
    docker logs -f ${CONTAINER_NAME}
}

# 显示使用帮助
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy    部署/更新应用 (默认)"
    echo "  logs      查看日志"
    echo "  restart   重启容器"
    echo "  stop      停止容器"
    echo "  status    查看状态"
    echo ""
}

# 主流程
main() {
    case "${1:-deploy}" in
        deploy)
            check_docker
            login_ghcr
            pull_image
            remove_old_container
            start_container
            check_status
            ;;
        logs)
            show_logs
            ;;
        restart)
            docker restart ${CONTAINER_NAME}
            check_status
            ;;
        stop)
            docker stop ${CONTAINER_NAME}
            ;;
        status)
            docker ps -a | grep ${CONTAINER_NAME}
            ;;
        *)
            show_help
            ;;
    esac
}

main "$@"
