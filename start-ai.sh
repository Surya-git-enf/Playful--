#!/bin/bash

echo "🚀 Booting up AI God-Mode..."

# 1. Install Package Managers
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

npm install -g @anthropic-ai/claude-code

uv python install 3.14

# 2. Install Custom Proxy
uv tool install --force git+https://github.com/Surya-git-enf/free-claude-code.git

# 3. Inject Custom Skills
rm -rf ~/.claude/skills
git clone https://github.com/Surya-git-enf/Claude-skills.git ~/.claude/skills

# 4. Set Routing
export ANTHROPIC_AUTH_TOKEN="freecc"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"

# Persist variables
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN="freecc"' >> ~/.bashrc
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' >> ~/.bashrc
echo 'alias ai="claude --continue --dangerously-skip-permissions"' >> ~/.bashrc

source ~/.bashrc

# 5. Boot Server
pkill -f fcc-server || true
fcc-server > proxy.log 2>&1 &

sleep 2

# 6. Launch Engine
echo "⚡ Launching Claude..."
claude --continue --dangerously-skip-permissions
