# Code Review Agents - Quick Reference

## 🚀 Quick Start

### For Developers
```bash
# Setup pre-commit hook (one-time)
chmod +x scripts/pre-commit.sh
cp scripts/pre-commit.sh .git/hooks/pre-commit

# Now commits will be checked automatically
git add .
git commit -m "Your message"  # Checks run before commit
```

### For Code Review
```bash
# Request review in VS Code
# Use command palette or mention agent:
@codeReviewer - Full review
@staticAnalysisReviewer - Type/lint only
@securityReviewer - Security audit
@performanceReviewer - Performance analysis
@readabilityReviewer - Code quality
```

## 📊 Workflow Timeline

```
Developer Push/PR Created
    ↓
[GitHub Actions Triggered]
    ├─ code-review.yml
    │  ├─ ESLint Check
    │  ├─ TypeScript Check
    │  └─ Post PR Comment
    │
    └─ agent-review.yml
       ├─ Extract Changes
       ├─ Notify Agents Starting
       └─ [Agents Begin Review]
         ├─ Static Analysis
         ├─ Security Audit
         ├─ Performance Analysis
         └─ Readability Review
```

## 🔍 What Each Agent Checks

### Static Analysis Reviewer
- TypeScript type errors
- ESLint violations
- Unused imports
- Proper typing of functions/components
- No `any` types

### Security Reviewer
- Hardcoded secrets/API keys
- SQL injection risks
- XSS vulnerabilities
- Authentication/authorization logic
- Data protection

### Performance Reviewer
- Unnecessary re-renders
- Bundle size issues
- API call optimization
- Database N+1 queries
- Image/font optimization

### Readability Reviewer
- Variable/function naming
- Component structure
- Code organization
- Documentation completeness
- React/Next.js patterns

## ✅ Checklist Before Merging

- [ ] All GitHub Actions pass (green checkmarks)
- [ ] No "REQUEST CHANGES" verdicts
- [ ] Security concerns addressed (no Critical findings)
- [ ] Code review PR comment addressed
- [ ] Pre-commit hook passed locally

## 🐛 Common Issues & Fixes

### "Pre-commit hook not running"
```bash
chmod +x .git/hooks/pre-commit
```

### "ESLint failing"
```bash
npm run lint:fix  # Auto-fix what it can
# Then manually review and fix remaining
```

### "TypeScript errors"
```bash
npm run typecheck  # See detailed errors
# Fix types in your code
```

### "Workflow not triggering"
1. Check workflow file exists: `.github/workflows/code-review.yml`
2. Verify branch name matches
3. Check file paths in `paths` filter
4. Push to trigger (PRs on matching branches)

## 📝 Commit Message Tips

Write clear commit messages so agents understand:

```
✅ Good:
"Add user authentication to player profile page"
"Fix N+1 query in team matches endpoint"
"Refactor filter component for reusability"

❌ Avoid:
"update"
"fix stuff"
"changes"
```

## 🔗 Useful Links

- Review Standards: See `.github/agents/codeReviewer.agent.md`
- Setup Details: See `AGENT_SETUP.md`
- Static Analysis: See `.github/agents/staticAnalysisReviewer.agent.md`
- Security: See `.github/agents/securityReviewer.agent.md`
- Performance: See `.github/agents/performanceReviewer.agent.md`
- Readability: See `.github/agents/readabilityReviewer.agent.md`

## 💡 Pro Tips

1. **Run lint locally first**
   ```bash
   npm run lint:fix
   npm run typecheck
   ```

2. **Check your commits early**
   - Don't wait for GitHub to tell you about issues
   - Use pre-commit hook

3. **Read agent feedback carefully**
   - Each suggestion has a reason
   - Security issues are critical

4. **Reference agent docs**
   - Each agent has detailed checklists
   - Understand why something is flagged

## 🆘 Need Help?

Check workflow logs:
1. Go to Pull Request
2. Click "Checks" tab
3. Expand failing workflow
4. View detailed error logs

Or run locally:
```bash
npm run lint      # See ESLint issues
npm run typecheck # See TypeScript issues
```
