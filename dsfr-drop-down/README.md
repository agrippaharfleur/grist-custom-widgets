# Widget Dropdown DSFR pour Grist

Widget personnalisé de menu déroulant conforme au Système de Design de l'État français (DSFR) pour Grist, avec synchronisation de la sélection entre les pages.

> **Basé sur le travail original de** [Antol Peshkov](https://github.com/Antol/grist-widget) et [Varamil](https://github.com/Varamil/grist-widget/tree/main/drop-down)

## ⚠️ Restrictions d'usage

Le DSFR est exclusivement réservé aux services de l'État français :

### ✅ Autorisé :
* Ministères, administrations centrales
* Préfectures, services déconcentrés
* Ambassades, délégations interministérielles
* Opérateurs de l'État (avec agrément SIG)

### ❌ Interdit :
* Collectivités territoriales
* Entreprises privées
* Associations
* Autres acteurs publics non-étatiques

💡 **Pour les non-initiés** : Le DSFR est l'équivalent de la charte graphique officielle de l'État français pour le web. Seuls les sites gouvernementaux peuvent l'utiliser, comme seuls les ministères peuvent utiliser le logo "République Française".

**Conformément à la circulaire n°6411-SG du 7 juillet 2023**

---

## 🎯 Fonctionnalités

* ✅ **Menu déroulant compact** avec design DSFR (typographie Marianne, couleurs officielles)
* ✅ **Synchronisation entre pages** : la sélection persiste lors de la navigation

---

## 📋 Configuration

### Colonnes attendues

| Colonne | Type | Obligatoire | Description | Exemple |
|---------|------|-------------|-------------|---------|
| `OptionsToSelect` | Quelconque | ✅ Oui | Colonne contenant les valeurs à afficher dans le dropdown | `Programme 123` |


### Configuration de la synchronisation (optionnel)

Pour synchroniser plusieurs dropdowns entre différentes pages :

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `Session ID` | Identifiant unique pour lier les dropdowns | `selection_programme` |

**Important** : Tous les dropdowns utilisant le même Session ID partageront la même sélection.

---

## 🚀 Installation

### Option 1 : URL personnalisée (Recommandé)

1. Dans Grist, ajouter une vue personnalisée → **Custom Widget**
2. URL : `https://agrippaharfleur.github.io/grist-custom-widgets/dsfr-dropdown/`
3. Mapper la colonne `OptionsToSelect` dans le panneau de configuration

### Option 2 : Custom Widget Builder

1. Copier-coller le contenu de `index.html` dans le Custom Widget Builder
2. Ajouter le fichier `script.js` 

---

## 💡 Utilisation

### 1. Configuration de base

1. **Ajouter le widget** à votre page Grist
2. **Mapper la colonne** : Sélectionnez la colonne contenant vos options (ex: `Programmes`, `Pays`, etc.)
3. **Lier les widgets** : Configurez les autres widgets de la page avec "Select By" pointant vers ce dropdown

### 2. Activer la synchronisation entre pages

Pour que la sélection persiste lors de la navigation :

1. **Ouvrir la configuration** :
   - Cliquer sur les 3 points du widget → **Widget options**
   - Sélectionnez **Ouvrir la configuration**

2. **Définir un Session ID** :
   - Entrer un identifiant unique de votre choix (ex: `"selection_programme"`)
   - Cliquer sur **Appliquer**
   - **Enregistrer** les nouveaux paramètres de la vue

3. **Répéter sur chaque page** :
   - Ajouter ou dupliquer le widget dropdown sur les autres pages
   - Utiliser **le même Session ID** pour tous
   - Tous les dropdowns liés se synchroniseront automatiquement


### Technologies utilisées

* **DSFR** v1.13.1 (typographie et variables CSS)
* **Grist Plugin API** (communication avec Grist)
* **sessionStorage API** (persistance de la sélection)

---

## 📚 Ressources

* [Widget original](https://github.com/Varamil/grist-widget/tree/main/drop-down) par Varamil
* [Documentation DSFR](https://www.systeme-de-design.gouv.fr/)
* [Documentation Grist Custom Widgets](https://support.getgrist.com/widget-custom/)
* [Circulaire n°6411-SG du 7 juillet 2023](https://www.legifrance.gouv.fr/)

---

## 👥 Crédits

### Auteurs originaux
* **Antol Peshkov** - [GitHub](https://github.com/Antol/grist-widget) - Widget dropdown initial
* **Varamil** - [GitHub](https://github.com/Varamil/grist-widget) - Ajout de la synchronisation

### Adaptation DSFR
* **Amandine Dugrain** - Intégration du Système de Design de l'État français

---

## 📝 Licence

Ce widget est basé sur le travail original sous licence MIT.

La version DSFR est fournie **tel quel** pour les services de l'État français.

⚠️ **Attention** : L'utilisation du DSFR est soumise à autorisation. Consultez la [charte d'usage du DSFR](https://www.systeme-de-design.gouv.fr/utilisation-et-organisation/perimetre-d-application) avant toute utilisation.

---

## 🐛 Support & Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
* Ouvrir une issue pour signaler un bug
* Proposer des améliorations via Pull Request
* Partager vos retours d'expérience

---

**Dernière mise à jour** : Janvier 2026
