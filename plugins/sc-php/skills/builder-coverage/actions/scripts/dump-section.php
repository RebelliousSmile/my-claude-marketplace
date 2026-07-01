<?php
/**
 * dump-section.php — extrait la sérialisation du bloc de plus haut niveau dont le
 * sous-arbre contient une classe donnée. Sert de SOURCE FIDÈLE pour créer la
 * pattern éditable d'un composant non couvert (repérer le markup natif déjà en DB).
 *
 * Paramètres via variables d'environnement (wp-env intercepte les positionnels) :
 *   BC_DUMP_POST   ID du post contenant le composant (obligatoire)
 *   BC_DUMP_CLASS  classe recherchée, ex. "mau-contact-card" (obligatoire)
 *
 * Usage :
 *   BC_DUMP_POST=181 BC_DUMP_CLASS=mau-contact-card \
 *     pnpm dlx @wordpress/env run cli wp eval-file dump-section.php
 */

$pid    = (int) getenv('BC_DUMP_POST');
$needle = (string) getenv('BC_DUMP_CLASS');
if (!$pid || !$needle) { fwrite(STDERR, "BC_DUMP_POST et BC_DUMP_CLASS requis\n"); return; }

$post = get_post($pid);
if (!$post) { fwrite(STDERR, "post $pid introuvable\n"); return; }

function bc_contains($block, $needle) {
    $h = ($block['innerHTML'] ?? '') . ' ' . json_encode($block['attrs'] ?? []);
    if (strpos($h, $needle) !== false) return true;
    foreach (($block['innerBlocks'] ?? []) as $ib) if (bc_contains($ib, $needle)) return true;
    return false;
}

foreach (parse_blocks($post->post_content) as $b) {
    if (empty($b['blockName'])) continue;
    if (bc_contains($b, $needle)) { echo serialize_block($b); echo "\n"; return; }
}
fwrite(STDERR, "classe $needle introuvable dans le post $pid\n");
