#!/bin/bash
# Script to save terminal state for easy restoration

# Save current directory
pwd > ~/.saved_cwd

# Save environment variables that might be important
printenv | grep -E '(CLAUDE|ANTHROPIC|PROXY|PORT)' > ~/.saved_env 2>/dev/null || true

# Save shell history
history > ~/.saved_history

# Save list of open files/tabs if possible (limited)
ls -la > ~/.saved_directory_listing

echo "Terminal state saved:"
echo "  - Current directory: $(cat ~/.saved_cwd)"
echo "  - History lines: $(wc -l < ~/.saved_history)"
echo "  - Environment variables saved"
echo "To restore: source restore_terminal_state.sh"