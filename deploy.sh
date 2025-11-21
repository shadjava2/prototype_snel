#!/bin/bash

# Script de déploiement générique pour projets Next.js sur OVH
# Usage: ./deploy.sh [PROJECT_NAME] [PORT] [GIT_REPO_URL] [BRANCH]

set -e  # Arrêter en cas d'erreur

# Configuration par défaut (peut être surchargée par les arguments)
PROJECT_NAME=${1:-"prototype_snel"}
PORT=${2:-"3399"}
GIT_REPO_URL=${3:-"git@github.com:shadjava2/prototype_snel.git"}
BRANCH=${4:-"main"}
BASE_DIR="/opt"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Déploiement: ${PROJECT_NAME}${NC}"
echo -e "${GREEN}Port: ${PORT}${NC}"
echo -e "${GREEN}Repository: ${GIT_REPO_URL}${NC}"
echo -e "${GREEN}========================================${NC}"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Erreur: Docker n'est pas installé${NC}"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Erreur: Docker Compose n'est pas installé${NC}"
    exit 1
fi

PROJECT_DIR="${BASE_DIR}/${PROJECT_NAME}"

# Créer le répertoire si nécessaire
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Clonage du repository...${NC}"
    mkdir -p "$BASE_DIR"
    cd "$BASE_DIR"
    git clone "$GIT_REPO_URL" "$PROJECT_NAME"
    cd "$PROJECT_DIR"
else
    echo -e "${YELLOW}Mise à jour du code...${NC}"
    cd "$PROJECT_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
fi

# Vérifier que docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Erreur: docker-compose.yml introuvable${NC}"
    exit 1
fi

# Arrêter les conteneurs existants
echo -e "${YELLOW}Arrêt des conteneurs existants...${NC}"
docker compose down 2>/dev/null || true

# Construire et lancer
echo -e "${YELLOW}Construction de l'image Docker...${NC}"
docker compose up -d --build

# Attendre quelques secondes pour que le conteneur démarre
sleep 5

# Vérifier le statut
echo -e "${YELLOW}Vérification du statut...${NC}"
docker compose ps

# Afficher les logs récents
echo -e "${YELLOW}Derniers logs:${NC}"
docker compose logs --tail=50

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Déploiement terminé!${NC}"
echo -e "${GREEN}Application accessible sur: http://$(hostname -I | awk '{print $1}'):${PORT}${NC}"
echo -e "${GREEN}========================================${NC}"

