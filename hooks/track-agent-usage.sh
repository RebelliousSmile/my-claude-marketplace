#!/bin/bash
# Track agent (Task tool) usage for analytics
# Logs each invocation to .claude/logs/agent-usage.log

LOG_DIR="$(dirname "$0")/../logs"
LOG_FILE="$LOG_DIR/agent-usage.log"

# Create log directory if needed
mkdir -p "$LOG_DIR"

# Read hook input from stdin
INPUT=$(cat)

# Extract agent type from JSON input
# Input format: {"tool_name": "Task", "tool_input": {"subagent_type": "type", "prompt": "...", "description": "..."}}
AGENT_TYPE=$(echo "$INPUT" | grep -o '"subagent_type"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"subagent_type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
DESCRIPTION=$(echo "$INPUT" | grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"description"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | head -c 50)

# Get timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Log the usage
if [ -n "$AGENT_TYPE" ]; then
    echo "$TIMESTAMP | agent: $AGENT_TYPE | desc: $DESCRIPTION" >> "$LOG_FILE"
fi

# Exit successfully (don't block the tool)
exit 0
