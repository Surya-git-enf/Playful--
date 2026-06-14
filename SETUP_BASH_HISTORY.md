# Setup Persistent Bash History for Claude Code

This document describes how to set up persistent Bash history for Claude Code in the environment.

## Steps Taken

1. **Created the `.claude` directory** (if it didn't exist):
   ```bash
   mkdir -p "$HOME/.claude"
   ```

2. **Configured Bash history persistence** by adding the following lines to `~/.bashrc`:
   ```bash
   export HISTFILE="$HOME/.bash_history"
   export HISTSIZE=1000
   export HISTFILESIZE=2000
   shopt -s histappend
   ```

3. **Created a history summary script** at `~/.claude/history_summary`:
   ```bash
   #!/usr/bin/env bash
   # Script to show last 10 Claude Code conversation entries from ~/.claude/history.jsonl
   HISTORY_FILE="$HOME/.claude/history.jsonl"

   if [[ -f "$HISTORY_FILE" ]]; then
       # Get last 10 lines
       tail -n 10 "$HISTORY_FILE" | while IFS= read -r line; do
           if command -v jq >/dev/null 2>&1; then
               # Try to extract timestamp field
               ts=$(echo "$line" | jq -r '.timestamp // empty' 2>/dev/null)
               if [[ -n "$ts" && "$ts" != "null" ]]; then
                   echo "[$ts] $line"
               else
                   echo "$line"
               fi
           else
               echo "$line"
           fi
       done
   fi
   ```
   Made it executable: `chmod +x "$HOME/.claude/history_summary"`

4. **Added a convenience alias** to `~/.bashrc`:
   ```bash
   alias claude-history="$HOME/.claude/history_summary"
   ```

5. **Configured automatic display** on shell startup by adding to `~/.bashrc`:
   ```bash
   # Show Claude Code conversation history on shell startup
   $HOME/.claude/history_summary
   ```

6. **Applied changes immediately** by sourcing `~/.bashrc`:
   ```bash
   source "$HOME/.bashrc"
   ```

## Verification

- Bash history settings are now persistent across sessions.
- The `claude-history` command (or `$HOME/.claude/history_summary`) displays the last 10 Claude conversation entries with timestamps when available.
- The setup is safe and works even if the Claude history file does not exist.
- Configuration is compatible with all repositories in this environment.

## Files Modified (in Home Directory)

- `~/.bashrc` - Added history settings, alias, and auto-execution
- `~/.claude/history_summary` - The history summary script
- `~/.bash_history` - Bash history file (now persisted)

## Notes

- These settings are user-specific and apply to the current user's Bash sessions.
- To apply changes in an existing terminal, run: `source ~/.bashrc`
- The history summary script requires `jq` for timestamp formatting (falls back to raw lines if `jq` is not available).

## Automation Setup (Added Later)

In addition to the bash history setup, the following automation was added to `~/.bashrc` to run on every shell startup:

```bash
# ==== Claude Code automation setup ====
# Install uv if not present
if ! command -v uv &> /dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi
export PATH="$HOME/.local/bin:$PATH"

# Install @anthropic-ai/claude-code globally if not present
if ! npm list -g @anthropic-ai/claude-code &> /dev/null; then
    npm install -g @anthropic-ai/claude-code
fi

# Install uv python 3.14 if not installed
if ! uv python list | grep -q "3.14"; then
    uv python install 3.14
fi

# Install free-claude-code tool if not present or force update
if ! uv tool list | grep -q "free-claude-code"; then
    uv tool install --force git+https://github.com/Alishahryar1/free-claude-code.git
else
    # Optionally update
    uv tool upgrade --force git+https://github.com/Alishahryar1/free-claude-code.git
fi

# Set environment variables
export ANTHROPIC_AUTH_TOKEN="freecc"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"

# Start fcc-server if not already running
if ! pgrep -f fcc-server > /dev/null; then
    pkill -f fcc-server || true
    fcc-server > "$HOME/proxy.log" 2>&1 &
fi

# Small delay to ensure server is up
sleep 2
```

This automation ensures that:
1. `uv` is installed and in PATH
2. `@anthropic-ai/claude-code` is installed globally via npm
3. Python 3.14 is installed via uv
4. The `free-claude-code` tool is installed/updated from GitHub
5. Required environment variables are set
6. The `fcc-server` is started in the background (if not already running) and logs to `~/proxy.log`
