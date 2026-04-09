# Code Review Agents - Troubleshooting Guide

## Common Issues & Solutions

### 1. Pre-commit Hook Not Running

**Symptom:** Can commit code with ESLint/TypeScript errors

**Solutions:**

```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# If missing, reinstall
chmod +x scripts/pre-commit.sh
cp scripts/pre-commit.sh .git/hooks/pre-commit

# If file exists but not executable
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit

# If stuck with bad commits, bypass and fix
git commit --no-verify
# Then fix issues and recommit properly
```

**Why this happens:**
- Git hooks not installed
- Hook file lost in fresh clone
- Permissions incorrect
- File not executable

---

### 2. Pre-commit Hook Fails on Valid Code

**Symptom:** ESLint/TypeScript shows errors that shouldn't be there

**Solutions:**

```bash
# Check ESLint config
cat .eslintrc.json

# Test ESLint directly
npm run lint

# If lint command is wrong, update package.json
# Should be: "lint": "eslint src/ components/ app/ lib/ --ext .ts,.tsx"

# Test TypeScript
npm run typecheck

# Clear cache
rm -rf .eslintcache
rm -rf node_modules/.cache
npm install
```

**Why this happens:**
- ESLint config issues
- TypeScript config (`tsconfig.json`) problems
- Cached data is stale
- Incorrect npm scripts

---

### 3. GitHub Actions Workflow Not Triggering

**Symptom:** Push/PR created but workflows don't run

**Checklist:**

```
☐ Workflow files exist: .github/workflows/code-review.yml
☐ Workflow syntax is valid (use: https://github.com/YOUR_REPO/actions)
☐ Branch matches trigger: main or develop
☐ File paths match changed files:
  - src/**
  - components/**
  - app/**
  - lib/**
  - pages/**
☐ Not disabled in repo settings
☐ Repo has Actions enabled (Settings → Actions)
```

**Fix:**

1. Check workflow file:
```bash
cat .github/workflows/code-review.yml
# Verify "branches" section has your branch names
# Verify "paths" includes your file directories
```

2. Manually trigger (for testing):
   - Go to repo → Actions tab → Code Review Agents
   - Click "Run workflow"

3. Check GitHub Actions settings:
   - Repo → Settings → Actions → General
   - Ensure Actions are enabled

---

### 4. Workflow Runs But npm Commands Fail

**Symptom:** GitHub Actions shows npm command errors

**Solutions:**

```bash
# Verify package.json has scripts
cat package.json | grep -A 5 '"scripts"'

# Should include:
{
  "scripts": {
    "lint": "eslint src/ components/ app/ lib/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ components/ app/ lib/ --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit"
  }
}

# If missing, add them
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.lint="eslint src/ components/ app/ lib/ --ext .ts,.tsx"
```

**Check Node.js version:**
```yaml
# In .github/workflows/code-review.yml
- uses: actions/setup-node@v4
  with:
    node-version: '18'  # Should match your requirements
```

---

### 5. ESLint Report Shows Errors in Workflow But Not Locally

**Symptom:** Local `npm run lint` passes, but workflow fails

**Solutions:**

```bash
# Ensure same ESLint version
npm list eslint

# Run exact command used in workflow
npx eslint src/ components/ app/ lib/ --ext .ts,.tsx --format json

# Compare .eslintrc
diff .eslintrc.json (local vs repo)

# Clear all caches
rm -rf node_modules/.cache
rm .eslintcache 2>/dev/null || true
npm ci --force
npm run lint
```

**Common causes:**
- Different Node.js versions
- ESLint plugin version mismatch
- Cache corrupted
- Environment variable differences

---

### 6. Agents Not Running/Showing Results

**Symptom:** Workflow passes but no agent feedback appears

**Note:** Agents run via VS Code integration, not directly in GitHub Actions

**To run agents manually:**

```
VS Code:
1. Open command palette (Cmd+Shift+P)
2. Type "@codeReviewer"
3. Select agent
4. Provide code or file to review
5. Select which sub-agents to run
```

**For automated agents in PR:**
- Workflows post notification that agents will run
- Agents analyze via VS Code locally or in PR environment
- Results depend on VS Code agent execution

---

### 7. Can't Bypass Pre-commit Hook

**Symptom:** Need to commit code quickly despite hook blocking

**Emergency bypass (not recommended):**

```bash
git commit --no-verify
```

**Then fix the issues:**
```bash
# See what failed
npm run lint
npm run typecheck

# Fix issues
npm run lint:fix
# Manually fix TypeScript errors

# Proper commit
git add .
git commit -m "Fix linting/type issues"
```

---

### 8. Multiple Conflicts Between Hooks and CI

**Symptom:** Pre-commit passes locally but fails in CI, or vice versa

**Solutions:**

```bash
# Ensure consistency
# Local should run: exactly same as CI

# Test locally in clean state
rm -rf node_modules
npm ci
.git/hooks/pre-commit

# Should match CI results
```

