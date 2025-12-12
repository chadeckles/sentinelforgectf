#!/bin/bash
# Package Premium Packs for Ko-fi Distribution
# Usage: ./package-for-kofi.sh [pack-name|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Available packs
PACKS=("azure-fundamentals" "cicd-pipeline" "container-security" "terraform-security" "identity-access")

echo -e "${BLUE}=== SentinelForge Premium Pack Packager ===${NC}\n"

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Function to package a single pack
package_pack() {
    local pack_name=$1
    local pack_dir="$SCRIPT_DIR/$pack_name"
    
    if [ ! -d "$pack_dir" ]; then
        echo -e "${YELLOW}Warning: Pack directory not found: $pack_name${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Packaging: $pack_name${NC}"
    
    # Create a temporary directory for the pack
    local temp_dir=$(mktemp -d)
    local pack_folder="$temp_dir/$pack_name"
    
    mkdir -p "$pack_folder"
    
    # Copy pack files
    cp "$pack_dir/package-info.json" "$pack_folder/"
    cp "$pack_dir/challenges.json" "$pack_folder/"
    
    # Create installation README for this pack
    cat > "$pack_folder/README.md" << 'EOF'
# Installation Instructions

Thank you for purchasing this SentinelForge CTF challenge pack!

## Quick Install

1. Extract this ZIP to your CTF installation:
   ```bash
   unzip PACK_NAME.zip -d /path/to/CTF/challenge-packs/
   ```

2. Validate the pack:
   ```bash
   cd /path/to/CTF/challenge-packs
   node validate-packs.js
   ```

3. Seed the database:
   ```bash
   cd ../backend
   npm run db:seed
   ```

4. Restart your CTF application

## Automated Install

You can use the included installer script:
```bash
cd /path/to/CTF/challenge-packs
./install-pack.sh ~/Downloads/PACK_NAME.zip
```

## Support

Having issues? Contact us via Ko-fi or check the documentation at:
https://github.com/chadeckles/sentinelforgectf

## License

This pack is licensed for personal/single-organization use only.
Do not redistribute or share with others.

© 2025 SentinelForge. All rights reserved.
EOF
    
    # Replace PACK_NAME placeholder
    sed -i.bak "s/PACK_NAME/$pack_name/g" "$pack_folder/README.md"
    rm "$pack_folder/README.md.bak"
    
    # Copy license
    cat > "$pack_folder/LICENSE.md" << 'EOF'
# Premium Pack License

This challenge pack is licensed for personal or single-organization use only.

## Permitted Use:
✅ Running challenges in your personal CTF instance
✅ Deploying within your organization for training
✅ Learning and educational purposes

## Prohibited Use:
❌ Redistribution or resale
❌ Sharing with others who haven't purchased
❌ Posting solutions publicly
❌ Including in other CTF platforms without permission

For questions about licensing, contact us via Ko-fi.

© 2025 SentinelForge. All rights reserved.
EOF
    
    # Create ZIP
    local zip_name="$pack_name-pack.zip"
    cd "$temp_dir"
    zip -r "$DIST_DIR/$zip_name" "$pack_name" > /dev/null
    
    # Cleanup
    rm -rf "$temp_dir"
    
    # Get file size
    local size=$(du -h "$DIST_DIR/$zip_name" | cut -f1)
    
    echo -e "${GREEN}✓ Created: $zip_name ($size)${NC}"
    return 0
}

# Function to create complete bundle
create_bundle() {
    echo -e "\n${YELLOW}Creating complete bundle...${NC}"
    
    local temp_dir=$(mktemp -d)
    local bundle_dir="$temp_dir/sentinelforge-premium-bundle"
    
    mkdir -p "$bundle_dir"
    
    # Copy all packs
    for pack in "${PACKS[@]}"; do
        if [ -d "$SCRIPT_DIR/$pack" ]; then
            cp -r "$SCRIPT_DIR/$pack" "$bundle_dir/"
            echo "  Added: $pack"
        fi
    done
    
    # Create bundle README
    cat > "$bundle_dir/README.md" << 'EOF'
# SentinelForge Premium Bundle

Thank you for purchasing the complete premium bundle!

This bundle includes all 5 premium challenge packs:
- Azure Fundamentals (12 challenges)
- CI/CD Pipeline Security (4 challenges)
- Container Security (5 challenges)
- Terraform Security (5 challenges)
- Identity & Access Management (5 challenges)

**Total: 31 challenges, 5800 points**

## Installation

### Option 1: Install All Packs
```bash
cd /path/to/CTF/challenge-packs
unzip ~/Downloads/sentinelforge-premium-bundle.zip
cd ../backend && npm run db:seed
```

### Option 2: Install Selective Packs
Extract individual folders as needed:
```bash
unzip sentinelforge-premium-bundle.zip azure-fundamentals/* -d /path/to/CTF/challenge-packs/
```

## Validation

After installation:
```bash
cd /path/to/CTF/challenge-packs
node validate-packs.js
```

## Support

Visit: https://github.com/chadeckles/sentinelforgectf

## License

All packs are licensed for personal/single-organization use only.

© 2025 SentinelForge. All rights reserved.
EOF
    
    # Create bundle ZIP
    cd "$temp_dir"
    zip -r "$DIST_DIR/sentinelforge-premium-bundle.zip" "sentinelforge-premium-bundle" > /dev/null
    
    # Cleanup
    rm -rf "$temp_dir"
    
    local size=$(du -h "$DIST_DIR/sentinelforge-premium-bundle.zip" | cut -f1)
    echo -e "${GREEN}✓ Created: sentinelforge-premium-bundle.zip ($size)${NC}"
}

# Main logic
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 [pack-name|all|bundle]"
    echo ""
    echo "Available packs:"
    for pack in "${PACKS[@]}"; do
        echo "  - $pack"
    done
    echo "  - all (packages all individual packs)"
    echo "  - bundle (creates complete bundle)"
    exit 1
fi

TARGET=$1

if [ "$TARGET" == "all" ]; then
    for pack in "${PACKS[@]}"; do
        package_pack "$pack" || true
    done
elif [ "$TARGET" == "bundle" ]; then
    create_bundle
else
    # Check if it's a valid pack name
    valid=false
    for pack in "${PACKS[@]}"; do
        if [ "$pack" == "$TARGET" ]; then
            valid=true
            break
        fi
    done
    
    if [ "$valid" == true ]; then
        package_pack "$TARGET"
    else
        echo -e "${YELLOW}Invalid pack name: $TARGET${NC}"
        echo "Available packs: ${PACKS[*]}"
        exit 1
    fi
fi

echo -e "\n${BLUE}=== Packaging Complete ===${NC}"
echo -e "Output directory: ${GREEN}$DIST_DIR${NC}"
echo ""
echo "Next steps:"
echo "1. Test each ZIP by extracting and validating"
echo "2. Upload to Ko-fi as digital downloads"
echo "3. Set pricing and descriptions"
echo ""
echo -e "${YELLOW}Remember: Never commit these ZIPs to the public repo!${NC}"
