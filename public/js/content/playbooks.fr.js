// Contenu en français — mirrors content/playbooks.en.js. Same ids, order, checkbox counts.
export const DOCS = [
  {
    id: 'updates',
    title: 'Doctrine des updates',
    md: `# Doctrine de l'update investisseurs

**Cadence : le même jour chaque mois** (recommandé : le 5, après la clôture). La série ininterrompue est en soi l'actif de confiance qu'un futur investisseur lead passera en due diligence. **Ne sautez jamais un mauvais mois** — le silence se lit (à raison) comme une mauvaise nouvelle.

## Règles d'écriture
1. **Les métriques d'abord, le récit ensuite.** Les investisseurs parcourent le tableau avant de lire un mot.
2. **Les mêmes métriques, le même ordre, chaque mois.** Changer les définitions en route détruit la crédibilité. Si c'est inévitable, affichez explicitement l'ancien contre le nouveau.
3. **Les lowlights sont obligatoires.** Les investisseurs jugent les fondateurs davantage sur la qualité de leurs lowlights que de leurs highlights. Problème + apprentissage + changement = maturité opérationnelle.
4. **Les asks sont le retour sur investissement.** « Une intro au responsable audience de Condé Nast » obtient de l'action ; « des intros à des groupes médias » est ignoré. 1–3 maximum.
5. **Lecture en 3 minutes.** Coupez jusqu'à ce que ça fasse mal.

## Segments
| Segment | Qui | Reçoit |
|---|---|---|
| Board/Major | Leads, board, observateurs | Update complet + détail financier |
| All investors | Chaque détenteur de SAFE | Update mensuel complet |
| Prospect nurture | Ceux qui ont dit « trop tôt » | Le même update — six mois à 80 % MoM transforment un refus en second rendez-vous chaleureux |

Envoyez uniquement en BCC ou par publipostage — le CC divulgue votre cap table et votre liste de prospects d'un coup.

## Le regard de la due diligence
Un investisseur lead lira toute votre archive d'une traite et notera : les mêmes métriques reviennent-elles chaque mois ? Les plans annoncés se sont-ils réalisés ? Les lowlights sont-ils sortis avant de devenir des crises ? Les asks sont-ils précis, et bouclez-vous avec des remerciements ? Écrivez chaque update pour ce lecteur-là.`,
  },
  {
    id: 'fundraising',
    title: 'Processus de levée',
    md: `# Playbook de levée — en lots, pas au goutte-à-goutte

Le mode d'échec n° 1 en pre-seed : six mois de contacts séquentiels. Remplacez-le par un processus parallèle compressé :

## Porte de préparation — pas de rendez-vous tant que tout n'est pas vrai
- [ ] Data room de niveau 1 complète (voir l'onglet « Data room »)
- [ ] Deck + mémo datés, chiffres cohérents partout
- [ ] Réponses au FAQ répétées (voir l'onglet « FAQ investisseurs »)
- [ ] Onglet des engagements CRM opérationnel

## Le lot
- **Semaines 1–2 :** intros chaleureuses + fonds prioritaires, 15–20 premiers rendez-vous dans une fenêtre de 2 semaines. La densité crée l'urgence ; l'urgence fait bouger les conditions.
- **Semaines 3–4 :** deuxième cercle + tous ceux qui ont demandé « quelques semaines ». Annoncez les premiers engagements informels (« 200 K$ sur 500 K$ »).
- **Semaines 5–6 :** date butoir ferme. Les SAFE se signent au fil de l'eau — ne faites jamais attendre un chèque engagé.
- **Chaque vendredi de la levée :** mettez à jour les engagements, envoyez une note d'avancement de 3 lignes aux engagés.

## Mécanique rendez-vous → closing
1. Premier rendez-vous → relance le jour même avec mémo + prochaine étape concrète.
2. Intérêt sérieux → accès à la data room, consigné au CRM.
3. Oui verbal → SAFE envoyé sous 24 h (DocuSign), coordonnées bancaires dans le même mail.
4. Signé + viré → le jour même : contre-signature, remerciement, ajout à la liste de diffusion, inscription au registre de la cap table.
5. Refus → remerciez, demandez ce qui les ferait changer d'avis, basculez en nurture. Un refus + une série d'updates solide = le lead de seed le plus chaleureux que vous obtiendrez jamais.

## Discipline de caps
- Conditions uniformes pour chaque chèque. Une pile de SAFE à caps différents est un bourbier de due diligence et signale une conviction faible.
- Les SAFE post-money s'empilent — les fondateurs absorbent 100 % de cette dilution. Gardez le total sous ~15 % avant le tour valorisé (l'onglet cap table calcule en direct).
- Ne citez jamais le nom d'un fonds à un autre fonds sans permission. Ne gonflez jamais les montants engagés — les fonds comparent leurs notes.
- Répondez à toute question de due diligence sous 24 h ; la latence se lit comme un aperçu du traitement post-investissement.`,
  },
  {
    id: 'dataroom',
    title: 'Data room',
    md: `# Checklist de la data room

Hébergez sur un drive à permissions ou DocSend. Chaque document daté et versionné. Notez qui a reçu l'accès.

## Niveau 1 — tour en cours (à préparer MAINTENANT)
- [ ] One-pager / mémo d'investissement
- [ ] Pitch deck (daté)
- [ ] Vidéo démo du produit ou accès sandbox
- [ ] Certificat de constitution + attestation de conformité
- [ ] Synthèse des métriques avec définitions écrites
- [ ] Preuves d'usage/trafic (les investisseurs VÉRIFIERONT votre chiffre phare)
- [ ] Liste clients : payants vs gratuits, type de contrat ; renouvellements mis en avant
- [ ] Détail des revenus : la série mensuelle qui soutient la croissance annoncée
- [ ] Export à jour de la cap table
- [ ] Tous les SAFE signés + side letters (une side letter cachée pulvérise la confiance — les clauses MFN la feront ressortir de toute façon)
- [ ] Modèle de SAFE de ce tour
- [ ] Relevé bancaire étayant la trésorerie annoncée
- [ ] Cessions de PI : fondateur + chaque ingénieur + chaque prestataire (l'écueil n° 1 de la due diligence pre-seed)

## Niveau 2 — data room du tour valorisé (à construire sur 6 mois)
- [ ] Statuts, tous les consentements du board/des associés
- [ ] Registre des actions + 409A (requis avant toute attribution d'options)
- [ ] Plan d'options + dossiers d'attribution
- [ ] Documents des financements antérieurs (y c. conditions d'accélérateurs)
- [ ] Contrats clients (top 10 + contrat type)
- [ ] Politique de reconnaissance du revenu
- [ ] Historique churn/renouvellements (documenté)
- [ ] Contrats de travail, chaîne de PI complète, dépôts de marque
- [ ] Modèle opérationnel à 18 mois (hypothèses sourcées)`,
  },
  {
    id: 'board',
    title: 'Pack de board',
    md: `# Pack de board / réunion d'investisseurs

Pas encore de board formel ? Faites-le quand même chaque trimestre avec vos principaux investisseurs — le muscle de gouvernance et la trace écrite se monnayent tous deux au tour valorisé.

**Envoyez le pack 72 heures avant. Ne présentez jamais des slides non pré-lues — le temps de réunion sert à discuter, pas à narrer.** ≥50 % de l'ordre du jour en points Discuter/Décider.

## Squelette d'ordre du jour (60–90 min)
| Temps | Point | Type |
|---|---|---|
| 0:00 | Cadrage du CEO : la seule chose qui compte ce trimestre | Informer |
| 0:05 | Revue métriques et finances (Q&R sur la pré-lecture uniquement) | Informer |
| 0:15 | Plongée 1 : la question stratégique la plus dure du moment | **Discuter** |
| 0:35 | Plongée 2 | **Discuter** |
| 0:50 | Levée / stratégie de trésorerie | Discuter |
| 0:60 | Demandes, approbations, consentements formels | **Décider** |

## Lettre du CEO (une page, en prose)
L'état de l'entreprise en 3 phrases · ce que j'ai dit le trimestre dernier vs ce qui s'est passé · les 1–2 décisions où j'ai besoin d'aide · ce qui m'empêche de dormir.

## Compte rendu (à diffuser sous 48 h)
Décisions prises (numérotées, formulation exacte) · consentements adoptés · actions (responsable + échéance) · sujets discutés (2–3 lignes chacun — pas un verbatim).

## Registre des consentements et résolutions
Consignez chaque acte social dès le premier jour : émissions de SAFE, attributions d'options, adoptions de 409A. Au tour valorisé, les avocats demanderont tout — un registre tenu transforme trois semaines d'archéologie en une heure.`,
  },
  {
    id: 'faq',
    title: 'FAQ investisseurs',
    md: `# Les questions difficiles — cadres de réponse

Remplissez avec les faits à jour avant chaque rendez-vous ; ~45 secondes par réponse.

**« Gros trafic, petits revenus — pourquoi ? »** Assumez-le comme un séquencement, pas un échec. L'actif de distribution d'abord ; la monétisation activée le [date] — la courbe MoM prouve qu'elle fonctionne maintenant. La version honnête désarme ; la version défensive disqualifie.

**« Défendez vos hypothèses de potentiel publicitaire. »** Le mesuré bat le modélisé : présentez d'abord les données réelles de campagnes, étiquetez le reste comme modélisé. Ne laissez jamais un chiffre modélisé passer pour mesuré — c'est le moment de crédibilité de toute la réunion.

**« Risque de fondateur unique ? »** La vraie question : pouvez-vous recruter un banc de touche ? Preuves de résilience + vraie propriété des systèmes par l'équipe + atténuation nommée (documentation, redondance, equity de rétention).

**« Pourquoi les plateformes ne le construiraient-elles pas elles-mêmes / n'utiliseraient-elles pas un outil du marché ? »** Nommez le coin (intégration native, zéro fuite de données) et la douve (l'actif de données généré dans le produit). Ayez une anecdote client réelle où vous avez gagné exactement cette comparaison.

**« Quelles sont les conditions de vos investisseurs actuels ? »** Réponse instantanée et précise — l'hésitation est le drapeau rouge. Registre exportable sur demande.

**« Pourquoi ce montant ? »** La levée doit atteindre un jalon qui valorise le tour suivant, pas seulement prolonger la survie. Citez le tableau de scénarios de runway.

**« Que deviennent tous ces SAFE au tour valorisé ? »** Faites la conversion en direct avec le modélisateur. Un fondateur qui maîtrise sa propre dilution gagne plus de confiance que n'importe quelle slide.

**Méta-règle :** toute question de métrique doit trouver sa réponse dans ce kit en 30 secondes. « Je reviens vers vous » sur vos propres chiffres = réunion terminée.`,
  },
  {
    id: 'metrics',
    title: 'Définitions des métriques',
    md: `# Définitions des métriques — la copie de la due diligence

| Métrique | Définition | Piège |
|---|---|---|
| Revenus totaux | SaaS + publicité reconnus dans le mois | Ne mélangez jamais crédits ou subventions aux revenus |
| ARR (revenu annualisé) | Revenus du mois × 12 | N'appelez pas l'annualisé « ARR » devant un investisseur SaaS |
| ARR contractuel | Seule la valeur annualisée des contrats annuels signés | S'ils divergent, publiez les deux |
| Croissance MoM | Variation mensuelle des revenus totaux | Tout « MoM moyen » doit préciser la fenêtre de moyenne |
| Trafic | Visites uniques mensuelles où le produit s'est réellement affiché | « Chargé et rendu », pas « script installé » |
| Burn net | Coûts moins revenus (base caisse) | Les entrées de financement ne comptent pas dans le burn |
| Runway | Trésorerie ÷ burn moyen sur 3 mois | Le burn du dernier mois flatte le chiffre ; à proscrire |
| NRR | Rétention nette de revenus par cohortes annuelles | Commencez à consigner les cohortes MAINTENANT — le dataset de la série A vient de là |

Quand une définition change : versionnez-la ici, affichez l'ancien vs le nouveau dans le prochain update, et réexprimez le mois précédent des deux façons.`,
  },
];
