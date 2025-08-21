# Widget En-tête DSFR pour Grist

Widget personnalisé affichant un en-tête conforme au Système de Design de l'État français (DSFR) dans Grist.

## ⚠️ Restrictions d'usage

**Le DSFR est exclusivement réservé aux services de l'État français :**

✅ **Autorisé :**

- Ministères, administrations centrales
- Préfectures, services déconcentrés  
- Ambassades, délégations interministérielles
- Opérateurs de l'État (avec agrément SIG)

❌ **Interdit :**

- Collectivités territoriales
- Entreprises privées
- Associations
- Autres acteurs publics non-étatiques

💡 **Pour les non-initiés :** Le DSFR est l'équivalent de la charte graphique officielle de l'État français pour le web. Seuls les sites gouvernementaux peuvent l'utiliser, comme seuls les ministères peuvent utiliser le logo "République Française".

*[Conformément à la circulaire n°6411-SG du 7 juillet 2023](https://www.systeme-de-design.gouv.fr/version-courante/fr/premiers-pas/perimetre-d-application)*

## Fonctionnalités

- Affichage dynamique de l'intitulé officiel, nom du service et baseline
- Valeur par défaut "République Française" si aucun intitulé n'est renseigné
- Respect des retours à la ligne dans les cellules Grist
- Style DSFR officiel avec hover désactivé

## Configuration

### Colonnes attendues (toutes facultatives)

1. **Intitulé officiel** - Texte affiché dans le logo (défaut: "République Française")
2. **Nom du service** - Titre principal
3. **Baseline** - Sous-titre ou précisions

### Installation

**Option 1 : Widget custom builder**

1. Dans Grist, ajouter une vue personnalisée à la page → Custom Widget Builder
2. Copier-coller le code HTML complet dans l'éditeur
3. Mapper les colonnes dans le panneau de configuration

**Option 2 : URL personnalisée**

1. Ajouter une vue personnalisée à la page → URL personnalisée
2. Copier-coller l'URL : [https://agrippaharfleur.github.io/grist-custom-widgets/dsfr-en-tete/](https://agrippaharfleur.github.io/grist-custom-widgets/dsfr-en-tete/)
3. Mapper les colonnes dans le panneau de configuration

## Utilisation

- Créez vos colonnes dans votre table Grist
- Les retours à la ligne dans les cellules sont préservés
- Laissez vide les champs non souhaités

## Exemple

| Intitulé officiel | Nom du service | Baseline |
|-------------------|----------------|----------|
| Ministère\nde l'Europe\net des Affaires\nÉtrangères | Référentiel des pays et des territoires | Et ici, je pourrais ajouter une baseline si j'avais une idée de baseline a ajouter 🙃 |

<img width="794" height="379" alt="exemple-dsfr-en-tete" src="https://github.com/user-attachments/assets/58eb5eff-f745-435b-b2f6-0262d91ffe28" />

Affichera une en-tête DSFR complète avec ces informations.
