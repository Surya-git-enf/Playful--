

echo "🚀 Booting up Modular AI God-Mode..."

# ============================================
# 1. Install Core Tools
# ============================================

curl -LsSf https://astral.sh/uv/install.sh | sh

export PATH="$HOME/.local/bin:$PATH"

npm install -g @anthropic-ai/claude-code

uv python install 3.14

# ============================================
# 2. Install CLEAN Engine
# ============================================

echo "⚙️ Installing AI engine..."

uv tool install --force \
  git+https://github.com/Alishahryar1/free-claude-code.git

# ============================================
# 3. Inject Custom Skills / Personas
# ============================================

if [ ! -d "$HOME/.claude/skills" ]; then

  echo "🧠 Downloading custom AI personas..."

  TEMP_DIR=$(mktemp -d)

  git clone --depth 1 \
    https://github.com/Surya-git-enf/Claude-skills.git \
    "$TEMP_DIR"

  mkdir -p "$HOME/.claude/skills"

  cp -r "$TEMP_DIR"/* \
    "$HOME/.claude/skills/"

  rm -rf "$TEMP_DIR"

else
  echo "⚡ Custom personas already loaded! Skipping..."
fi

# ============================================
# 4. Configure Claude Routing
# ============================================

export ANTHROPIC_AUTH_TOKEN="freecc"

export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"

# Persist variables
grep -qxF 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc || \
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

grep -qxF 'export ANTHROPIC_AUTH_TOKEN="freecc"' ~/.bashrc || \
echo 'export ANTHROPIC_AUTH_TOKEN="freecc"' >> ~/.bashrc

grep -qxF 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' ~/.bashrc || \
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' >> ~/.bashrc

source ~/.bashrc

# ============================================
# 5. Load Local .env Variables
# ============================================

if [ -f .env ]; then

  echo "📂 Loading API keys from local .env..."

  set -a
  source .env
  set +a

else

  echo "⚠️ WARNING: No .env file found!"

fi

# ============================================
# 6. Fix Missing .env.example Issue
# ============================================

if [ ! -f .env.example ]; then
  cp .env .env.example 2>/dev/null || touch .env.example
fi

# ============================================
# 7. Kill Old Proxy
# ============================================

pkill -f fcc-server || true

# ============================================
# 8. Start Proxy Server
# ============================================

echo "⚡ Booting Engine..."

$HOME/.local/bin/fcc-server \
  > proxy.log 2>&1 &

sleep 5

# ============================================
# 9. Verify Proxy Status
# ============================================

if lsof -i :8082 > /dev/null; then

  echo "✅ Proxy server running on port 8082"

else

  echo "❌ Proxy failed to start"
  echo "📄 Proxy Logs:"
  cat proxy.log

fi

# ============================================
# 10. Launch Claude Interface
# ============================================

echo "🚀 Launching AI Interface..."

npx -y @anthropic-ai/claude-code \
  --continue \
  --dangerously-skip-permissions
  claude
