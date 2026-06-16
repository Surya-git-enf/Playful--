#!/bin/bash
# Automated setup for Claude Code environment
# Install uv if not already installed
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi
# Add ~/.local/bin to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    export PATH="$HOME/.local/bin:$PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi
# Install @anthropic-ai/claude-code globally if not already installed
if ! command -v claude &> /dev/null; then
    echo "Installing @anthropic-ai/claude-code..."
    npm install -g @anthropic-ai/claude-code
fi
# Install Python 3.14 using uv if not already installed
if ! uv python list | grep -q "3.14"; then
    echo "Installing Python 3.14..."
    uv python install 3.14
fi
# Install the free-claude-code tool from GitHub using uv
echo "Installing/updating free-claude-code tool..."
uv tool install --force git+https://github.com/Alishahryar1/free-claude-code.git
# Set environment variables in ~/.bashrc if not already set
if ! grep -q "ANTHROPIC_AUTH_TOKEN" ~/.bashrc; then
    echo 'export ANTHROPIC_AUTH_TOKEN="freecc"' >> ~/.bashrc
fi
if ! grep -q "ANTHROPIC_BASE_URL" ~/.bashrc; then
    echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' >> ~/.bashrc
fi
# Export variables in current session
export ANTHROPIC_AUTH_TOKEN="freecc"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"
# Kill any existing fcc-server processes
echo "Stopping any existing fcc-server processes..."
pkill -f fcc-server || true
# Start fcc-server in background, redirecting output to proxy.log
echo "Starting fcc-server..."
fcc-server >proxy.log 2>&1 &
# Wait for server to start
echo "Waiting for server to start..."
sleep 2
# Launch claude
echo "Launching Claude Code..."
exec claude "$@"
