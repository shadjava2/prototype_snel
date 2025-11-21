# Plateforme de Facturation SNEL

Plateforme CRM de facturation pour la Société Nationale d'Électricité (SNEL) permettant aux clients de payer leurs factures, consulter leurs historiques, déposer des plaintes et laisser des avis.

## 🚀 Déploiement avec Docker

### Prérequis
- Docker
- Docker Compose

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/shadjava2/prototype_snel.git
cd prototype_snel

# Construire et lancer avec Docker Compose
docker-compose up -d --build

# L'application sera accessible sur http://localhost:3399
```

### Sur le serveur OVH

```bash
# Cloner le repository
git clone https://github.com/shadjava2/prototype_snel.git
cd prototype_snel

# Construire et lancer avec Docker Compose
docker-compose up -d --build

# L'application sera accessible sur http://votre-serveur:3399
```

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter les conteneurs
docker-compose down

# Redémarrer les conteneurs
docker-compose restart

# Reconstruire après modification
docker-compose up -d --build
```

## 📋 Fonctionnalités

### Rôles disponibles

- **Client** : Consulter factures, effectuer des paiements, déposer des plaintes, laisser des avis
- **Agent** : Enregistrer les relevés de compteurs
- **Facturation** : Générer les factures à partir des relevés validés
- **Guichet** : Enregistrer les paiements en espèces
- **Admin** : Gérer les clients, traiter les plaintes, générer des données de démonstration

### Compteurs de test

Pour tester rapidement :
- **CTR-TEST-001** : Facture payée par Mobile Money
- **CTR-TEST-002** : Facture payée par Carte
- **CTR-TEST-003** : Facture en attente de paiement

## 🛠️ Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start
```

## 📦 Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Docker & Docker Compose

## 📝 Notes

- Les données sont stockées dans `localStorage` pour la démonstration
- Pour la production, il faudra intégrer une base de données réelle
- Le port par défaut est 3399 (configurable dans docker-compose.yml)
