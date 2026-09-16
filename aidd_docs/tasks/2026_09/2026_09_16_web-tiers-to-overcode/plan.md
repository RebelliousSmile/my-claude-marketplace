---
objective: "Overcode fournit les capacités SaaS et de livraison auparavant portées par web-tiers, puis la marketplace ne référence plus ce plugin autonome."
status: implemented
---

# Plan: Migrer web-tiers dans overcode

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | Regrouper les connaissances et workflows de services tiers et de livraison dans `overcode`, avec les contrats inter-plugin redirigés et `web-tiers` retiré. |
| **Source** | Brainstorm de cette conversation : `service` pour Firebase, Klaviyo, GTM/Meta, Clarity, PSI et la configuration des cibles SSH, Alwaysdata, Railway ou Heroku ; `deploy` pour les enveloppes de livraison GitHub/GitLab. |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1 | Migrer les règles et l’assistance SaaS vers `service` | [phase-1.md](./phase-1.md) |
| 2 | Séparer la configuration de service et les enveloppes de livraison | [phase-2.md](./phase-2.md) |
| 3 | Retirer le plugin et réconcilier les surfaces publiques | [phase-3.md](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Deux skills `overcode` distinctes, `service` et `deploy` | `service` installe les règles SaaS et configure les cibles ; `deploy` produit les seules enveloppes de livraison. |
| Les stacks conservent leur façade `deploy:*` | `overcode:deploy` ne doit pas dupliquer builds, migrations, synchronisations ou politiques propres à une stack. |
| GitHub et GitLab sont des intégrations de dépôt de `deploy` | Ils fournissent les enveloppes d’automatisation, tandis que SSH, Alwaysdata, Railway et Heroku désignent les cibles de service. |
