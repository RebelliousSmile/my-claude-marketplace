#!/bin/bash
# Script : Validation Patterns SmartLockers
# Description : Détection automatique violations patterns critiques
# Usage : ./.claude/scripts/validate_patterns.sh <file.php>

set -e

file="$1"

if [ -z "$file" ]; then
    echo "Usage: $0 <file.php>"
    exit 1
fi

if [ ! -f "$file" ]; then
    echo "❌ Fichier non trouvé : $file"
    exit 1
fi

echo "🔍 Validation Patterns SmartLockers"
echo "Fichier : $file"
echo ""

critical_count=0
warning_count=0

# ============================================================================
# Pattern 1 : Cache-First Obligatoire
# ============================================================================
echo "📋 [1/5] Cache-First Pattern..."

if grep -q "http_get\|http_post" "$file"; then
    if ! grep -q "api_resilient_call" "$file"; then
        echo "🔴 CRITIQUE: Appels API sans cache-first détectés"
        echo "   → Utiliser api_resilient_call() pour tous les appels API"
        critical_count=$((critical_count + 1))
    else
        echo "   ✅ Cache-first OK"
    fi
else
    echo "   ℹ️  Pas d'appels API détectés"
fi

# ============================================================================
# Pattern 2 : Multi-Tenant Isolation
# ============================================================================
echo "📋 [2/5] Multi-Tenant Isolation..."

if grep -q "^function client_" "$file"; then
    if ! grep -q "client_validate_access" "$file"; then
        echo "🔴 CRITIQUE: Validation multi-tenant manquante dans fonctions client_*"
        echo "   → Ajouter client_validate_access() en début de fonctions client"
        critical_count=$((critical_count + 1))
    else
        echo "   ✅ Multi-tenant validation OK"
    fi
else
    echo "   ℹ️  Pas de fonctions client_* détectées"
fi

# ============================================================================
# Pattern 3 : UUID Locker Naming
# ============================================================================
echo "📋 [3/5] UUID Locker Naming..."

if grep -q '\$lockerId' "$file"; then
    count=$(grep -c '\$lockerId' "$file")
    echo "🟡 ATTENTION: Variable \$lockerId détectée ($count occurrences)"
    echo "   → Utiliser \$lockerUuid pour clarté (UUID VARCHAR 36, pas ID numérique)"
    warning_count=$((warning_count + 1))

    # Afficher lignes concernées
    grep -n '\$lockerId' "$file" | head -5 | while read line; do
        line_num=$(echo "$line" | cut -d: -f1)
        echo "   Ligne $line_num : $(echo "$line" | cut -d: -f2- | xargs)"
    done
else
    echo "   ✅ UUID naming OK"
fi

# ============================================================================
# Pattern 4 : Sanitisation Inputs
# ============================================================================
echo "📋 [4/5] Sanitisation Inputs..."

if grep -q '\$_GET\|\$_POST\|\$_REQUEST' "$file"; then
    # Détecter utilisation directe sans sanitisation
    unsanitized=$(grep -n '\$_GET\|\$_POST\|\$_REQUEST' "$file" | grep -v "sanitize\|validate\|(int)\|(float)\|(bool)" || true)

    if [ -n "$unsanitized" ]; then
        count=$(echo "$unsanitized" | wc -l)
        echo "🔴 CRITIQUE: Inputs non sanitisés détectés ($count occurrences)"
        echo "   → Utiliser sanitize_*() ou cast (int), (float), (bool)"
        critical_count=$((critical_count + 1))

        # Afficher 3 premières occurrences
        echo "$unsanitized" | head -3 | while read line; do
            line_num=$(echo "$line" | cut -d: -f1)
            echo "   Ligne $line_num : $(echo "$line" | cut -d: -f2- | xargs | cut -c1-60)..."
        done
    else
        echo "   ✅ Sanitisation OK"
    fi
else
    echo "   ℹ️  Pas d'utilisation \$_GET/\$_POST/\$_REQUEST"
fi

# ============================================================================
# Pattern 5 : PHPDoc Complète
# ============================================================================
echo "📋 [5/5] PHPDoc Complète..."

func_count=$(grep -c "^function " "$file" || echo "0")
phpdoc_count=$(grep -c "^\s*\* @param\|^\s*\* @return" "$file" || echo "0")

if [ "$func_count" -gt 0 ]; then
    coverage=$((phpdoc_count * 100 / func_count))

    if [ "$coverage" -lt 80 ]; then
        echo "🟡 ATTENTION: PHPDoc incomplète ($phpdoc_count/$func_count fonctions = $coverage%)"
        echo "   → Ajouter PHPDoc avec @param, @return, @throws sur toutes fonctions publiques"
        warning_count=$((warning_count + 1))
    else
        echo "   ✅ PHPDoc OK ($coverage% couverture)"
    fi
else
    echo "   ℹ️  Pas de fonctions détectées"
fi

# ============================================================================
# Résumé Final
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Fichier : $file"
echo ""
echo "🔴 Problèmes critiques : $critical_count"
echo "🟡 Avertissements : $warning_count"
echo ""

if [ "$critical_count" -eq 0 ] && [ "$warning_count" -eq 0 ]; then
    echo "✅ TOUS LES PATTERNS RESPECTÉS"
    echo ""
    exit 0
elif [ "$critical_count" -eq 0 ]; then
    echo "⚠️  APPROUVÉ AVEC RÉSERVES (corriger avertissements)"
    echo ""
    exit 0
else
    echo "❌ REFUSÉ (corriger problèmes critiques avant merge)"
    echo ""
    exit 1
fi
