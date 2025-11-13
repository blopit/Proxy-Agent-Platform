#!/bin/bash
# Documentation Search Script
# Usage: ./scripts/search-docs.sh "search term"
# Usage: ./scripts/search-docs.sh "search term" --files-only

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if search term provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a search term${NC}"
    echo "Usage: $0 \"search term\" [--files-only]"
    echo ""
    echo "Examples:"
    echo "  $0 \"authentication\"          # Search with context"
    echo "  $0 \"API\" --files-only        # Just show files"
    echo "  $0 \"task\" agent_resources/backend/  # Search specific dir"
    exit 1
fi

SEARCH_TERM="$1"
SEARCH_PATH="${2:-agent_resources/}"
FILES_ONLY=false

# Check for --files-only flag
if [[ "$2" == "--files-only" ]] || [[ "$3" == "--files-only" ]]; then
    FILES_ONLY=true
fi

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}📚 Searching Documentation${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "Search term: ${YELLOW}$SEARCH_TERM${NC}"
echo -e "Search path: ${YELLOW}$SEARCH_PATH${NC}"
echo ""

if [ "$FILES_ONLY" = true ]; then
    echo -e "${GREEN}Files containing \"$SEARCH_TERM\":${NC}"
    echo ""
    rg "$SEARCH_TERM" "$SEARCH_PATH" -i -l --sort=path 2>/dev/null || {
        echo -e "${RED}No matches found${NC}"
        exit 1
    }
else
    rg "$SEARCH_TERM" "$SEARCH_PATH" -i --heading --line-number --color=always --max-columns=150 2>/dev/null | less -R || {
        echo -e "${RED}No matches found${NC}"
        exit 1
    }
fi

echo ""
echo -e "${GREEN}✅ Search complete${NC}"
