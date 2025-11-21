# Instructions de mise à jour sur OVH

Si le build échoue après un `git pull`, suivez ces étapes :

## 1. Vérifier que vous avez la dernière version

```bash
cd /opt/prototype_snel

# Vérifier la version actuelle
git log --oneline -3

# Forcer la mise à jour depuis GitHub
git fetch origin
git reset --hard origin/main

# Vérifier que Suspense est bien importé
grep -n "Suspense" app/admin/page.tsx
```

## 2. Nettoyer le cache Docker

```bash
# Arrêter les conteneurs
docker compose down

# Nettoyer les images et le cache
docker system prune -f

# Supprimer l'image spécifique si nécessaire
docker rmi prototype_snel-snel-proto 2>/dev/null || true
```

## 3. Reconstruire complètement

```bash
# Reconstruire sans cache
docker compose build --no-cache

# Lancer
docker compose up -d

# Vérifier
docker compose ps
docker compose logs -f snel-proto
```

## 4. Si ça ne marche toujours pas

```bash
# Vérifier le contenu du fichier dans le conteneur
docker compose exec snel-proto cat app/admin/page.tsx | head -5

# Vérifier que Suspense est importé
docker compose exec snel-proto grep "Suspense" app/admin/page.tsx
```

