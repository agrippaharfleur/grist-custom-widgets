# Widget FAQ DSFR pour Grist

Widget personnalisé affichant une Foire Aux Questions (FAQ) conforme au Système de Design de l'État français (DSFR) dans Grist, avec support du Markdown pour le formatage des réponses.

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

* ✅ **Affichage dynamique** de l'intitulé du ministère et la description du footer
* ✅ **Organisation par catégories** avec icônes et ordre d'affichage personnalisables
* ✅ **Support Markdown** dans les réponses (gras, italique, code inline, listes, paragraphes)
* ✅ **Statut de publication** des questions actives/inactives

---

## 📋 Configuration

### Colonnes attendues

#### 🔧 Configuration du widget (optionnel)

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| `Intitule_Officiel` | Texte | Intitulé affiché dans le header et footer | `République\nfrançaise` |
| `Description_Footer` | Texte | Description affichée dans le pied de page | `Vous ne trouvez pas de réponse ? Contactez le support via "Faire un retour".` |

💡 **Note** : Ces colonnes n'ont besoin d'être remplies que sur **la première ligne** de votre table. Utilisez `\n` pour les retours à la ligne.

#### 📝 Données FAQ (obligatoire)

| Colonne | Type | Obligatoire | Description | Exemple |
|---------|------|-------------|-------------|---------|
| `Categorie` | Choix | ✅ Oui | Catégorie de la question | `Services Faits` |
| `Icone_Categorie` | Texte | ❌ Non | Emoji pour la catégorie | `📋` |
| `Ordre_Categorie` | Entier | ❌ Non | Ordre d'affichage de la catégorie | `1` |
| `Question` | Texte | ✅ Oui | Titre de la question | `Comment créer un service fait ?` |
| `Reponse` | Texte | ✅ Oui | Contenu de la réponse en Markdown | `Pour créer un **service fait**, suivez ces étapes...` |
| `Ordre_Question` | Entier | ❌ Non | Ordre d'affichage dans la catégorie | `1` |
| `Actif` | Case à cocher | ❌ Non | Question visible ou masquée | `true` |

---

## 📝 Syntaxe Markdown supportée

Le widget supporte les syntaxes Markdown suivantes dans la colonne `Reponse` :

| Syntaxe | Rendu | Utilisation |
|---------|-------|-------------|
| `**texte**` ou `__texte__` | **texte** | Mettre en gras |
| `*texte*` ou `_texte_` | *texte* | Mettre en italique |
| `` `code` `` | `code` | Code inline |
| `- item` ou `* item` | • item | Liste à puces |
| `1. item` | 1. item | Liste numérotée |
| Double saut de ligne | Nouveau paragraphe | Séparer les paragraphes |

### Exemple de réponse avec Markdown

```markdown
Pour créer une nouvelle table sur Grist, suivez ces **étapes importantes** :

1. Cliquez sur le bouton `Nouveau`en haut à gauche de l'interface
2. Choissiez `Ajouter une table vide`
3. Donnez un nom à votre nouvelle table
4. C'est bon, votre nouvelle table est prête !
```

---

## 🚀 Installation

### Option 1 : Custom Widget Builder (Recommandé)

1. Dans Grist, ajouter une vue personnalisée → **Custom Widget Builder**
2. Copier-coller le code HTML complet dans l'éditeur
3. Dans le panneau de configuration, mapper les colonnes :
   - Configuration : `Intitule_Ministere`, `Description_Footer`
   - Données FAQ : `Categorie`, `Question`, `Reponse`, etc.

### Option 2 : URL personnalisée

1. Ajouter une vue personnalisée → **URL personnalisée**
2. Copier-coller l'URL : `https://agrippaharfleur.github.io/grist-custom-widgets/dsfr-faq/`
3. Mapper les colonnes dans le panneau de configuration

---

## 💡 Utilisation

### Structure de table recommandée

Créez une table `FAQ` avec la structure suivante :

```
FAQ
├── Intitule_Officiel (Texte) → Rempli uniquement sur la ligne 1
├── Description_Footer (Texte) → Rempli uniquement sur la ligne 1
├── Categorie (Choix)
├── Ordre_Categorie (Entier) → Avec une formule vous pouvez associe automatiquement l'ordre à la catégorie
├── Question (Texte)
├── Reponse (Texte Markdown)
├── Ordre_Question (Entier)
├── Actif (Case à cocher, défaut: true)
└── Mots_Cles (Texte, optionnel)
```

### Formule suggérée

**Ordre de catégorie** (colonne `Ordre_Categorie`) :
```python
ordre = {
  'Arbres': 1,
  'Fleurs': 2,
  'Buissons': 3
}
ordre.get($Categorie, 999)
```

---

## 📸 Exemple

### Configuration

| Intitule_Ministere | Description_Footer |
|-------------------|-------------------|
| `République\nfrançaise` | `Vous ne trouvez pas de réponse ? Contactez le support via le formulaire "Faire un retour".` |


## Dépendances externes

* **DSFR** v1.13.1 (CDN jsdelivr)
* **Grist Plugin API** (docs.getgrist.com)

---

## 📚 Ressources

* [Documentation DSFR](https://www.systeme-de-design.gouv.fr/)
* [Documentation Grist Custom Widgets](https://support.getgrist.com/widget-custom/)
* [Circulaire n°6411-SG du 7 juillet 2023](https://www.legifrance.gouv.fr/)

---

## 📝 Licence

Ce widget est fourni **tel quel** pour les services de l'État français.

⚠️ **Attention** : L'utilisation du DSFR est soumise à autorisation. Consultez la [charte d'usage du DSFR](https://www.systeme-de-design.gouv.fr/utilisation-et-organisation/perimetre-d-application) avant toute utilisation.

---

## 👥 Contribution & support

Les contributions sont les bienvenues ! N'hésitez pas à :
* Ouvrir une issue pour signaler un bug
* Proposer des améliorations via Pull Request
* Partager vos retours d'expérience

---

**Dernière mise à jour** : Janvier 2026  
**Autrice** : Amandine Dugrain