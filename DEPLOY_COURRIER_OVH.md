# Guide de Déploiement - prototype_courrier sur OVH

## Configuration du projet

- **Nom du projet**: `prototype_courrier`
- **Port**: `3400` (différent de prototype_snel qui utilise 3399)
- **Repository GitHub**: `git@github.com:shadjava2/prototype_courrier.git`
- **Répertoire sur OVH**: `/opt/prototype_courrier`

## Instructions de déploiement sur OVH

### Option 1: Utilisation du script de déploiement automatique

```bash
# Se connecter au serveur OVH
ssh ubuntu@pacs-server

# Télécharger le script de déploiement
cd /opt
wget https://raw.githubusercontent.com/shadjava2/prototype_snel/main/deploy.sh
chmod +x deploy.sh

# Exécuter le déploiement pour prototype_courrier
./deploy.sh prototype_courrier 3400 git@github.com:shadjava2/prototype_courrier.git main
```

### Option 2: Déploiement manuel

#### 1. Se connecter au serveur OVH

```bash
ssh ubuntu@pacs-server
```

#### 2. Cloner le repository

```bash
cd /opt
git clone git@github.com:shadjava2/prototype_courrier.git
cd prototype_courrier
```

#### 3. Vérifier/Créer les fichiers Docker

Assurez-vous que les fichiers suivants existent dans le projet :

**docker-compose.yml** (à créer si absent):
```yaml
services:
  courrier-proto:
    build: .
    container_name: courrier-proto
    ports:
      - "3400:3000" # hôte:conteneur (port 3400 sur le serveur OVH)
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

**Dockerfile** (à créer si absent):
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

**package.json** - Vérifier que le script `start` existe:
```json
{
  "scripts": {
    "start": "next start -p 3000"
  }
}
```

#### 4. Construire et lancer avec Docker Compose

```bash
# Construire l'image et lancer le conteneur
docker compose up -d --build

# Vérifier que le conteneur tourne
docker compose ps

# Voir les logs
docker compose logs -f courrier-proto
```

#### 5. Configurer le firewall

```bash
# Ouvrir le port 3400
sudo ufw allow 3400/tcp
sudo ufw reload

# Vérifier que le port est ouvert
sudo ufw status | grep 3400
```

#### 6. Vérifier que l'application fonctionne

L'application devrait être accessible sur : `http://91.134.44.14:3400`

## Commandes utiles

### Mise à jour de l'application

```bash
cd /opt/prototype_courrier
git pull origin main
docker compose up -d --build
```

### Gestion des conteneurs

```bash
# Arrêter les conteneurs
docker compose down

# Redémarrer les conteneurs
docker compose restart

# Voir les logs en temps réel
docker compose logs -f courrier-proto

# Entrer dans le conteneur (debug)
docker exec -it courrier-proto sh

# Vérifier l'utilisation des ressources
docker stats courrier-proto
```

### Vérification des ports utilisés

```bash
# Vérifier quels ports sont utilisés
sudo netstat -tulpn | grep -E '3399|3400'

# Vérifier les conteneurs Docker actifs
docker ps
```

## Structure des projets sur OVH

```
/opt/
├── prototype_snel/          (port 3399)
│   ├── docker-compose.yml
│   └── ...
└── prototype_courrier/       (port 3400)
    ├── docker-compose.yml
    └── ...
```

## Troubleshooting

### Le conteneur ne démarre pas

```bash
# Vérifier les logs détaillés
docker compose logs courrier-proto

# Vérifier que le port 3400 n'est pas déjà utilisé
sudo netstat -tulpn | grep 3400

# Vérifier les erreurs de build
docker compose build --no-cache
```

### L'application ne répond pas

```bash
# Vérifier que le conteneur tourne
docker ps | grep courrier-proto

# Redémarrer le conteneur
docker compose restart courrier-proto

# Vérifier les logs d'erreur
docker compose logs courrier-proto | grep -i error
```

### Problème de permissions

```bash
# Donner les permissions au répertoire
sudo chown -R $USER:$USER /opt/prototype_courrier
```

### Conflit de réseau Docker

Si vous avez des problèmes de réseau, vérifiez que chaque projet utilise son propre réseau :

```bash
# Lister les réseaux Docker
docker network ls

# Vérifier que courrier-network existe
docker network inspect courrier-network
```

## Configuration Nginx (optionnel - reverse proxy)

Si vous voulez utiliser un domaine au lieu du port :

```nginx
# /etc/nginx/sites-available/courrier
server {
    listen 80;
    server_name courrier.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3400;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis activer :
```bash
sudo ln -s /etc/nginx/sites-available/courrier /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

