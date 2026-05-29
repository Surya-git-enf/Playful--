
cat << 'EOF' > start-ai.sh
#!/bin/bash

echo "🚀 Booting up AI God-Mode..."

# 1. Install Package Managers
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
npm install -g @anthropic-ai/claude-code
uv python install 3.14

# 2. Install Custom Proxy
uv tool install --force git+https://github.com/Surya-git-enf/free-claude-code.git

# 3. Smart-Inject Custom Skills (Lightning Fast)
if [ ! -d "$HOME/.claude/skills" ]; then
  echo "🧠 Downloading skills for the first time..."
  TEMP_DIR=$(mktemp -d)
  git clone --depth 1 https://github.com/Surya-git-enf/free-claude-code.git $TEMP_DIR
  mkdir -p ~/.claude
  cp -r $TEMP_DIR/.claude/skills ~/.claude/skills
  rm -rf $TEMP_DIR
else
  echo "⚡ Skills already loaded! Skipping download..."
fi

# 4. Set Routing
export ANTHROPIC_AUTH_TOKEN="freecc"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"

# Persist variables
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN="freecc"' >> ~/.bashrc
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8082"' >> ~/.bashrc
echo 'alias ai="claude --continue --dangerously-skip-permissions"' >> ~/.bashrc
source ~/.bashrc

# 4.5 Load the .env file variables
if [ -f .env ]; then
  echo "📂 Loading variables from .env file..."
  set -a
  source .env
  set +a
else
  echo "⚠️ WARNING: No .env file found!"
fi

# 5. Boot Server
pkill -f fcc-server || true
fcc-server > proxy.log 2>&1 &
sleep 2

# 6. Launch Engine
echo "⚡ Launching Claude..."
claude --continue --dangerously-skip-permissions
EOF

# Ensure it is executable
chmod +x start-ai.sh
