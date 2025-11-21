# Installation Docker et Docker Compose sur Ubuntu (OVH)

## Installation de Docker

```bash
# 1. Mettre à jour les paquets
sudo apt update

# 2. Installer les prérequis
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 3. Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 4. Ajouter le repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 6. Démarrer Docker
sudo systemctl start docker
sudo systemctl enable docker

# 7. Vérifier l'installation
sudo docker --version
```

## Installation de Docker Compose

```bash
# Installer Docker Compose (version 2.x - recommandée)
sudo apt install -y docker-compose-plugin

# OU installer la version standalone (alternative)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker compose version
# ou
docker-compose --version
```

## Ajouter l'utilisateur au groupe docker (pour éviter sudo)

```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Déconnexion/reconnexion nécessaire pour que les changements prennent effet
# Ou utiliser: newgrp docker
```

## Lancer l'application SNEL

```bash
# Aller dans le répertoire du projet
cd /opt/prototype_snel

# Lancer avec Docker Compose
docker compose up -d --build

# OU si vous avez installé la version standalone:
docker-compose up -d --build

# Vérifier que ça tourne
docker compose ps
# ou
docker-compose ps

# Voir les logs
docker compose logs -f
# ou
docker-compose logs -f
```

## Commandes rapides

```bash
# Voir les conteneurs en cours
docker ps

# Voir les logs
docker compose logs -f snel-proto

# Arrêter
docker compose down

# Redémarrer
docker compose restart

# Reconstruire après modification
docker compose up -d --build
```

## Vérifier que le port 3399 est ouvert

```bash
# Vérifier si le port est ouvert
sudo netstat -tulpn | grep 3399

# Si besoin, ouvrir le port avec ufw
sudo ufw allow 3399/tcp
sudo ufw reload
```

