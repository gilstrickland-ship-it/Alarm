#!/bin/bash
# Run this script to complete immediate setup: Watchman + Android env vars

set -e

echo "=== Installing Watchman ==="
if command -v brew &>/dev/null; then
  brew install watchman
  echo "✓ Watchman installed"
else
  echo "⚠ Homebrew not found. Install from https://brew.sh, then run: brew install watchman"
fi

echo ""
echo "=== Android SDK environment ==="
SHELL_RC="$HOME/.zshrc"
if [ -n "$BASH_VERSION" ]; then
  SHELL_RC="$HOME/.bashrc"
fi

ANDROID_BLOCK='
# Android SDK (React Native / Expo) - added by Alarm setup
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
'

if grep -q "ANDROID_HOME" "$SHELL_RC" 2>/dev/null; then
  echo "✓ ANDROID_HOME already in $SHELL_RC"
else
  echo "$ANDROID_BLOCK" >> "$SHELL_RC"
  echo "✓ Added Android env vars to $SHELL_RC"
  echo "  Run: source $SHELL_RC  (or open a new terminal)"
fi

echo ""
echo "=== Next steps ==="
echo "1. Edit .env with your Supabase URL and anon key"
echo "2. For Android: install Android Studio, SDK, and create an emulator"
echo "3. Run: source $SHELL_RC  (if Android vars were just added)"
