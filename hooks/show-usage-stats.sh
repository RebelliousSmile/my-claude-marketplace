#!/bin/bash
# Display combined usage statistics (skills + agents)
# Usage: ./show-usage-stats.sh [days]

LOG_DIR="$(dirname "$0")/../logs"
SKILL_LOG="$LOG_DIR/skill-usage.log"
AGENT_LOG="$LOG_DIR/agent-usage.log"

DAYS=${1:-30}

# Cross-platform date calculation
if date -v-1d > /dev/null 2>&1; then
    # macOS
    CUTOFF_DATE=$(date -v-${DAYS}d '+%Y-%m-%d')
else
    # Linux/Git Bash
    CUTOFF_DATE=$(date -d "$DAYS days ago" '+%Y-%m-%d' 2>/dev/null || date '+%Y-%m-%d')
fi

echo "=== Usage Statistics (last $DAYS days) ==="
echo ""

# Skills/Commands section
echo "## Skills/Commands:"
if [ -f "$SKILL_LOG" ]; then
    grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$SKILL_LOG" | \
        awk -v cutoff="$CUTOFF_DATE" '$1 >= cutoff' | \
        grep -o 'skill: [^|]*' | \
        sed 's/skill: //' | \
        sort | uniq -c | sort -rn | \
        head -15
    SKILL_COUNT=$(grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$SKILL_LOG" | awk -v cutoff="$CUTOFF_DATE" '$1 >= cutoff' | wc -l | tr -d ' ')
else
    echo "  (no data yet)"
    SKILL_COUNT=0
fi

echo ""

# Agents section
echo "## Agents:"
if [ -f "$AGENT_LOG" ]; then
    grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$AGENT_LOG" | \
        awk -v cutoff="$CUTOFF_DATE" '$1 >= cutoff' | \
        grep -o 'agent: [^|]*' | \
        sed 's/agent: //' | \
        sort | uniq -c | sort -rn | \
        head -15
    AGENT_COUNT=$(grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$AGENT_LOG" | awk -v cutoff="$CUTOFF_DATE" '$1 >= cutoff' | wc -l | tr -d ' ')
else
    echo "  (no data yet)"
    AGENT_COUNT=0
fi

echo ""

# Combined by date
echo "## By date (combined):"
{
    [ -f "$SKILL_LOG" ] && grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$SKILL_LOG"
    [ -f "$AGENT_LOG" ] && grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$AGENT_LOG"
} 2>/dev/null | \
    awk -v cutoff="$CUTOFF_DATE" '$1 >= cutoff' | \
    cut -d' ' -f1 | \
    sort | uniq -c | sort -r | \
    head -10

echo ""

# Totals
TOTAL=$((SKILL_COUNT + AGENT_COUNT))
echo "## Totals:"
echo "  Skills:   $SKILL_COUNT"
echo "  Agents:   $AGENT_COUNT"
echo "  Combined: $TOTAL"
