# 🚌 BusDirect - Gestion de Réseau de Transport

Application web moderne et responsive pour la gestion de 20 trajets interurbains, le suivi des réservations, la tarification VIP et la liste d'attente automatisée.

## ✨ Fonctionnalités
* **Page Trajets (`index.html`) :** Chargement des données via `fetch` (trips.json), affichage en cartes avec statuts, recherche, filtres et pagination (6 par page).
* **Page Cabine (`cabine.html`) :** Plan interactif des 20 sièges, distinction des sièges VIP (01 à 04 avec +10% sur le prix), gestion complète des réservations (ajout, modification, annulation).
* **Liste d'Attente Automatique :** Inscription des passagers quand un trajet est complet et réattribution automatique des sièges libérés.
* **Persistance & Sécurité :** Sauvegarde des données dans le `localStorage` et validation rigoureuse des formulaires (Noms et numéros de téléphone uniques par trajet).

## 📂 Structure du Projet
```text
busdirect-partie2/
├── index.html
├── cabine.html
├── data/trips.json
├── js/
│   ├── store.js            # Gestion du localStorage et fetch
│   ├── validators.js       # Expressions régulières et validations
│   ├── render.js           # Rendu dynamique du DOM
│   ├── reservations.js     # Logique métier et liste d'attente
│   ├── main-trajets.js     # Point d'entrée index.html
│   └── main-cabine.js      # Point d'entrée cabine.html
└── README.md
