# Template de Configuration pour Nouveau Projet

Ce guide vous permet de configurer rapidement un nouveau projet Next.js pour le déploiement sur OVH avec Docker.

## Fichiers à créer/copier dans votre nouveau projet

### 1. Dockerfile

Créez un fichier `Dockerfile` à la racine du projet :

```dockerfile
# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./

# Next.js par défaut sur 3000 dans le conteneur
EXPOSE 3000

CMD ["npm", "start"]
```

### 2. docker-compose.yml

Créez un fichier `docker-compose.yml` à la racine du projet :

**Important**: Remplacez les valeurs suivantes :
- `PROJECT_NAME`: Nom unique de votre projet (ex: `courrier-proto`, `snel-proto`)
- `CONTAINER_NAME`: Nom unique du conteneur
- `PORT`: Port unique sur le serveur (ex: `3400`, `3401`, etc.)
- `NETWORK_NAME`: Nom unique du réseau Docker

```yaml
services:
  PROJECT_NAME:
    build: .
    container_name: CONTAINER_NAME
    ports:
      - "PORT:3000" # hôte:conteneur
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - NETWORK_NAME

networks:
  NETWORK_NAME:
    driver: bridge
    name: NETWORK_NAME
```

**Exemple pour prototype_courrier**:
```yaml
services:
  courrier-proto:
    build: .
    container_name: courrier-proto
    ports:
      - "3400:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - courrier-network

networks:
  courrier-network:
    driver: bridge
    name: courrier-network
```

### 3. package.json

Assurez-vous que votre `package.json` contient le script `start` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
```

### 4. .dockerignore (optionnel mais recommandé)

Créez un fichier `.dockerignore` pour optimiser le build :

```
node_modules
.next
.git
.gitignore
README.md
.env.local
.env*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### 5. .gitignore

Assurez-vous que votre `.gitignore` inclut :

```
node_modules
.next
.env*.local
.DS_Store
*.log
```

## Script de déploiement

Copiez le fichier `deploy.sh` dans votre projet ou utilisez-le depuis le repository prototype_snel :

```bash
# Depuis votre nouveau projet
wget https://raw.githubusercontent.com/shadjava2/prototype_snel/main/deploy.sh
chmod +x deploy.sh
```

## Checklist avant le déploiement

- [ ] `Dockerfile` créé et configuré
- [ ] `docker-compose.yml` créé avec un nom de projet unique
- [ ] Port unique choisi (vérifier qu'il n'est pas déjà utilisé)
- [ ] `package.json` contient le script `start`
- [ ] `.dockerignore` créé (optionnel)
- [ ] Projet testé localement avec `npm run build`
- [ ] Repository GitHub créé et code poussé

## Déploiement sur OVH

### Première fois

```bash
# Sur le serveur OVH
cd /opt
./deploy.sh PROJECT_NAME PORT GIT_REPO_URL main
```

**Exemple**:
```bash
./deploy.sh prototype_courrier 3400 git@github.com:shadjava2/prototype_courrier.git main
```

### Mises à jour

```bash
cd /opt/PROJECT_NAME
git pull origin main
docker compose up -d --build
```

## Ports recommandés

Pour éviter les conflits, utilisez cette liste de ports :

- `3399` - prototype_snel (déjà utilisé)
- `3400` - prototype_courrier
- `3401` - Projet suivant
- `3402` - Projet suivant
- etc.

## Vérification des ports utilisés

```bash
# Sur le serveur OVH
sudo netstat -tulpn | grep -E '3399|3400|3401'
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

## Structure recommandée sur OVH

```
/opt/
├── deploy.sh                    # Script de déploiement partagé
├── prototype_snel/              (port 3399)
│   ├── docker-compose.yml
│   └── ...
└── prototype_courrier/          (port 3400)
    ├── docker-compose.yml
    └── ...
```

## Notes importantes

1. **Noms uniques**: Chaque projet doit avoir un nom de service, conteneur et réseau unique dans `docker-compose.yml`
2. **Ports uniques**: Chaque projet doit utiliser un port différent sur le serveur
3. **Réseaux isolés**: Chaque projet utilise son propre réseau Docker pour éviter les conflits
4. **Git**: Assurez-vous que votre clé SSH est configurée sur le serveur OVH pour cloner les repositories privés

