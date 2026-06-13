#!/bin/bash

# RISEher Deployment Helper Script
# This script helps prepare the project for deployment

echo "╔════════════════════════════════════════╗"
echo "║   RISEher Deployment Helper Script    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo "Please commit or stash changes before deploying:"
    git status -s
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Checking Node version..."
node --version

echo ""
echo -e "${GREEN}✓${NC} Installing dependencies..."
npm install

echo ""
echo -e "${GREEN}✓${NC} Running type check..."
npm run lint

echo ""
echo -e "${GREEN}✓${NC} Building for production..."
npm run build

echo ""
echo -e "${GREEN}✓${NC} Verifying build..."
if [ -d "dist" ]; then
    echo "  Build size: $(du -sh dist | cut -f1)"
    echo "  Files in dist: $(find dist -type f | wc -l)"
else
    echo -e "${RED}✗${NC} Build failed - dist directory not found"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║      Deployment Ready! ✨              ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Frontend (Vercel):"
echo "   - Commit and push to GitHub"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Import RISEher repository"
echo "   - Set VITE_API_URL environment variable"
echo ""
echo "2. Backend (Render):"
echo "   - Go to https://render.com/dashboard"
echo "   - Create new Web Service"
echo "   - Set all required environment variables"
echo "   - Deploy"
echo ""
echo "3. After deployment:"
echo "   - Update FRONTEND_URL in Render backend"
echo "   - Test API endpoints"
echo "   - Verify frontend can communicate with backend"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
