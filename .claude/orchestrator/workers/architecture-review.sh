#!/bin/bash
set -e
cd '/Users/alexrobinett/repos/codecollabproj2'
PROMPT=$(cat '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/architecture-review.prompt')
# Prefer claude-code for Max plan compatibility (uses session auth, not API credits)
# Falls back to claude (API mode) if claude-code is unavailable
# Note: Bash intentionally excluded for security - reviewers don't need shell access
if command -v claude-code &> /dev/null; then
  claude-code --allowedTools 'Read,Glob,Grep,Write' --permission-mode 'bypassPermissions' --mcp-config '{"mcpServers":{}}' -p "$PROMPT" 2>&1 | tee '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/architecture-review.log'
else
  claude --allowedTools 'Read,Glob,Grep,Write' --permission-mode 'bypassPermissions' --mcp-config '{"mcpServers":{}}' -p "$PROMPT" 2>&1 | tee '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/architecture-review.log'
fi
echo 'REVIEWER_EXITED' >> '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/architecture-review.log'
