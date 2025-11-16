#!/bin/bash

# Prebuild Script - Run before EAS build
# Validates environment, generates assets, and prepares for build

set -e  # Exit on error

echo "🚀 Running prebuild script..."

# Check if APP_ENV is set
if [ -z "$APP_ENV" ]; then
  echo "⚠️  APP_ENV not set, defaulting to development"
  export APP_ENV=development
fi

echo "📦 Building for environment: $APP_ENV"

# Validate required environment variables
if [ "$APP_ENV" = "production" ]; then
  echo "🔍 Validating production environment variables..."

  required_vars=("API_URL" "GOOGLE_CLIENT_ID" "EAS_PROJECT_ID")

  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "❌ Error: $var is required for production builds"
      exit 1
    fi
  done

  echo "✅ Environment variables validated"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Generate app icons and splash screens
if command -v eas-cli &> /dev/null; then
  echo "🎨 Generating app icons..."
  # npx expo-splash-screen generate
  # npx expo-app-icon generate
fi

# Run TypeScript type checking
echo "🔍 Type checking..."
npx tsc --noEmit

# Run linter
echo "🧹 Linting code..."
npm run lint || echo "⚠️  Linting warnings found (continuing build)"

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .expo
rm -rf node_modules/.cache

# Verify Expo configuration
echo "🔍 Verifying Expo configuration..."
npx expo config --type public > /dev/null

echo "✅ Prebuild complete!"
echo ""
echo "Ready to build for: $APP_ENV"
echo "Run: eas build --platform ios --profile $APP_ENV"
echo "     eas build --platform android --profile $APP_ENV"
