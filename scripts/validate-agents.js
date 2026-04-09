#!/usr/bin/env node

/**
 * Agent Validation Script
 * 
 * This script validates that all code review agents are properly configured
 * and contain the required validation checklists and structures.
 * 
 * Run with: npm run validate:agents
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function success(message) {
  console.log(`✅ ${message}`);
  passCount++;
}

function error(message) {
  console.error(`❌ ${message}`);
  failCount++;
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

console.log('🤖 Starting Agent Validation...\n');

// Check agent files
console.log('📋 Checking Agent Files...');
const agentsDir = path.join(__dirname, '../.github/agents');
const requiredAgents = [
  'codeReviewer.agent.md',
  'staticAnalysisReviewer.agent.md',
  'securityReviewer.agent.md',
  'performanceReviewer.agent.md',
  'readabilityReviewer.agent.md',
];

requiredAgents.forEach((agent) => {
  const filePath = path.join(agentsDir, agent);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.length > 100) {
      success(`Agent file exists: ${agent}`);
    } else {
      error(`Agent file is too small: ${agent}`);
    }
  } else {
    error(`Agent file missing: ${agent}`);
  }
});

// Check agent structure
console.log('\n📐 Checking Agent Structure...');
const agentsToCheck = {
  'codeReviewer.agent.md': ['Purpose', 'Methodology', 'Strengths', 'Bugs', 'Security', 'Performance', 'Readability', 'Suggestions', 'Verdict'],
  'staticAnalysisReviewer.agent.md': ['Purpose', 'Validation', 'TypeScript', 'ESLint', 'Report'],
  'securityReviewer.agent.md': ['Purpose', 'Validation', 'Secrets', 'Vulnerability', 'Report'],
  'performanceReviewer.agent.md': ['Purpose', 'Validation', 'Bundle', 'Performance', 'Report'],
  'readabilityReviewer.agent.md': ['Purpose', 'Validation', 'Naming', 'Structure', 'Report'],
};

Object.entries(agentsToCheck).forEach(([agent, keywords]) => {
  const filePath = path.join(agentsDir, agent);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  keywords.forEach((keyword) => {
    if (new RegExp(keyword, 'i').test(content)) {
      success(`${agent} contains "${keyword}"`);
    } else {
      warn(`${agent} missing "${keyword}"`);
    }
  });
});

// Check workflows
console.log('\n⚙️  Checking Workflows...');
const workflowsDir = path.join(__dirname, '../.github/workflows');
const requiredWorkflows = ['code-review.yml', 'agent-review.yml'];

requiredWorkflows.forEach((workflow) => {
  const filePath = path.join(workflowsDir, workflow);
  if (fs.existsSync(filePath)) {
    success(`Workflow exists: ${workflow}`);
  } else {
    error(`Workflow missing: ${workflow}`);
  }
});

// Check pre-commit hook
console.log('\n🎣 Checking Pre-commit Hook...');
const hookPath = path.join(__dirname, '../scripts/pre-commit.sh');
if (fs.existsSync(hookPath)) {
  const stats = fs.statSync(hookPath);
  if (stats.mode & 0o111) {
    success('Pre-commit hook is executable');
  } else {
    warn('Pre-commit hook exists but is not executable');
  }
  
  const content = fs.readFileSync(hookPath, 'utf-8');
  if (content.includes('eslint') || content.includes('npm run lint')) {
    success('Pre-commit hook includes ESLint check');
  } else {
    error('Pre-commit hook missing ESLint check');
  }
  
  if (content.includes('typecheck')) {
    success('Pre-commit hook includes TypeScript check');
  } else {
    error('Pre-commit hook missing TypeScript check');
  }
} else {
  error('Pre-commit hook file missing');
}

// Check npm scripts
console.log('\n📦 Checking npm Scripts...');
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const requiredScripts = {
  'lint': 'eslint',
  'typecheck': 'tsc --noEmit',
  'lint:fix': 'eslint',
  'validate:agents': 'validate-agents',
};

Object.entries(requiredScripts).forEach(([scriptName, expectedContent]) => {
  if (packageJson.scripts && packageJson.scripts[scriptName]) {
    const scriptContent = packageJson.scripts[scriptName];
    if (scriptContent.includes(expectedContent) || expectedContent === scriptName) {
      success(`npm script exists: ${scriptName}`);
    } else {
      warn(`npm script "${scriptName}" exists but may not contain expected content`);
    }
  } else {
    error(`npm script missing: ${scriptName}`);
  }
});

// Check documentation
console.log('\n📚 Checking Documentation...');
const docFiles = [
  'AGENT_SETUP.md',
  'AGENT_QUICK_REFERENCE.md',
  'AGENT_INTEGRATION_COMPLETE.md',
  'AGENT_ARCHITECTURE.md',
  'AGENT_TROUBLESHOOTING.md',
  'SETUP_SUMMARY.md',
  'FILE_MANIFEST.md',
  'DOCUMENTATION_INDEX.md',
];

docFiles.forEach((file) => {
  const filePath = path.join(__dirname, '../', file);
  if (fs.existsSync(filePath)) {
    success(`Documentation exists: ${file}`);
  } else {
    error(`Documentation missing: ${file}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`⚠️  Warnings: Check above`);

if (failCount > 0) {
  console.log('\n🚨 Validation FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 Validation PASSED');
  process.exit(0);
}
