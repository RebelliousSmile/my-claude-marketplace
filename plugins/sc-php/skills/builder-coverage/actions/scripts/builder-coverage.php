<?php
/**
 * builder-coverage.php — Gate « couverture builder » pour un thème bloc WordPress FSE.
 *
 * Prouve que CHAQUE composant présent dans le contenu réel des pages dispose
 * d'une block pattern ENREGISTRÉE (donc insérable dans l'éditeur). C'est
 * l'équivalent, pour FSE, de la promesse d'un page-builder (Divi/Elementor) :
 * tout élément de page est un bloc réutilisable et éditable.
 *
 * Lancer via le conteneur wp-env (jamais php wp-cli.phar) :
 *   pnpm dlx @wordpress/env run cli wp eval-file builder-coverage.php
 *
 * Configuration (variables d'environnement, toutes optionnelles) :
 *   BC_PREFIX      préfixe de classe des composants (ex. "mau-").
 *                  Par défaut : auto-détecté (préfixe custom le plus fréquent).
 *   BC_POST_TYPES  liste CSV des post types à auditer (ex. "page,post,sc_service").
 *                  Par défaut : tous les post types publics à éditeur de blocs.
 *   BC_DEPTH       profondeur max pour retenir un composant hors section (défaut 3).
 *
 * Sortie : liste COUVERTS / NON COUVERTS + ligne finale "GAPS: N" (0 = complet).
 */

// ── Normalisation de l'échappement Gutenberg des tirets ──────────────────────
// Dans le JSON des commentaires de blocs, "--" est sérialisé "--".
function bc_norm($s) { return str_replace(['\\u002d', 'u002d'], '-', (string) $s); }

// ── Préfixes utilitaires WP à ignorer lors de la détection/collecte ──────────
$BC_UTIL = ['wp', 'has', 'is', 'are', 'core', 'align', 'wp-block', 'wp-element'];
function bc_is_util($token, $utils) {
    foreach ($utils as $u) { if ($token === $u || strpos($token, $u . '-') === 0) return true; }
    return in_array($token, ['alignwide', 'alignfull', 'aligncenter', 'alignleft', 'alignright'], true);
}

// ── Résolution des post types ────────────────────────────────────────────────
$envTypes = getenv('BC_POST_TYPES');
if ($envTypes) {
    $POST_TYPES = array_values(array_filter(array_map('trim', explode(',', $envTypes)), 'post_type_exists'));
} else {
    // tous les post types publics supportant l'éditeur de blocs
    $POST_TYPES = [];
    foreach (get_post_types(['public' => true], 'names') as $pt) {
        if ($pt === 'attachment') continue;
        $POST_TYPES[] = $pt;
    }
}

$DEPTH = (int) (getenv('BC_DEPTH') ?: 3);

// ── Chargement du contenu publié ─────────────────────────────────────────────
$q = new WP_Query([
    'post_type'      => $POST_TYPES ?: ['page', 'post'],
    'post_status'    => 'publish',
    'posts_per_page' => -1,
    'fields'         => 'ids',
]);

// ── Détection automatique du préfixe si non fourni ──────────────────────────
$PREFIX = getenv('BC_PREFIX') ?: '';
if (!$PREFIX) {
    $tally = [];
    foreach (array_slice($q->posts, 0, 40) as $pid) {
        $p = get_post($pid); if (!$p) continue;
        if (preg_match_all('/class="([^"]+)"/', $p->post_content, $mm)) {
            foreach ($mm[1] as $classAttr) {
                foreach (preg_split('/\s+/', bc_norm($classAttr)) as $c) {
                    if (preg_match('/^([a-z]{2,})-/', $c, $m)) {
                        if (bc_is_util($m[1], $BC_UTIL)) continue;
                        $tally[$m[1] . '-'] = ($tally[$m[1] . '-'] ?? 0) + 1;
                    }
                }
            }
        }
    }
    arsort($tally);
    $PREFIX = key($tally) ?: 'x-';
}

// ── Collecte des composants présents ─────────────────────────────────────────
function bc_roots($cls, $prefix) {
    $cls = bc_norm($cls);
    $out = [];
    foreach (preg_split('/\s+/', (string) $cls) as $c) {
        if (strpos($c, $prefix) !== 0) continue;
        if (strpos($c, '__') !== false) continue;               // sous-élément
        if (strpos($c, '--') !== false) $c = preg_replace('/--.*/', '', $c); // base
        if ($c !== '') $out[$c] = true;
    }
    return array_keys($out);
}
function bc_walk($blocks, &$present, $pid, $prefix, $depth, $maxDepth) {
    foreach ($blocks as $b) {
        if (empty($b['blockName'])) continue;
        $cls = $b['attrs']['className'] ?? '';
        if (!$cls && !empty($b['innerHTML']) && preg_match('/class="([^"]*' . preg_quote($prefix, '/') . '[^"]*)"/', $b['innerHTML'], $m)) {
            $cls = $m[1];
        }
        foreach (bc_roots($cls, $prefix) as $root) {
            if (strpos($root, $prefix . 'section') === 0 || $depth <= $maxDepth) $present[$root][$pid] = true;
        }
        if (!empty($b['innerBlocks'])) bc_walk($b['innerBlocks'], $present, $pid, $prefix, $depth + 1, $maxDepth);
        if ($b['blockName'] === 'core/html' && !empty($b['innerHTML'])
            && preg_match_all('/class="([^"]*' . preg_quote($prefix, '/') . '[^"]*)"/', $b['innerHTML'], $mm)) {
            foreach ($mm[1] as $cl) foreach (bc_roots($cl, $prefix) as $root) $present[$root][$pid] = true;
        }
    }
}

$present = [];
foreach ($q->posts as $pid) {
    $p = get_post($pid); if (!$p) continue;
    bc_walk(parse_blocks($p->post_content), $present, $pid, $PREFIX, 0, $DEPTH);
}
ksort($present);

// ── Blob des patterns enregistrées ───────────────────────────────────────────
$blob = '';
foreach (WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $p) {
    $blob .= ' ' . bc_norm($p['content'] ?? '');
}

// ── Verdict ──────────────────────────────────────────────────────────────────
$covered = []; $missing = [];
foreach ($present as $comp => $pages) {
    if (strpos($blob, $comp) !== false) $covered[] = $comp;
    else $missing[] = [$comp, count($pages), array_slice(array_keys($pages), 0, 6)];
}

echo "builder-coverage · préfixe=«{$PREFIX}» · post_types=" . implode(',', $POST_TYPES) . "\n\n";
echo "== COUVERTS (" . count($covered) . ") ==\n" . implode(', ', $covered) . "\n\n";
echo "== NON COUVERTS (" . count($missing) . ") ==\n";
foreach ($missing as $m) echo sprintf("  %-34s %d page(s)  ex:%s\n", $m[0], $m[1], implode(',', $m[2]));
if (!$missing) echo "  (aucun — couverture complète)\n";
echo "\nGAPS: " . count($missing) . "\n";
