# Guide de Déploiement sur Serveur OVH

## Prérequis sur le serveur OVH

1. Docker installé
2. Docker Compose installé
3. Accès SSH au serveur

## Étapes de déploiement

### 1. Se connecter au serveur OVH

```bash
ssh votre-utilisateur@votre-serveur-ovh
```

### 2. Cloner le repository

```bash
cd /var/www  # ou le répertoire de votre choix
git clone git@github.com:shadjava2/prototype_snel.git
cd prototype_snel
```

### 3. Construire et lancer avec Docker Compose

```bash
# Construire l'image et lancer le conteneur
docker-compose up -d --build

# Vérifier que le conteneur tourne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### 4. Vérifier que l'application fonctionne

L'application devrait être accessible sur : `http://votre-serveur-ovh:3399`

### 5. Commandes utiles

```bash
# Arrêter les conteneurs
docker-compose down

# Redémarrer les conteneurs
docker-compose restart

# Reconstruire après une mise à jour
docker-compose up -d --build

# Voir les logs en temps réel
docker-compose logs -f snel-proto

# Entrer dans le conteneur (debug)
docker exec -it snel-proto sh
```

### 6. Mettre à jour l'application

```bash
# Sur le serveur OVH
cd /var/www/prototype_snel
git pull origin main
docker-compose up -d --build
```

## Configuration du firewall

Assurez-vous que le port 3399 est ouvert :

```bash
# Ubuntu/Debian
sudo ufw allow 3399/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3399/tcp
sudo firewall-cmd --reload
```

## Configuration Nginx (optionnel - reverse proxy)

Si vous voulez utiliser un domaine au lieu du port :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3399;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

```bash
# Vérifier l'utilisation des ressources
docker stats snel-proto

# Vérifier les logs d'erreur
docker-compose logs snel-proto | grep -i error
```

## Troubleshooting

### Le conteneur ne démarre pas

```bash
# Vérifier les logs
docker-compose logs snel-proto

# Vérifier que le port 3399 n'est pas déjà utilisé
sudo netstat -tulpn | grep 3399
```

### L'application ne répond pas

```bash
# Vérifier que le conteneur tourne
docker ps

# Redémarrer le conteneur
docker-compose restart
```

### Problème de permissions

```bash
# Donner les permissions au répertoire
sudo chown -R $USER:$USER /var/www/prototype_snel
```

