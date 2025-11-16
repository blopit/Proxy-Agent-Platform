#!/bin/bash

# Postbuild Script - Run after successful build
# Upload source maps, notify team, update changelogs

set -e  # Exit on error

echo "🎉 Running postbuild script..."

APP_ENV=${APP_ENV:-development}
APP_VERSION=${APP_VERSION:-1.0.0}

echo "📦 Build completed for: $APP_ENV (v$APP_VERSION)"

# Upload source maps to Sentry (if configured)
if [ -n "$SENTRY_DSN" ] && [ -n "$SENTRY_AUTH_TOKEN" ]; then
  echo "📤 Uploading source maps to Sentry..."

  if command -v sentry-cli &> /dev/null; then
    sentry-cli releases new "$APP_VERSION"
    sentry-cli releases files "$APP_VERSION" upload-sourcemaps ./dist
    sentry-cli releases finalize "$APP_VERSION"
    sentry-cli releases deploys "$APP_VERSION" new -e "$APP_ENV"
    echo "✅ Source maps uploaded"
  else
    echo "⚠️  sentry-cli not found, skipping source map upload"
  fi
fi

# Generate build report
echo "📊 Generating build report..."
cat > build-report.txt << EOF
Build Report
============
Environment: $APP_ENV
Version: $APP_VERSION
Build Date: $(date)
Platform: iOS & Android
Status: Success

Next Steps:
- Test build on physical devices
- Submit to TestFlight/Play Internal Testing
- Monitor crash reports
- Update release notes
EOF

echo "✅ Build report generated: build-report.txt"

# Notify team (placeholder)
echo "📢 Build notifications would be sent here"
# curl -X POST "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
#   -d "{\"text\":\"✅ New build available: v$APP_VERSION ($APP_ENV)\"}"

echo ""
echo "🎉 Postbuild complete!"
echo ""
echo "Next steps:"
echo "1. Download build from EAS"
echo "2. Test on physical devices"
echo "3. Submit to app stores"
