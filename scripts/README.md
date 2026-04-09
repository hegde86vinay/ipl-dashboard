# Agent Validation Tests

This directory contains validation tests and scripts to ensure that the code review agent system is properly configured and functional.

## Files

- **`scripts/validate-agents.js`** - Node.js validation script that checks:
  - All required agent files exist and are properly sized
  - Agent structure contains required sections
  - GitHub Actions workflows are configured
  - Pre-commit hook is executable and complete
  - npm scripts are properly defined
  - Documentation files are present

## Running Tests

### Pre-commit Hook (Automatic)
Tests run automatically when you commit code via the pre-commit hook:
```bash
git add .
git commit -m "Your message"
# validate-agents runs automatically
```

### Manual Validation
Run the validation script directly:
```bash
npm run validate:agents
```

### Validation Output
The script checks 50+ criteria and outputs:
- ✅ Passed checks
- ❌ Failed checks
- ⚠️ Warnings (non-blocking issues)

Exit codes:
- `0` - All critical checks passed
- `1` - One or more critical checks failed

## What Gets Validated

### Agent Files
- ✅ All 5 agent files exist
- ✅ Agent files contain required sections
- ✅ Main agent has 7-point review format
- ✅ Each agent has Purpose, Validation, and Report sections

### Workflows
- ✅ code-review.yml exists and is configured
- ✅ agent-review.yml exists and is configured
- ✅ Proper permissions are set

### Pre-commit Hook
- ✅ Hook file exists
- ✅ Hook is executable
- ✅ Hook includes ESLint check
- ✅ Hook includes TypeScript check
- ✅ Hook includes agent validation

### npm Scripts
- ✅ `npm run lint` is configured
- ✅ `npm run typecheck` is configured
- ✅ `npm run lint:fix` is configured
- ✅ `npm run validate:agents` is configured

### Documentation
- ✅ All 8 required documentation files exist
- ✅ Documentation files contain expected content

## Interpreting Results

### All Checks Passed ✅
```
✅ Passed: 50
❌ Failed: 0
🎉 Validation PASSED
```
Everything is working correctly!

### Some Checks Failed ❌
```
✅ Passed: 48
❌ Failed: 2
🚨 Validation FAILED
```
Check the failed items and fix them before committing.

### Warnings Only ⚠️
```
⚠️ readabilityReviewer.agent.md missing "Validation"
```
Non-blocking issues. Code will still be validated, but you may want to address these.

## Fixing Common Issues

### Pre-commit hook is not executable
```bash
chmod +x scripts/pre-commit.sh
```

### Agent file missing or corrupted
- Check that the file exists: `ls .github/agents/`
- Check file size: `wc -c .github/agents/agentName.agent.md`
- Re-create from documentation if needed

### npm script not found
```bash
npm run validate:agents
# or
npm run lint
npm run typecheck
```

### Pre-commit hook not running
```bash
# Reinstall the hook
chmod +x scripts/pre-commit.sh
cp scripts/pre-commit.sh .git/hooks/pre-commit

# Test it
.git/hooks/pre-commit
```

## Integration with CI/CD

The validation is automatically run:
1. **Locally** - via pre-commit hook on every commit
2. **On GitHub** - via agent-review.yml workflow on PRs
3. **Manual** - with `npm run validate:agents`

## Continuous Improvement

The validation script is designed to be extended. To add new validations:

1. Open `scripts/validate-agents.js`
2. Add new check functions
3. Call `success()` or `error()` to report results
4. Update this README

Example:
```javascript
// Check for new feature
if (newFeatureExists) {
  success('New feature is configured');
} else {
  error('New feature is missing');
}
```

---

**Last Updated:** April 9, 2026
**Status:** ✅ All Validations Passing
