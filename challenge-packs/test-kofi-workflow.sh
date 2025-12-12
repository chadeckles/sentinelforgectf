#!/bin/bash
# Test the Ko-fi distribution workflow end-to-end

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Testing Ko-fi Distribution Workflow ===${NC}\n"

# Test 1: Validate all packs
echo -e "${YELLOW}Test 1: Validating all packs...${NC}"
node validate-packs.js
echo -e "${GREEN}✓ Validation passed${NC}\n"

# Test 2: Package a single pack (azure-fundamentals)
echo -e "${YELLOW}Test 2: Packaging Azure Fundamentals pack...${NC}"
./package-for-kofi.sh azure-fundamentals
if [ -f "dist/azure-fundamentals-pack.zip" ]; then
    echo -e "${GREEN}✓ Pack created successfully${NC}\n"
else
    echo -e "${RED}✗ Pack creation failed${NC}\n"
    exit 1
fi

# Test 3: Test extraction to temporary location
echo -e "${YELLOW}Test 3: Testing pack extraction...${NC}"
TEMP_DIR=$(mktemp -d)
unzip -q dist/azure-fundamentals-pack.zip -d "$TEMP_DIR"
if [ -f "$TEMP_DIR/azure-fundamentals/package-info.json" ] && \
   [ -f "$TEMP_DIR/azure-fundamentals/challenges.json" ] && \
   [ -f "$TEMP_DIR/azure-fundamentals/README.md" ] && \
   [ -f "$TEMP_DIR/azure-fundamentals/LICENSE.md" ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ Missing files in pack${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Test 4: Verify JSON structure
echo -e "${YELLOW}Test 4: Validating JSON structure...${NC}"
if node -e "require('$TEMP_DIR/azure-fundamentals/package-info.json')" && \
   node -e "require('$TEMP_DIR/azure-fundamentals/challenges.json')"; then
    echo -e "${GREEN}✓ JSON files valid${NC}"
else
    echo -e "${RED}✗ Invalid JSON structure${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}=== All Tests Passed! ===${NC}\n"
echo "Distribution workflow is ready for Ko-fi."
echo ""
echo "Next steps:"
echo "1. Run: ./package-for-kofi.sh all"
echo "2. Run: ./package-for-kofi.sh bundle"
echo "3. Upload ZIPs from dist/ to Ko-fi"
echo "4. Set pricing and descriptions"
echo "5. Test purchase flow"
