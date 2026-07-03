# Chantier — réécrire `obs:mail` pour la rédaction de réponses (Markdown / Obsidian)

> **Statut** : capturé (à concevoir puis implémenter — item futur)
> **Date** : 2026-07-03
> **Plugin** : `obs` — skill `mail`

## Besoin

Les emails sont désormais stockés en **Markdown dans Obsidian** (exportés de Thunderbird). La **rédaction des réponses ne se fait plus dans Thunderbird** mais directement dans Obsidian. → `mail` doit être **réécrit** pour **préparer la rédaction d'un email de réponse**.

## Cadrage

Aujourd'hui `mail` ne fait que **communication → information** (triage : scan → analyze → propose → execute → report ; suppress/dedupe/prune/preserve/merge/summarize + placement en branches, phishing, archive-avant-suppression). Il n'a **aucune capacité de composition**.

Ce chantier ajoute la direction inverse — **information → communication** : composer une réponse à un email/thread, en Markdown, dans le vault.

Esquisse d'une nouvelle action (ex. `reply` / `draft-reply`) :
- Entrée : un fichier email Markdown (ou un thread) + l'intention de réponse.
- Sortie : un **brouillon de réponse** en Markdown, au format email du skill (frontmatter `to`/`from`/`subject` avec `Re:`, `date`, etc.), corps rédigé.
- S'appuie sur le contexte du thread (déjà en Markdown) pour composer.

## Questions ouvertes (à trancher avant conception)

1. **Où vit le brouillon ?** À côté de l'email source, dans un `_drafts/`, ou dans une branche dédiée ?
2. **Assistance au contenu** : `mail` rédige-t-il le corps (composition assistée depuis le thread + intention), ou ne fait-il que **scaffolder** la structure (frontmatter + squelette) à remplir ?
3. **Envoi** : hors périmètre (« préparer » ≠ « envoyer ») ? Sinon, par quel pont — ré-import Thunderbird, ou MCP Gmail (`create_draft` existe) ?
4. **Format** : réutiliser le format email du SKILL (frontmatter YAML `from`/`to`/`subject`/`date`/`subject_hash`) pour que le brouillon soit cohérent avec les emails triés.
5. **Interaction avec le triage** : la rédaction de réponse est-elle une action indépendante, ou s'enchaîne-t-elle après le `propose`/`report` (répondre aux emails qui restent après réduction) ?

## Lien avec les autres chantiers

- **Rework `project`** (`2026_07_03-obs-project-rework.md`) : indépendant. Le rôle amont éventuel de `mail` (livrer les emails projet dans les `YYYY/MM`) reste une question séparée, non bloquante pour le pipeline filler+project.
- **Frictions run mail** (backlog spec-hardening) à traiter au passage de la réécriture : prédicat « domain match » du phishing (égalité du label registrable) ; câblage `exceptions.action` → rung.
- La suite behave `mail-scenarios.md` (19 scénarios, baseline 19/19) devra être étendue à la capacité de composition après réécriture.
