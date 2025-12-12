#!/bin/bash
# Premium Challenge Pack Installer for SentinelForge CTF
# Usage: ./install-pack.sh <path-to-pack.zip>

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path-to-pack.zip>"
    echo "Example: $0 ~/Downloads/azure-fundamentals-pack.zip"
    exit 1
fi

PACK_ZIP="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SentinelForge CTF Premium Pack Installer ===${NC}\n"

# Check if zip file exists
if [ ! -f "$PACK_ZIP" ]; then
    echo -e "${RED}Error: File not found: $PACK_ZIP${NC}"
    exit 1
fi

# Check if unzip is installed
if ! command -v unzip &> /dev/null; then
    echo -e "${RED}Error: unzip command not found. Please install unzip.${NC}"
    exit 1
fi

# Extract pack name from ZIP filename
PACK_NAME=$(basename "$PACK_ZIP" .zip)
echo -e "${YELLOW}Installing pack: $PACK_NAME${NC}\n"

# Unzip the pack
echo "📦 Extracting pack..."
unzip -q "$PACK_ZIP" -d "$SCRIPT_DIR/"

# Find the extracted folder
PACK_DIR=$(find "$SCRIPT_DIR" -maxdepth 1 -type d -name "*-pack" -o -name "*-fundamentals" | head -1)

if [ -z "$PACK_DIR" ]; then
    echo -e "${RED}Error: Could not find extracted pack folder${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pack extracted to: $(basename "$PACK_DIR")${NC}\n"

# Validate the pack
echo "🔍 Validating pack structure..."
if node "$SCRIPT_DIR/validate-packs.js" | grep -q "All packs validated successfully"; then
    echo -e "${GREEN}✓ Pack validation successful${NC}\n"
else
    echo -e "${RED}✗ Pack validation failed${NC}"
    echo "Please check the pack contents and try again."
    exit 1
fi

# Ask user if they want to seed the database now
echo -e "${YELLOW}Would you like to seed the database now? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Seeding database...${NC}"
    cd "$SCRIPT_DIR/../backend"
    
    if [ -f "package.json" ]; then
        npm run db:seed
        echo -e "\n${GREEN}✓ Database seeded successfully!${NC}"
    else
        echo -e "${RED}Error: backend/package.json not found${NC}"
        echo "Please manually run: cd backend && npm run db:seed"
    fi
else
    echo -e "\n${YELLOW}Skipping database seed.${NC}"
    echo "To seed later, run: cd backend && npm run db:seed"
fi

echo -e "\n${GREEN}=== Installation Complete! ===${NC}"
echo -e "Pack installed: ${GREEN}$(basename "$PACK_DIR")${NC}"
echo -e "\nNext steps:"
echo "1. Restart your CTF application"
echo "2. The new challenges should now appear in the challenges page"
echo -e "\n${YELLOW}Enjoy your new challenges!${NC} 🎯"