**Add to git config:**
```bash
# Skip pre-commit for specific commits if needed
git config --local hooks.skipPreCommit false  # default is false
```

---

### 9. PR Comment Not Appearing

**Symptom:** Workflow runs but PR doesn't show status comment

**Requires:**
```yaml
permissions:
  pull-requests: write
  issues: write
```

**Check in workflow:**

```bash
# In .github/workflows/code-review.yml
jobs:
  code-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write  # Must have this
      issues: write         # And this
```

**Fix:**
- Update workflow file
- Re-run workflow or create new PR

---

### 10. TypeScript Check Timing Out

**Symptom:** Workflow times out on TypeScript check

**Solutions:**

```bash
# Check what's slow
time npm run typecheck

# If taking >5 minutes, might need optimization
# Reduce files being checked in tsconfig.json

# Exclude unnecessary directories
{
  "include": ["src/**/*", "app/**/*"],
  "exclude": ["node_modules", "dist", ".next"]
}

# Or split the check
npm run typecheck -- --noEmit src/
npm run typecheck -- --noEmit app/
```

---

## Debugging Commands

```bash
# Check if pre-commit installed correctly
ls -la .git/hooks/
file .git/hooks/pre-commit
cat .git/hooks/pre-commit | head -5

# Test hook directly
bash -x .git/hooks/pre-commit

# Check npm scripts
npm run  # Lists all available scripts

# Run individual checks
npm run lint --verbose
npm run typecheck --verbose

# Check ESLint config
npx eslint --print-config src/app.ts | head -20

# List all ESLint rules in effect
npx eslint --debug src/ 2>&1 | grep "rule id" | head -10
```

---

## GitHub Actions Debugging

### View Workflow Logs

1. Go to repository → Actions tab
2. Select workflow run
3. Click job name
4. Expand steps to see details

### Re-run Failed Workflow

1. Go to failed workflow
2. Click "Re-run jobs" button
3. Select specific job or all jobs

### Enable Debug Logging

Add to workflow file:
```yaml
- name: Enable debugging
  run: |
    npm config set loglevel verbose
    export DEBUG=*
```

---

## Quick Diagnostic Script

```bash
#!/bin/bash
echo "=== Code Review Agents Diagnostics ==="
echo ""
echo "1. Git Hook Status:"
[ -f .git/hooks/pre-commit ] && echo "✅ Hook exists" || echo "❌ Hook missing"
[ -x .git/hooks/pre-commit ] && echo "✅ Hook executable" || echo "❌ Hook not executable"

echo ""
echo "2. npm Scripts:"
npm run 2>&1 | grep -E "lint|typecheck" || echo "❌ Scripts missing"

echo ""
echo "3. ESLint:"
npm run lint > /dev/null 2>&1 && echo "✅ ESLint works" || echo "❌ ESLint failed"

echo ""
echo "4. TypeScript:"
npm run typecheck > /dev/null 2>&1 && echo "✅ TypeScript works" || echo "❌ TypeScript failed"

echo ""
echo "5. Workflow Files:"
[ -f .github/workflows/code-review.yml ] && echo "✅ code-review.yml exists" || echo "❌ Missing"
[ -f .github/workflows/agent-review.yml ] && echo "✅ agent-review.yml exists" || echo "❌ Missing"

echo ""
echo "=== Diagnostics Complete ==="
```

Save as `scripts/diagnose.sh` and run: `bash scripts/diagnose.sh`

---

## Getting Help

### Check Logs
```
GitHub → PR → Checks tab → Select workflow → View logs
```

### Run Locally First
```bash
npm run lint
npm run typecheck
.git/hooks/pre-commit
```

### Verify Configuration
```bash
cat .github/workflows/code-review.yml
cat package.json | grep -A 5 scripts
cat .eslintrc.json
cat tsconfig.json
```

### Common Fixes Quick List
```bash
# Re-install hooks
chmod +x scripts/pre-commit.sh && cp scripts/pre-commit.sh .git/hooks/pre-commit

# Update npm scripts
npm pkg set scripts.typecheck="tsc --noEmit"

# Clear caches
rm -rf node_modules/.cache .eslintcache .next

# Reinstall deps
npm ci

# Test everything
npm run lint && npm run typecheck && .git/hooks/pre-commit
```

---

## Still Having Issues?

1. **Read the error carefully** - Usually very specific
2. **Check the relevant log** - ESLint, TypeScript, or GitHub Actions
3. **Run locally first** - Isolate if it's local vs CI issue
4. **Verify configuration** - Check all config files match expected
5. **Check permissions** - File permissions, GitHub permissions
6. **Review documentation** - See AGENT_SETUP.md for detailed info

Still stuck? Check:
- `.github/workflows/*.yml` - Workflow definitions
- `package.json` - npm scripts
- `.eslintrc.json` - ESLint rules
- `tsconfig.json` - TypeScript config
- `scripts/pre-commit.sh` - Hook script
