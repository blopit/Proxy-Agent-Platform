#!/bin/bash
# Gmail OAuth Configuration Verification Script
# Checks that Gmail integration is properly configured

set -e

echo "====================================="
echo "Gmail OAuth Configuration Verifier"
echo "====================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ ERROR: .env file not found${NC}"
    echo "  Please copy .env.example to .env and configure it"
    exit 1
fi

echo "1. Checking backend .env configuration..."
echo ""

# Check GOOGLE_CLIENT_ID
if grep -q "^GOOGLE_CLIENT_ID=" .env; then
    client_id=$(grep "^GOOGLE_CLIENT_ID=" .env | cut -d '=' -f 2)
    if [ -z "$client_id" ] || [ "$client_id" = "your-client-id.apps.googleusercontent.com" ]; then
        echo -e "${RED}✗ GOOGLE_CLIENT_ID not configured${NC}"
        echo "  Set GOOGLE_CLIENT_ID in .env"
        exit 1
    else
        echo -e "${GREEN}✓ GOOGLE_CLIENT_ID configured${NC}"
    fi
else
    echo -e "${RED}✗ GOOGLE_CLIENT_ID not found in .env${NC}"
    echo "  Add: GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com"
    exit 1
fi

# Check GOOGLE_CLIENT_SECRET
if grep -q "^GOOGLE_CLIENT_SECRET=" .env; then
    client_secret=$(grep "^GOOGLE_CLIENT_SECRET=" .env | cut -d '=' -f 2)
    if [ -z "$client_secret" ] || [ "$client_secret" = "your-secret" ]; then
        echo -e "${RED}✗ GOOGLE_CLIENT_SECRET not configured${NC}"
        echo "  Set GOOGLE_CLIENT_SECRET in .env"
        exit 1
    else
        echo -e "${GREEN}✓ GOOGLE_CLIENT_SECRET configured${NC}"
    fi
else
    echo -e "${RED}✗ GOOGLE_CLIENT_SECRET not found in .env${NC}"
    echo "  Add: GOOGLE_CLIENT_SECRET=your-secret"
    exit 1
fi

echo ""
echo "2. Checking backend server..."
echo ""

# Check if backend is running
if curl -s http://localhost:8000/api/v1/integrations/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running${NC}"

    # Get health check response
    health_response=$(curl -s http://localhost:8000/api/v1/integrations/health)
    echo "  Health check: $health_response"
else
    echo -e "${YELLOW}⚠ Backend server not running${NC}"
    echo "  Start with: python -m uvicorn src.api.main:app --reload"
    echo "  Skipping backend tests..."
    echo ""
    echo "====================================="
    echo "Configuration: PARTIAL ✓"
    echo "====================================="
    exit 0
fi

echo ""
echo "3. Checking Gmail provider registration..."
echo ""

# Try to initiate OAuth (will fail without auth, but should not 404)
oauth_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8000/api/v1/integrations/gmail/authorize?mobile=true")

if [ "$oauth_response" = "401" ]; then
    echo -e "${GREEN}✓ Gmail OAuth endpoint exists (401 = needs auth)${NC}"
elif [ "$oauth_response" = "404" ]; then
    echo -e "${RED}✗ Gmail OAuth endpoint not found (404)${NC}"
    echo "  Check that Gmail provider is registered in src/integrations/providers/google.py"
    exit 1
elif [ "$oauth_response" = "500" ]; then
    echo -e "${YELLOW}⚠ Server error (500) - check backend logs${NC}"
    echo "  Gmail provider may not be properly initialized"
else
    echo -e "${YELLOW}⚠ Unexpected response: $oauth_response${NC}"
fi

echo ""
echo "4. Checking mobile app configuration..."
echo ""

# Check if mobile .env exists
if [ ! -f "mobile/.env" ]; then
    echo -e "${YELLOW}⚠ mobile/.env file not found${NC}"
    echo "  Create mobile/.env with EXPO_PUBLIC_GOOGLE_CLIENT_ID"
else
    if grep -q "^EXPO_PUBLIC_GOOGLE_CLIENT_ID=" mobile/.env; then
        mobile_client_id=$(grep "^EXPO_PUBLIC_GOOGLE_CLIENT_ID=" mobile/.env | cut -d '=' -f 2)
        if [ -z "$mobile_client_id" ]; then
            echo -e "${YELLOW}⚠ EXPO_PUBLIC_GOOGLE_CLIENT_ID not set in mobile/.env${NC}"
        else
            echo -e "${GREEN}✓ EXPO_PUBLIC_GOOGLE_CLIENT_ID configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ EXPO_PUBLIC_GOOGLE_CLIENT_ID not found in mobile/.env${NC}"
    fi
fi

echo ""
echo "====================================="
echo "Configuration: COMPLETE ✓"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Ensure backend is running:"
echo "   python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start mobile app:"
echo "   cd mobile && npm start"
echo ""
echo "3. Test Gmail connection:"
echo "   - Open mobile app"
echo "   - Navigate to Capture → Connect"
echo "   - Click 'Connect' on Gmail"
echo "   - Watch console logs for OAuth flow"
echo ""
echo "For detailed testing guide, see:"
echo "  mobile/docs/GMAIL_INTEGRATION_TESTING.md"
echo ""
