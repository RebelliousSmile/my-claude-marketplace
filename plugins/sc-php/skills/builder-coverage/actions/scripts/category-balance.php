<?php
/**
 * category-balance.php — lint d'organisation des patterns (méthode builder-coverage).
 *
 * Vérifie que la bibliothèque de patterns est bien RANGÉE, pas seulement complète :
 *   - aucune catégorie fourre-tout (> BC_MAX par défaut 8) ;
 *   - aucune pattern insérable sans catégorie ;
 *   - signale les patterns multi-catégories (une primaire recommandée) ;
 *   - liste l'effectif par catégorie (pour repérer les déséquilibres).
 *
 * Lancer : pnpm dlx @wordpress/env run cli wp eval-file category-balance.php
 * Config : BC_MAX (taille max d'une catégorie avant alerte, défaut 8).
 */

$MAX = (int) (getenv('BC_MAX') ?: 8);

$all = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
$byCat = []; $noCat = []; $multi = [];
foreach ($all as $p) {
    if (($p['inserter'] ?? true) === false) continue;        // patterns cachées ignorées
    $cats = $p['categories'] ?? [];
    if (!$cats) { $noCat[] = $p['title']; continue; }
    if (count($cats) > 1) $multi[] = $p['title'] . ' [' . implode(',', $cats) . ']';
    foreach ($cats as $c) $byCat[$c][] = $p['title'];
}
ksort($byCat);

echo "== Effectif par catégorie (max conseillé: {$MAX}) ==\n";
$over = [];
foreach ($byCat as $c => $titles) {
    $n = count($titles);
    $flag = $n > $MAX ? '  ⚠ FOURRE-TOUT' : '';
    if ($n > $MAX) $over[] = $c;
    echo sprintf("  %-16s %2d%s\n", $c, $n, $flag);
}

echo "\n== Alertes ==\n";
$issues = 0;
if ($over)  { echo "  ⚠ " . count($over) . " catégorie(s) > {$MAX} : " . implode(', ', $over) . " → scinder par sous-rôle.\n"; $issues++; }
if ($noCat) { echo "  ⚠ " . count($noCat) . " pattern(s) insérable(s) sans catégorie : " . implode('; ', $noCat) . "\n"; $issues++; }
if ($multi) { echo "  ℹ " . count($multi) . " pattern(s) multi-catégories (préférer une primaire) : " . implode('; ', $multi) . "\n"; }
if (!$issues) echo "  ✅ organisation saine : aucune catégorie fourre-tout, aucune pattern orpheline.\n";

echo "\nISSUES: {$issues}\n";
