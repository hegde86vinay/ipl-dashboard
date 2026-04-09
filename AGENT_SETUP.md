# Code Review Agents - Setup & Execution Guide

## Overview

This project uses automated code review agents that validate code quality, security, performance, and best practices. Reviews are triggered automatically on every commit/push via GitHub Actions.

## Automated Workflows

### 1. **Code Review Workflow** (`code-review.yml`)
Triggers on push/PR to main/develop branches when code files change.

**What it does:**
- Runs ESLint validation
- Performs TypeScript type checking
- Identifies changed files
- Posts summary to PR comments
- Fails the check if errors found

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Only when files in: `src/`, `components/`, `app/`, `lib/`, `pages/`

### 2. **Agent Review Workflow** (`agent-review.yml`)
Initiates the specialized agent review process.

**What it does:**
- Extracts PR diff
- Notifies in PR that agents are running
- Logs execution details
- Prepares context for agent analysis

**Runs on:**
- Pull request opened, synchronized, or reopened

## Review Agents

Each agent focuses on a specific area:

| Agent | Focus | Triggers |
|-------|-------|----------|
| **Static Analysis** | TypeScript, ESLint, imports, type safety | Always |
| **Security** | Vulnerabilities, secrets, auth, injection risks | Always |
| **Performance** | Bundle size, re-renders, API efficiency, queries | Always |
| **Readability** | Naming, structure, patterns, documentation | Always |

## Local Setup

### Install Pre-commit Hook

Prevent commits with code quality issues:

```bash
# Make the script executable
chmod +x scripts/pre-commit.sh

# Install as git hook
cp scripts/pre-commit.sh .git/hooks/pre-commit

# Verify installation
ls -la .git/hooks/pre-commit
```

### What Pre-commit Hook Does

Before allowing a commit, it:
1. Identifies staged TypeScript/JavaScript files
2. Runs ESLint with zero warnings tolerance
3. Runs TypeScript type checking
4. Blocks commit if any check fails

## Running Agents Manually

### Local Review with Agents

Run the code reviewer agent in VS Code:

```
1. Open the file you want to review
2. Trigger Agent: `@codeReviewer`
3. Provide the file path or code snippet
4. Select which sub-agents to run
```

### Review Specific Agent Results

```
@staticAnalysisReviewer - Type and lint checks
@securityReviewer - Security audit
@performanceReviewer - Performance analysis
@readabilityReviewer - Code quality review
```

## GitHub Actions Status Checks

### PR Comments

When you open/update a PR:

1. GitHub Actions automatically runs checks
2. A status comment appears showing:
   - ESLint errors/warnings count
   - TypeScript status
   - List of agents that will review
3. Check status is reported in PR merge dialog

### Viewing Workflow Details

```
PR → Checks tab → Click workflow → View logs
```

## Configuration

### Add/Remove Branches

Edit `.github/workflows/code-review.yml` and `.github/workflows/agent-review.yml`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # Add here
```

### Add/Remove File Paths

Edit `paths` in workflows:

```yaml
paths:
  - 'src/**'
  - 'components/**'
  - 'my-new-folder/**'  # Add here
```

## Review Report Format

All agents follow this structure:

### 1. **Strengths**
What the code does well

### 2. **Potential Bugs / Correctness Issues**
Logic errors, edge cases, bugs

### 3. **Security Concerns**
Vulnerabilities, severity ratings

### 4. **Performance & Efficiency**
Bottlenecks, optimization opportunities

### 5. **Readability & Best Practices**
Naming, structure, patterns

### 6. **Suggestions**
Concrete improvements with code examples

### 7. **Overall Verdict**
APPROVE | REQUEST CHANGES | COMMENT ONLY

## Troubleshooting

### Workflow Not Triggering

Check:
1. Workflow file is in `.github/workflows/`
2. File names end with `.yml`
3. Branches in trigger match your branches
4. Changed files match `paths` filter

### Pre-commit Hook Not Running

```bash
# Verify it's executable
ls -la .git/hooks/pre-commit

# Should see: -rwxr-xr-x

# If not:
chmod +x .git/hooks/pre-commit

# Test it
.git/hooks/pre-commit
```

### Bypass Pre-commit (Emergency Only)

```bash
git commit --no-verify
```

## Best Practices

1. **Always review agent feedback** - Don't ignore warnings
2. **Fix issues before merging** - Request Changes verdict must be resolved
3. **Use pre-commit hook** - Catch issues locally first
4. **Check PR status** - Ensure all checks pass before merge
5. **Address security concerns** - Never ignore Critical/High severity findings

## npm Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "lint": "eslint src/ components/ app/ lib/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ components/ app/ lib/ --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

If missing, add them to `package.json`.
