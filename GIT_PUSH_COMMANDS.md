# Git Push Commands - Ready to Execute

## Step-by-Step Commands

Run these commands in your terminal from the project directory:

### Step 1: Initialize Git (if not done)

```bash
cd /Users/sankalp/Desktop/project/aag
git init
```

### Step 2: Add All Files

```bash
git add .
```

### Step 3: Create Initial Commit

```bash
git commit -m "Complete portfolio website with all fixes:
- Fixed header and footer positioning (static)
- Fixed content duplication issue
- Added category block styling
- Implemented logo support
- Set default theme to dark orange
- Added admin panel with CRUD
- Ready for deployment"
```

### Step 4: Create GitHub Repository

**If you haven't created the GitHub repo yet:**

1. Go to https://github.com
2. Click "+" → "New repository"
3. Name it: `gurupratap-sharma-aag` (or your preferred name)
4. **Don't** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 5: Add Remote and Push

```bash
# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### Alternative: If you already have a GitHub repo

```bash
# Check existing remotes
git remote -v

# If you need to change the remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push
git push -u origin main
```

---

## After Pushing to GitHub

Once code is on GitHub, proceed to Vercel deployment:

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Add environment variables
5. Deploy

**See `DEPLOYMENT_CHECKLIST.md` for detailed Vercel setup.**

---

## Quick Copy-Paste (One Command at a Time)

```bash
cd /Users/sankalp/Desktop/project/aag
git init
git add .
git commit -m "Complete portfolio website with all fixes"
# Then follow Step 4 above to create GitHub repo
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

**Note:** Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

