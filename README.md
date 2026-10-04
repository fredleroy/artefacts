# Artefacts

Petits outils web autonomes, hébergés sur GitHub Pages.

**Site : https://fredleroy.github.io/artefacts/**

- [Liste de courses](https://fredleroy.github.io/artefacts/courses/) — `courses/index.html`, liste partagée dans Firestore.
- [Calculateur de patron de trousse](https://fredleroy.github.io/artefacts/trousse/) — `trousse/index.html`.

L’ancien lien `courses.html` redirige vers `courses/`.

## Configurer la liste partagée

1. Créer un projet [Firebase](https://console.firebase.google.com/) sur le plan gratuit Spark. Ajouter une application Web et copier `apiKey`, `projectId` et `appId` dans `courses/firebase-config.js`. Ces valeurs de configuration Web sont publiques.
2. Créer une base Cloud Firestore **Standard**, identifiant `(default)`, et choisir sa région. Aucun fournisseur Firebase Authentication n’est nécessaire.
3. Dans Firestore → Rules, publier le contenu de `firestore.rules`. Il autorise uniquement le document `lists/courses`, avec au maximum 20 articles et des champs validés. Il refuse les requêtes sur les collections et la suppression du document. L’accès à cette liste est public, sans connexion.
4. Déployer le code configuré sur `main`. Le premier visiteur initialise le document avec `courses/initial-list.json` s’il n’existe pas. Une transaction empêche d’écraser une liste existante.

Ensuite les ajouts, suppressions, cases cochées et « Tout décocher » sont partagés en direct. La liste est plafonnée à 20 articles. Aucun stockage local persistant : cache Firestore uniquement en mémoire. Sans connexion, les modifications sont désactivées ou échouent avec un message ; aucune file d’attente persistante hors ligne.

`initial-list.json` n’est **pas** rechargé pour remplacer les données en cours : modifier la liste depuis la page ou directement dans le document Firestore. Les anciens ajouts locaux et cases cochées ne sont pas migrés.

### Déployer les règles depuis ce dépôt

Le workflow **Deploy Firestore rules** peut être lancé manuellement dans GitHub Actions :

- Variable du dépôt `FIREBASE_PROJECT_ID` : identifiant du projet.
- Secret du dépôt `FIREBASE_SERVICE_ACCOUNT` : JSON d’un compte de service autorisé à déployer les règles (rôle Firebase Rules Admin et accès nécessaire au projet).

Cette configuration est facultative : copier les règles dans la console suffit aussi. Ne jamais ajouter la clé du compte de service aux fichiers du dépôt. Le workflow déploie uniquement les règles, sans changer les articles.

### Validation

`node --test courses/list-model.test.mjs`

Pour tester les règles contre l’émulateur Firestore, utiliser `firebase emulators:start --only firestore --project demo-artefacts` avec un runtime Java compatible avec la version de Firebase CLI installée. Les règles doivent être déployées et vérifiées avant la mise en service.
