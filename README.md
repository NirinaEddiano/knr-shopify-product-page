# Intégration de la Page Produit - Maison Célestine (Test Recrutement KNR)

Bienvenue sur le dépôt GitHub contenant mon intégration pour la page produit de la marque cosmétique premium **Maison Célestine**, réalisée dans le cadre du processus de recrutement développeur Shopify chez KNR.

L'objectif de ce test était d'intégrer fidèlement une maquette Figma (desktop et mobile) dans un environnement technique Shopify réaliste, sans utiliser de thèmes tiers, de frameworks CSS (pas de Tailwind) ni de frameworks JavaScript (pas de React/jQuery).

---

## Choix Techniques & Spécifications

- **Mise en page de référence** : Intégration stricte basée sur une structure d'une largeur maximale de **1440px** conforme à la maquette Figma.
- **Moteur de rendu** : Utilisation de **Liquid** de manière totalement dynamique (aucun texte, prix, ou image produit n'est écrit en dur).
- **Style CSS** : Écrit en **Vanilla CSS pur**, scopé par section pour garantir la maintenabilité globale et éviter les collisions de classes.
- **JavaScript** : Écrit en **Vanilla JS pur** (non bloquant, chargé de manière asynchrone).

---

## Fonctionnalités Intégrées & Dynamicité

- **Header & Announcement Bar** : Intégration du logo, d'un menu de navigation dynamique, d'un burger de navigation pour la version mobile et d'icônes vectorielles personnalisées (recherche, compte, adresses, panier).
- **Badge Panier Dynamique** : Mise à jour asynchrone du badge de quantité du panier grâce à l'utilisation de l'API AJAX de Shopify (`/cart/add.js` et `/cart.js`).
- **Sélecteur de Variantes Interactif** : Les prix (prix de vente, prix de comparaison et prix unitaire) s'actualisent en temps réel lors du changement d'option (15 mL / 150 mL).
- **Avant / Après Interactif** : Conception d'un slider interactif permettant de comparer visuellement deux photos (avant / après utilisation) par glissement de souris ou de doigt sur mobile.
- **Témoignages Dynamiques** : Carrousel fonctionnel permettant de faire défiler les avis clients.
- **Système d'Avis & Modale** : Interface permettant d'ouvrir un formulaire d'écriture d'avis dans une fenêtre modale, de soumettre un nouvel avis et de l'ajouter instantanément en haut de la liste de manière asynchrone tout en mettant à jour le compteur d'avis global.
- **Foire aux Questions (FAQs) & Accordéons** : Système d'onglets rétractables fluides pour la description du produit et la foire aux questions.
- **Rituel & Newsletters** : Carrousels d'ajout rapide au panier (Quick Add AJAX) et formulaire de newsletter connecté aux formulaires natifs de Shopify.

---

## Difficultés Rencontrées & Solutions

### 1. Gestion des contraintes de largeur maximale du thème d'origine
* **Problème** : Le thème de départ Shopify Skeleton imposait des contraintes de largeur maximale (`max-width`) et des marges intérieures au niveau de son conteneur principal, ce qui coinçait l'image du Hero et le Header au milieu de l'écran avec des bordures blanches.
* **Solution** : J'ai mis en place une réinitialisation agressive des paddings et margins par défaut du thème dans le fichier `theme.liquid`. Pour l'image de fond et le Header, j'ai combiné une largeur complète (`100vw`) avec des positions relatives et des marges négatives, tout en verrouillant la page avec un paramètre de débordement horizontal strict (`overflow-x: hidden`) au niveau du `html` et du `body`. Cette méthode garantit un affichage en plein écran physique sans générer de barre de défilement horizontale.

### 2. Superposition du Header et de la section Hero
* **Problème** : Pour respecter fidèlement le design, le Header transparent devait se superposer proprement sur l'image du Hero sans créer de décalage ou de grand espace vide blanc.
* **Solution** : En masquant l'en-tête natif du thème par défaut via le CSS global de `theme.liquid` et en configurant le Header personnalisé en positionnement absolu (`position: absolute`), j'ai pu l'ancrer exactement à `32px` du haut de la page (juste sous la barre d'annonce noire), offrant un rendu propre et sans aucun espace superflu.

---

## Si j'avais eu plus de temps...

1. **Lazy-loading des images** : J'aurais optimisé le chargement des images de fond et des carrousels en utilisant le filtre d'URL d'image de Shopify pour charger des résolutions adaptées à la taille de l'écran de l'utilisateur (responsive images).
2. **Gestion complète de la traduction** : J'aurais transféré l'ensemble des textes d'accordéons et des libellés dans les fichiers d'internationalisation de dossier `locales/` pour permettre une traduction multilingue complète de la page produit.
3. **Animations avancées** : J'aurais conçu des transitions d'entrée de page plus fluides sur les différents blocs de texte pour renforcer l'aspect premium de l'expérience utilisateur.

---

## Installation & Aperçu

Pour exécuter ce projet localement :

1. Installez Shopify CLI si ce n'est pas déjà fait.
2. Connectez-vous à votre boutique de test :
   ```bash
   shopify theme dev --store <votre-boutique-de-test>.myshopify.com