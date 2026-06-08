#!/bin/bash

echo "🚀 Booting up AI Engine..."

# Install prerequisites
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

npm install -g @anthropic-ai/claude-code
uv python install 3.12

# Install AI proxy
uv tool install --force git+https://github.com/Alishahryar1/free-claude-code.git

# Sync Claude skills
TEMP_DIR=$(mktemp -d)
if git clone --quiet --depth 1 https://github.com/Surya-git-enf/Claude-skills.git "$TEMP_DIR"; then
    mkdir -p "$HOME/.claude/skills"
    cp -r "$TEMP_DIR"/* "$HOME/.claude/skills/" 2>/dev/null || true
    rm -rf "$TEMP_DIR"
    echo "✅ Skills synced"
fi

# Configure environment
export ANTHROPIC_AUTH_TOKEN="freecc"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"

grep -qxF 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
grep -qxF 'export ANTHROPIC_AUTH_TOKEN="freecc"' ~/.bashrc || echo 'export ANTHROPIC_AUTH_TOKEN="freecc"' >> ~/.bashrc
grep -qxF 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' ~/.bashrc || echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' >> ~/.bashrc

# Load local environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Create .env.example if missing
if [ ! -f .env.example ]; then
    cp .env .env.example 2>/dev/null || touch .env.example
fi

# Start proxy server
pkill -f fcc-server || true
$HOME/.local/bin/fcc-server > proxy.log 2>&1 &
sleep 5

# Verify proxy status
if curl -s http://127.0.0.1:8082 >/dev/null; then
    echo "✅ Proxy running on port 8082"
else
    echo "❌ Proxy startup failed:"
    cat proxy.log
fi

# Launch Claude
npx -y @anthropic-ai/claude-code --continue --dangerously-skip-permissions
