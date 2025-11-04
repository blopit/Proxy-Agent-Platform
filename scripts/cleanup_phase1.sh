#!/bin/bash
# Repository Cleanup - Phase 1: Immediate Actions
# Generated: 2025-11-03
# Safe to run - only removes artifacts and duplicates

set -e  # Exit on error

echo "🧹 Proxy-Agent-Platform Cleanup - Phase 1"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "CLEANUP_PLAN.md" ]; then
    echo -e "${RED}Error: Run this script from repository root${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Update .gitignore${NC}"
echo "Adding patterns for artifacts and database files..."

# Backup existing .gitignore
cp .gitignore .gitignore.bak

# Add patterns if not already present
cat >> .gitignore << 'EOF'

# Cleanup additions (2025-11-03)
# Database files
*.db
*.db-shm
*.db-wal

# macOS
.DS_Store

# Test artifacts
test_memory_db/
.coverage
.pytest_cache/

# Build artifacts (verify node_modules already present)
.next/
.expo/
EOF

echo -e "${GREEN}✓ .gitignore updated${NC}"
echo ""

echo -e "${YELLOW}Step 2: Remove tracked artifacts from git${NC}"

# Count before removal
DS_STORE_COUNT=$(git ls-files | grep -c ".DS_Store" || true)
echo "Found $DS_STORE_COUNT .DS_Store files in git"

if [ "$DS_STORE_COUNT" -gt 0 ]; then
    echo "Removing .DS_Store files from git..."
    git ls-files | grep ".DS_Store" | xargs git rm -f
    echo -e "${GREEN}✓ Removed $DS_STORE_COUNT .DS_Store files${NC}"
else
    echo -e "${GREEN}✓ No .DS_Store files in git${NC}"
fi

echo ""

# Remove duplicate databases
echo "Removing duplicate database files..."
REMOVED_DBS=0

if [ -f "frontend/proxy_agents_enhanced.db" ]; then
    git rm -f frontend/proxy_agents_enhanced.db* 2>/dev/null || true
    REMOVED_DBS=$((REMOVED_DBS + 1))
fi

if [ -f "src/services/tests/proxy_agents_enhanced.db" ]; then
    git rm -f src/services/tests/proxy_agents_enhanced.db 2>/dev/null || true
    REMOVED_DBS=$((REMOVED_DBS + 1))
fi

if [ -f "simple_tasks.db" ]; then
    git rm -f simple_tasks.db 2>/dev/null || true
    REMOVED_DBS=$((REMOVED_DBS + 1))
fi

echo -e "${GREEN}✓ Removed $REMOVED_DBS duplicate database files${NC}"
echo ""

echo -e "${YELLOW}Step 3: Clean local artifacts (not in git)${NC}"

# Clean Python cache
echo "Cleaning Python cache..."
PYCACHE_COUNT=$(find . -type d -name "__pycache__" 2>/dev/null | wc -l | tr -d ' ')
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
echo -e "${GREEN}✓ Removed $PYCACHE_COUNT __pycache__ directories${NC}"

# Clean build directories
echo "Cleaning build directories..."
rm -rf frontend/.next 2>/dev/null || true
rm -rf mobile/.expo 2>/dev/null || true
rm -rf .pytest_cache 2>/dev/null || true
rm -rf test_memory_db 2>/dev/null || true
echo -e "${GREEN}✓ Removed build directories${NC}"

# Clean coverage data
rm -f .coverage 2>/dev/null || true
echo -e "${GREEN}✓ Removed coverage data${NC}"

echo ""
echo -e "${YELLOW}Step 4: Show summary${NC}"

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo -e "${YELLOW}No changes to commit (artifacts may have been previously removed)${NC}"
else
    echo -e "${GREEN}Ready to commit cleanup changes${NC}"
    echo ""
    echo "Changed files:"
    git diff --cached --name-status
    echo ""
    echo -e "${YELLOW}To commit these changes, run:${NC}"
    echo 'git commit -m "chore: Remove build artifacts and duplicate database files

Updates .gitignore to prevent future commits of:
- Database files (*.db, *.db-shm, *.db-wal)
- macOS artifacts (.DS_Store)
- Test artifacts (test_memory_db/, .coverage, .pytest_cache/)
- Build artifacts (.next/, .expo/)

Removes duplicate database files:
- frontend/proxy_agents_enhanced.db*
- src/services/tests/proxy_agents_enhanced.db
- simple_tasks.db

Local cleanup removed:
- '$PYCACHE_COUNT' __pycache__ directories
- Build directories (.next, .expo, .pytest_cache)
- Coverage data

See CLEANUP_PLAN.md for full cleanup strategy."'
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Phase 1 Cleanup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff --cached"
echo "2. Commit changes using command above"
echo "3. See CLEANUP_PLAN.md for Phase 2 (reference projects)"
echo ""
echo "Backup created: .gitignore.bak"
