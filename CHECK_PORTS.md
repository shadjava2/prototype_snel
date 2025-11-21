# Vérification des ports avant déploiement

## Vérifier les ports utilisés sur le serveur

```bash
# Voir tous les ports en écoute
sudo netstat -tulpn | grep LISTEN

# Ou avec ss (plus moderne)
sudo ss -tulpn | grep LISTEN

# Vérifier spécifiquement le port 3399
sudo netstat -tulpn | grep 3399
sudo ss -tulpn | grep 3399
```

## Ports utilisés par vos projets existants

D'après votre configuration actuelle :
- **Port 80** : Caddy (cmkpacs)
- **Port 4242** : Orthanc (cmkpacs)
- **Port 5050** : pgAdmin (cmkpacs)
- **Port 8080** : Backend (cmkpacs, interne)
- **Port 3000** : Web (cmkpacs, interne)
- **Port 5432** : PostgreSQL (cmkpacs, interne)
- **Port 6379** : Redis (cmkpacs, interne)

## Port pour SNEL

Le projet SNEL utilisera le **port 3399** qui ne devrait pas être en conflit.

## Vérifier les conteneurs Docker existants

```bash
# Voir tous les conteneurs
docker ps -a

# Voir les réseaux Docker
docker network ls

# Voir les volumes Docker
docker volume ls
```

## Lancer SNEL sans conflit

Le projet SNEL utilise :
- **Nom de conteneur** : `snel-proto` (unique)
- **Nom de réseau** : `snel-network` (isolé)
- **Port** : `3399` (non utilisé par vos autres projets)

Aucun conflit ne devrait survenir.

