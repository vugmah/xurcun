#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# THE WOO — Deploy to Railway via GitHub
# Usage: ./deploy.sh [github-username]
# ═══════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPO_NAME="thewoo-white-city"
GITHUB_USER="${1:-}"

echo -e "${BLUE}"
echo "============================================="
echo "  THE WOO — Production Deployment Script"
echo "============================================="
echo -e "${NC}"

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}ERROR: git is not installed${NC}"
    echo "Install: https://git-scm.com/downloads"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Install: https://nodejs.org (v20+)"
    exit 1
fi

echo -e "${GREEN}All prerequisites met${NC}"

# Get GitHub username if not provided
if [ -z "$GITHUB_USER" ]; then
    echo ""
    echo -e "${YELLOW}Enter your GitHub username:${NC}"
    read -r GITHUB_USER
fi

if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}ERROR: GitHub username is required${NC}"
    exit 1
fi

REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo -e "${BLUE}Step 1: Committing all changes...${NC}"
git add -A
git commit -m "deploy: production release $(date -u +%Y-%m-%d-%H%M)" || echo "Nothing to commit"

echo ""
echo -e "${BLUE}Step 2: Setting up GitHub remote...${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo -e "${YELLOW}Before pushing, ensure the GitHub repo exists:${NC}"
echo "  https://github.com/new"
echo "  Name: ${REPO_NAME}"
echo "  Visibility: Private"
echo "  Do NOT initialize with README"
echo ""
echo -e "${YELLOW}Press Enter when ready...${NC}"
read -r

echo ""
echo -e "${BLUE}Step 3: Pushing to GitHub...${NC}"
git branch -M main
git push -u origin main || {
    echo ""
    echo -e "${RED}Push failed. Common fixes:${NC}"
    echo "1. Create the GitHub repo first (see URL above)"
    echo "2. If repo exists with different history: git push --force-with-lease origin main"
    echo "3. Use personal access token for authentication"
    exit 1
}

echo -e "${GREEN}Code pushed to ${REPO_URL}${NC}"

echo ""
echo -e "${BLUE}Step 4: Railway Deployment${NC}"
echo ""
echo -e "${YELLOW}Next steps (manual — Railway web UI):${NC}"
echo ""
echo -e "1. Go to: ${GREEN}https://railway.app/new${NC}"
echo -e "2. Click: ${GREEN}Deploy from GitHub repo${NC}"
echo -e "3. Select: ${GREEN}${REPO_NAME}${NC}"
echo -e "4. Add MySQL: ${GREEN}New > Database > MySQL${NC}"
echo -e "5. Add env vars in Railway dashboard:"
echo -e "   ${GREEN}APP_SECRET${NC}     = $(openssl rand -hex 32)"
echo -e "   ${GREEN}ADMIN_SECRET_KEY${NC} = $(openssl rand -hex 16)"
echo -e "   ${GREEN}APP_ID${NC}         = thewoo_prod_2026"
echo -e "   ${GREEN}NODE_ENV${NC}       = production"
echo ""
echo -e "6. After first deploy, run migrations:"
echo -e "   ${GREEN}railway run -- npm run db:migrate${NC}"
echo ""
echo -e "7. Your site will be at:"
echo -e "   ${GREEN}https://${REPO_NAME}.up.railway.app${NC}"
echo ""
echo -e "${GREEN}Deployment setup complete!${NC}"
