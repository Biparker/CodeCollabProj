#!/bin/bash
set -e
cd '/Users/alexrobinett/repos/codecollabproj2'
PROMPT=$(cat '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/feature-8.prompt')
# Prefer claude-code for Max plan compatibility (uses session auth, not API credits)
# Falls back to claude (API mode) if claude-code is unavailable
# Worker flags configured via env vars: CLAUDE_SWARM_ALLOWED_TOOLS, CLAUDE_SWARM_PERMISSION_MODE, CLAUDE_SWARM_MCP_SERVERS
if command -v claude-code &> /dev/null; then
  claude-code --allowedTools 'Bash,Read,Write,Edit,Glob,Grep' --permission-mode 'bypassPermissions' --mcp-config '{"mcpServers":{}}' -p "$PROMPT" 2>&1 | tee '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/feature-8.log'
else
  claude --allowedTools 'Bash,Read,Write,Edit,Glob,Grep' --permission-mode 'bypassPermissions' --mcp-config '{"mcpServers":{}}' -p "$PROMPT" 2>&1 | tee '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/feature-8.log'
fi
echo 'WORKER_EXITED' >> '/Users/alexrobinett/repos/codecollabproj2/.claude/orchestrator/workers/feature-8.log'
