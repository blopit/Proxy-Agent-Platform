#!/bin/bash
set -ex

# Debug information
echo "======= BUILD DEBUG INFO ======="
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PATH: $PATH"
echo "================================"

# Install Next.js globally to ensure it's in PATH
echo "Installing Next.js globally..."
npm install -g next@14.0.4
npm install -g npx

# Ensure local installation also exists
echo "Installing Next.js locally..."
npm install next@14.0.4 --no-save

# Explicitly set PATH to include global npm binaries
export PATH="$PATH:$(npm root -g)"
echo "Updated PATH: $PATH"

# Run Next.js build with full path to npx
echo "Running Next.js build with explicit path..."
$(npm bin)/next build || $(which npx) next build || node_modules/.bin/next build

# Exit successfully
echo "Build completed successfully"
exit 0 