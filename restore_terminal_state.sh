#!/bin/bash
# Script to restore terminal state

if [ -f ~/.saved_cwd ]; then
    cd "$(cat ~/.saved_cwd)" || echo "Could not change to saved directory"
    echo "Changed to directory: $(cat ~/.saved_cwd)"
else
    echo "No saved directory found"
fi

if [ -f ~/.saved_env ]; then
    # Source the environment variables (export them)
    while IFS= read -r line; do
        export "$line"
    done < ~/.saved_env
    echo "Environment variables restored"
else
    echo "No saved environment found"
fi

if [ -f ~/.saved_history ]; then
    # Append saved history to current session's history
    cat ~/.saved_history >> ~/.bash_history
    history -r ~/.bash_history
    echo "History restored"
else
    echo "No saved history found"
fi

if [ -f ~/.saved_directory_listing ]; then
    echo "Directory listing at save time:"
    cat ~/.saved_directory_listing
else
    echo "No directory listing saved"
fi

echo "Terminal state restoration complete."