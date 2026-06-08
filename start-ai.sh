#!/bin/bash

echo "🚀 Booting up Modular AI God-Mode..."

============================================

1. Install Core Tools

============================================

curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
npm install -g @anthropic-ai/claude-code
uv python install 3.14

============================================

2. Install CLEAN Engine

============================================

echo "⚙️ Installing AI engine..."
uv tool install --force git+https://github.com/Alishahryar1/free-claude-code.git

============================================

3. Sync Global AI Personas (Always Fresh)

============================================

echo "🧠 Syncing global AI personas..."
TEMP_DIR=$(mktemp -d)

We clone and overwrite to ensure you always have the latest rules

if git clone --quiet --depth 1 https://github.com/Surya-git-enf/Claude-skills.git "$TEMP_DIR"; then
mkdir -p "$HOME/.claude/skills"
cp -r "$TEMP_DIR"/* "$HOME/.claude/skills/" 2>/dev/null || true
rm -rf "$TEMP_DIR"
echo "⚡ Global skills synced and loaded!"
else
echo "⚠️ Could not reach skills repo. Using local cached skills..."
fi

============================================

4. Configure Claude Routing

============================================

export ANTHROPIC_AUTH_TOKEN="freecc"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"

Persist variables globally

grep -qxF 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
grep -qxF 'export ANTHROPIC_AUTH_TOKEN="freecc"' ~/.bashrc || echo 'export ANTHROPIC_AUTH_TOKEN="freecc"' >> ~/.bashrc
grep -qxF 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' ~/.bashrc || echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' >> ~/.bashrc
source ~/.bashrc

============================================

5. Load Local .env Variables

============================================

if [ -f .env ]; then
echo "📂 Loading API keys from local .env..."
set -a
source .env
set +a
else
echo "⚠️ WARNING: No .env file found! Checking global secrets..."
fi

============================================

6. Fix Missing .env.example Issue

============================================

if [ ! -f .env.example ]; then
cp .env .env.example 2>/dev/null || touch .env.example
fi

============================================

7. Start Proxy Server

============================================

pkill -f fcc-server || true
echo "⚡ Booting Engine..."
$HOME/.local/bin/fcc-server > proxy.log 2>&1 &
sleep 5

============================================

8. Verify Proxy Status (Crash-Proof Check)

============================================

if curl -s http://127.0.0.1:8082 > /dev/null; then
echo "✅ Proxy server running on port 8082"
else
echo "❌ Proxy failed to start. Logs:"
cat proxy.log
fi

============================================

9. Launch Claude Interface

============================================

echo "🚀 Launching AI Interface..."
npx -y @anthropic-ai/claude-code --continue --dangerously-skip-permissions
