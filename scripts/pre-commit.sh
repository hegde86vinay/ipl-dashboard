#!/bin/bash

# Pre-commit hook for running code quality checks
# Install: cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit code quality checks..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "ℹ️  No TypeScript/JavaScript files to check"
  exit 0
fi

echo "📝 Files to check:"
echo "$STAGED_FILES" | sed 's/^/  - /'

# Run ESLint on staged files
echo ""
echo "🔎 Running ESLint..."
if npm run lint -- $STAGED_FILES --max-warnings 0; then
  echo "✅ ESLint passed"
else
  echo "❌ ESLint failed - fix the errors above"
  exit 1
fi

# Run TypeScript check
echo ""
echo "📘 Running TypeScript check..."
if npm run typecheck; then
  echo "✅ TypeScript check passed"
else
  echo "❌ TypeScript check failed"
  exit 1
fi

echo ""
echo "✅ All pre-commit checks passed!"
exit 0
