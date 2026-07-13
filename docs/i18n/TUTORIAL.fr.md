<!-- GENERATED from public/js/content/guide.fr.js — edit there, then `npm run build-tutorial` -->
# Tutoriel IR Kit

[English](../TUTORIAL.md) · [繁體中文](TUTORIAL.zh-TW.md) · [日本語](TUTORIAL.ja.md) · [한국어](TUTORIAL.ko.md) · [Español](TUTORIAL.es.md) · **Français**

Le même guide que dans l'app (**Démarrer** dans la barre latérale), en version GitHub.

- [Piloter IR Kit avec votre agent](#piloter-ir-kit-avec-votre-agent) — la voie de l'agent
- [Vos 30 premières minutes](#vos-30-premières-minutes) — la voie manuelle
- [Cap table 101 — la version dix minutes](#cap-table-101--la-version-dix-minutes) — si les SAFE et la dilution sont nouveaux pour vous
- [Glossaire](#glossaire)

---

# Piloter IR Kit avec votre agent

Votre agent de code (Claude Code, Codex, Cursor, etc.) est un **pair de cette interface**, pas une rustine par-dessus. Il passe par la ligne de commande `ir`, qui applique les mêmes règles que cette UI — vous décidez, l'agent fait le travail d'exécution. C'est votre « équipe IR de dix personnes ».

## Du téléchargement à un tableau de bord réel — dites « ir start »
1. **Récupérez le kit :** `git clone https://github.com/howieyoung/ir-kit && cd ir-kit`
2. **Lancez l'app :** `node server.js` → http://127.0.0.1:2330 — elle tourne immédiatement avec une société d'exemple.
3. **Ouvrez votre agent dans le dossier du repo** (Claude Code, Codex, Cursor…) et dites : **« ir start »**. C'est toute l'astuce — l'agent crée tout (dont une **boîte de réception** de documents), énonce les règles de confidentialité et vous guide.
4. **Déposez vos documents dans la boîte** (`ir-workspace/inbox/`) — SAFE, relevés bancaires, cap tables, decks, en vrac c'est parfait. Des documents éparpillés sur le disque ? L'agent peut faire `ir scan` sur des dossiers que vous désignez (noms de fichiers uniquement ; rien ne s'ouvre sans votre accord).
5. **Il classe tout** dans les bonnes catégories de la data room avec `ir sort` — **réexécutable à tout moment** quand vous ajoutez des documents ; un service de classement permanent, pas un événement unique.
6. **Avec votre accord, il extrait :** votre vraie cap table, les SAFE et les finances mensuelles — chaque chiffre cite un document source ; l'ambigu part dans une liste de questions, jamais deviné.
7. **Il vérifie, vous validez :** `ir check` passe au vert, il parcourt le tableau de bord avec vous face aux citations, et alors seulement le drapeau d'exemple s'éteint. Sans documents fournis, le tableau garde simplement les données d'exemple.

Ensuite, c'est le rythme mensuel — les rituels et la planification ci-dessous.

## Le parcours complet du maître IR
Pas besoin de connaître les relations investisseurs — vous déléguez chaque tâche à votre agent en langage courant. L'arc complet, et le rituel derrière chaque étape :

| Vous voulez… | Dites à votre agent | Rituel |
|---|---|---|
| Configurer depuis vos vrais documents | **« ir start »** | `onboard.md` |
| Construire une data room propre | « Audite ma data room contre les checklists » | `data-room-audit.md` |
| **Trouver des investisseurs pertinents + les contacter** | « Lis prompts/investor-sourcing.md et trouve des investisseurs qui nous correspondent » | `investor-sourcing.md` |
| Préparer un rendez-vous investisseur | « Prépare-moi mon rendez-vous avec [investisseur] » | `meeting-prep.md` |
| Envoyer l'update mensuel | « Rédige l'update investisseurs de ce mois » | `draft-update.md` |
| **Tenir un board** | « Lis prompts/board-meeting.md et organise mon board du [date] » | `board-meeting.md` |
| **Tenir une assemblée générale** | « Lis prompts/shareholder-meeting.md et prépare mon AG » | `shareholder-meeting.md` |
| Lancer une levée | « Modélise mon tour et construis le plan de pipeline » | `round-kickoff.md` |

Tout s'exécute sur votre machine, cite vos vrais chiffres, et rien ne part sans vous.

## L'interface : la CLI ir
Référence complète avec exemples : [docs/CLI.md](docs/CLI.md).

```
# commencer
ir start              configuration guidée — crée tout, détecte votre étape, affiche la suite
ir sort               classe les documents de la boîte dans la data room (réexécutable)

# lire
ir status [--json]    toutes les métriques dérivées en un appel — situez-vous d'abord
ir check              la suite de tests — après TOUTE édition directe de data/*.json
ir model round --pre 12000000 --new 3000000    conversion des SAFE en tour valorisé

# écrire (invariants garantis)
ir close-month 2026-07 --saas 31000 --ads 14000 --payroll 34000 ...
ir safe add "Fund X" --principal 50000 --cap 8000000 --status Signed
ir prospect add "Acme Capital" --fit "leads pre-seed dev-tools" --source "<url>"
ir update draft | mark-sent

# onboarding et livrables
ir scan <folders>     documents financiers candidats — noms de fichiers seulement, jamais ouverts
ir export board-pack | tearsheet | captable
ir schedule show      lignes cron pour les rituels mensuels
```

Trois règles que l'agent suit (et vous aussi) :
1. **Préférez les verbes `ir` à l'édition du JSON** — un seul `safe add` réconcilie le registre de la cap table, l'engagement CRM, la fiche investisseur et la liste de diffusion ; une édition manuelle peut les désynchroniser en silence.
2. **Après toute édition directe du JSON, lancez `ir check`** — exit 1 signifie qu'un invariant est cassé ; réparez avant tout.
3. **N'inventez jamais un chiffre.** Les données manquantes restent null ; un mois non clôturé bloque le brouillon d'update.

## Les rituels (prompts/)
Chaque tâche IR récurrente a son prompt canonique dans [prompts/](prompts/) — copiez, remplissez les crochets, collez. Tous passent par les verbes de la CLI :

| Prompt | Ce que fait l'agent |
|---|---|
| `onboard.md` | **Commencez ici** — consentement par étapes : scanne vos dossiers, organise la data room, alimente les vraies données avec une citation par chiffre |
| `investor-sourcing.md` | Recherche des investisseurs pertinents, les consigne via `ir prospect add` (pertinence + source), rédige un outreach personnalisé — n'envoie jamais |
| `monthly-close.md` | `ir close-month` + explique chaque alerte, vérifie les promesses du dernier update |
| `safe-signed.md` | `ir safe add` + rapport de garde-fous + actions du jour même |
| `draft-update.md` | `ir update draft` pour le squelette, puis rédige le récit à partir de votre matière |
| `meeting-prep.md` | Brief d'une page : historique avec cet investisseur, chiffres à connaître par cœur, ses 3 questions les plus dures |
| `board-meeting.md` | `ir export board-pack` + ordre du jour, convocation, pré-lecture, résolutions et modèle de compte rendu |
| `shareholder-meeting.md` | Convocation d'AG, ordre du jour, résolutions, feuille de vote de la cap table, pouvoir, procès-verbal |
| `data-room-audit.md` | Parcourt votre data room contre les checklists par niveaux, produit une liste corrective par gravité |
| `round-kickoff.md` | Modélise le tour, amorce le pipeline CRM, construit le plan de levée par lots |

## Mettez-le au planning
La partie mécanique n'a même pas besoin d'un agent — `ir update draft` est déterministe :

```
# crontab -e   (ou : ir schedule show)
0 9 1 * *  cd ~/ir-kit && ./bin/ir.js status          # le 1er : rappel de clôture
0 9 3 * *  cd ~/ir-kit && ./bin/ir.js update draft    # le 3 : brouillon en attente de relecture
0 9 * * 1  cd ~/ir-kit && ./bin/ir.js check           # lundi : intégrité des données
```

Ajoutez un passage d'agent par-dessus pour le récit (highlights/lowlights) — recettes et règles de sécurité dans [prompts/schedule-updates.md](prompts/schedule-updates.md). Les brouillons ne partent jamais seuls : la relecture et l'envoi restent à vous.

## Étendre le kit
Le code est volontairement éditable par un agent : JS pur sans dépendance, sans build. Demandez un nouveau module à votre agent (« ajoute le suivi ESOP », « support multi-devises ») et indiquez-lui [AGENTS.md](AGENTS.md) — les conventions sont écrites : les nouvelles opérations vont dans `core/ops.js` avec leur verbe CLI, les maths vivent dans `public/js/metrics.js`, les nouvelles pages s'enregistrent dans `app.js`. En étendant, gardez la promesse : zéro dépendance, local-first, et `ir check` toujours au vert.

---

# Vos 30 premières minutes

IR Kit repose sur une seule boucle : **saisissez ce qui s'est passé → le tableau de bord calcule l'essentiel → l'update le raconte à vos investisseurs.** Configurez une fois, puis comptez ~1 heure par mois.

> Vous travaillez avec un agent de code ? Sautez presque toute la saisie manuelle ci-dessous — dites-lui simplement **« ir start »** et il alimentera le système depuis vos vrais documents, avec votre accord à chaque étape. Voir l'onglet « Avec votre agent ».

## 1. Faites-le vôtre (Paramètres, 3 min)
Renseignez le nom de la société, le fondateur, l'email, l'objectif du tour et le jour du mois où part votre update. Laissez le **drapeau d'exemple activé** tant que vos vraies données n'ont pas partout remplacé l'exemple — la pastille ambre SAMPLE de la barre latérale vous rappelle que rien n'est encore réel ici.

## 2. Saisissez vos finances (Finances, 10 min)
Fixez la **trésorerie initiale** (solde bancaire avant votre premier mois), puis une ligne par mois : ventilation du chiffre d'affaires, salaires/infra/autres coûts, entrées de financement, effectif et vos métriques de traction. Une donnée manque ? Laissez vide — ne devinez jamais. Les colonnes calculées (revenus, coûts, P&L, trésorerie) et le tableau de bord se mettent à jour en direct.

Commencez par les 6–12 derniers mois si vous les avez : l'historique est ce qui rend vos chiffres de MoM et de runway crédibles.

## 3. Saisissez votre cap table (Cap table, 10 min)
- **Actionnaires :** actions du fondateur, options attribuées, pool non attribué — d'après les documents de constitution, pas de mémoire.
- **Registre des SAFE :** chaque SAFE signé : principal, cap, décote, date, statut. Un doute sur une clause ? Ressortez le PDF signé et vérifiez — le « je ne suis pas sûr » sur sa propre cap table est ce que la due diligence punit le plus durement.
- Nouveau dans le domaine ? Lisez d'abord l'onglet « Cap table 101 ».

## 4. Configurez vos investisseurs (CRM investisseurs, 5 min)
Ajoutez les investisseurs actuels, puis tous ceux qui doivent recevoir les updates (onglet liste de diffusion, avec segments). En cours de levée ? Ajoutez votre pipeline aux engagements.

## 5. Envoyez votre premier update (Updates, en continu)
L'éditeur pré-remplit vos vraies métriques — complétez les crochets, coupez jusqu'à 3 minutes de lecture, envoyez via le bouton BCC, puis **Envoyé → archive**. L'archive est l'essentiel : un futur investisseur lead la lira d'une traite, et une série ininterrompue est la crédibilité la moins chère qu'une startup puisse posséder.

## Le rythme mensuel à partir d'ici
| Quand | Quoi | Où |
|---|---|---|
| Fin de mois + 10 jours max | Clôturer le mois | Finances |
| Le même jour | Vérifier burn/runway/alertes | Tableau de bord |
| Jour d'update (à vous de le fixer) | Envoyer l'update | Updates |
| Chaque SAFE signé | Registre + CRM + liste de diffusion, le jour même | Cap table + CRM |
| Trimestriel | Pack de board/conseil d'investisseurs | Playbooks → Pack de board |

Téléchargez le fichier calendrier dans Updates pour installer ce rythme dans votre vrai agenda.

---

# Cap table 101 — la version dix minutes

Jamais vu de cap table ? Voici le minimum pour utiliser la page « Cap table » avec assurance. (Savoir de planification, pas un avis juridique.)

## Les bases
Votre **cap table** est la liste de qui possède quoi. La propriété se compte en **actions** ; votre pourcentage = vos actions divisées par toutes les actions — en base **entièrement diluée**, qui inclut le **pool d'options** (actions réservées aux futurs salariés) même si personne ne les détient encore. C'est le dénominateur honnête, et c'est celui qu'utilisent les investisseurs.

## Les SAFE, en clair
Un **SAFE**, c'est de l'argent maintenant contre des actions plus tard : l'investisseur vire aujourd'hui et reçoit des actions quand vous levez un **tour valorisé**. La clause clé est le **valuation cap** — sur le **SAFE post-money** standard, la part de l'investisseur juste avant votre tour valorisé est simplement :

**part implicite = principal ÷ cap post-money** (ex. : 100 K$ avec un cap de 8 M$ = 1,25 %)

C'est pourquoi le registre des SAFE affiche le « % implicite ». Deux règles d'or que le kit rend visibles :
- Gardez la **part implicite totale des SAFE sous ~15 %** avant de valoriser un tour — les SAFE post-money s'empilent, et cette dilution est **absorbée par les seuls fondateurs**.
- Gardez tous les SAFE aux **mêmes conditions**. Une pile de caps différents est un cauchemar de due diligence et signale une conviction faible.

Une **décote** (ex. : 20 %) permet au SAFE de convertir à un prix plus bas que celui des nouveaux investisseurs ; s'il y a cap et décote, l'investisseur prend ce qui l'avantage.

## Ce que montre le modélisateur de tour
Quand vous levez enfin un tour valorisé, trois choses arrivent en même temps : les SAFE se convertissent en actions, le pool d'options est en général **rechargé** jusqu'à un % cible, et de nouveaux investisseurs entrent. Tous les pourcentages bougent. Le modélisateur fait ce calcul avec la vraie mécanique du SAFE post-money — faites varier la valorisation pre-money, le montant levé et la cible de pool, et regardez qui finit avec quoi. Fondateurs : consultez l'onglet **scénarios de dilution** — si vous passez sous ~50 % à l'entrée en série A, c'est *maintenant* qu'il faut repenser les tailles de tour ou les caps, pas devant la term sheet.

## Ce que montre le waterfall de sortie
Les investisseurs détiennent en général des **actions de préférence** avec une **préférence de liquidation 1x** : à la vente, ils récupèrent d'abord leur mise *ou* convertissent à leur pourcentage — au plus avantageux. Le waterfall montre qui touche quoi à différents prix de vente, y compris où les ordinaires (vous et votre équipe) commencent à voir du vrai argent. Le **MOIC** est le multiple du capital investi.

## Les trois chiffres à connaître par cœur en rendez-vous
1. La part implicite totale des SAFE aujourd'hui.
2. Le % fondateur après le prochain tour valorisé (scénario de base).
3. Votre runway en mois.

Les trois s'affichent dans ce kit en deux clics. Un « je reviens vers vous » sur sa propre cap table met fin aux réunions.

---

# Glossaire

| Terme | Signification |
|---|---|
| ARR (revenu annualisé) | Revenus du mois × 12. Différent de l'ARR contractuel — étiquetez honnêtement |
| Burn (net) | Coûts moins revenus du mois ; entrées de financement exclues |
| Cap (valuation cap) | La valorisation servant à convertir un SAFE — cap plus bas = plus d'actions pour l'investisseur |
| Data room | Le dossier organisé de documents qu'un investisseur examine en due diligence |
| Dilution | Votre % rétrécit quand de nouvelles actions sont émises pour investisseurs/pool — votre *nombre* d'actions ne change pas |
| Décote | Le SAFE convertit à (1 − décote) × le prix du tour ; l'investisseur prend le meilleur du cap ou de la décote |
| Entièrement dilué (FD) | Nombre d'actions incluant toutes les options et le pool non émis — le dénominateur honnête |
| Préférence de liquidation | Les préférentielles récupèrent leur mise d'abord à la sortie (1x non participative = récupérer OU convertir, pas les deux) |
| MFN | Side letter « nation la plus favorisée » — si un investisseur ultérieur obtient mieux, celui-ci l'obtient aussi. Pourquoi les accords secrets finissent toujours par sortir |
| MoM | Croissance mois sur mois. Précisez la fenêtre quand vous citez une moyenne |
| MOIC | Multiple sur capital investi — ce que touche l'investisseur ÷ ce qu'il a mis |
| Pool d'options | Actions réservées à l'équipe future ; rechargé à chaque tour, diluant en général les fondateurs |
| SAFE post-money | Le SAFE post-money standard (2018+) : part figée à principal ÷ cap juste avant le tour |
| Post-money / pre-money | Valeur de l'entreprise après / avant l'argent nouveau : post = pre + levée |
| Pro-rata | Droit de l'investisseur de réinvestir pour maintenir son % aux tours suivants |
| Tour valorisé | Financement en capital à un prix par action négocié (seed, série A…) — où les SAFE convertissent |
| Runway | Trésorerie ÷ burn mensuel moyen = mois avant la panne sèche |
| SAFE | Simple Agreement for Future Equity — argent maintenant, actions au prochain tour valorisé |
| Side letter | Conditions supplémentaires accordées à un investisseur avec son SAFE — à divulguer en due diligence |
| 409A | Valorisation indépendante des actions ordinaires ; requise avant d'attribuer des options aux États-Unis |
