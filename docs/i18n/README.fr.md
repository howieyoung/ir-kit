# IR Kit — Français

**Gérez vos relations investisseurs comme avec une équipe de dix — même s'il n'y a que vous et un agent IA.**

IR Kit est un système de relations investisseurs open source et local-first : cap table avec calcul de conversion des SAFE, tableau de bord financier (burn/runway), CRM investisseurs, updates mensuels au format YC, checklists de data room et playbooks opérationnels — conçu pour travailler avec des agents de code (Claude Code, Codex, Cursor…).

## Démarrage rapide

```bash
git clone https://github.com/howieyoung/ir-kit && cd ir-kit
node server.js        # Node 18+, zéro dépendance — l'installation tient en une ligne
# → http://127.0.0.1:2330
```

## Le premier jour tient en deux mots : dites « ir start » à votre agent

1. Lancez l'app (elle fonctionne immédiatement avec une société d'exemple).
2. Ouvrez votre agent dans le dossier du repo — il lit AGENTS.md automatiquement.
3. Dites : **« ir start »**. L'agent crée tous les dossiers (dont la boîte de réception de documents), énonce les règles de confidentialité et vous guide.
4. Déposez tous vos documents financiers/société dans la boîte — SAFE, relevés bancaires, cap tables, decks ; en vrac, c'est très bien.
5. `ir sort` classe chaque document dans la bonne catégorie de la data room — **réexécutable à tout moment** ; un service de classement permanent.
6. Avec votre accord, l'agent lit les documents et construit votre vraie cap table, le registre des SAFE et les finances mensuelles — **chaque chiffre cite sa source (fichier + page)** ; l'ambigu part dans une liste de questions, jamais deviné.
7. `ir check` passe, vous validez les chiffres, et le tableau de bord affiche vos données réelles. Pas de documents ? Les données d'exemple restent.

## Confidentialité (une architecture, pas une politique)

- Vos données sont du JSON local (`data/`) et des dossiers de documents (`ir-workspace/`) — **tous deux dans .gitignore** : aucune fuite possible vers le repo public.
- Le serveur n'écoute que sur localhost par défaut ; sur la démo publique, vos saisies restent dans votre navigateur.
- Pas de compte, pas de cloud — personne ne devrait téléverser sa cap table pour bien faire ses relations investisseurs.

## Langues

Changez de langue depuis la barre latérale (anglais, chinois traditionnel, japonais, coréen, espagnol, français). Le tutoriel complet existe en français : [Tutoriel (français)](TUTORIAL.fr.md) ; la référence CLI fait foi en anglais : [CLI](../CLI.md) · [Contribuer](../../CONTRIBUTING.md) (chaque PR doit maintenir la couverture des 6 langues).

Licence MIT · [Démo en ligne](https://howieyoung.github.io/ir-kit/) · [English README](../../README.md)
