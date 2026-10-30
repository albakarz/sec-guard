import fs from 'node:fs';
import path from 'node:path';

export function initConfig(targetDir = process.cwd()) {
  const configPath = path.join(targetDir, '.secguardrc.json');
  if (fs.existsSync(configPath)) {
    console.log(`ℹ️ Configuration file already exists at: ${configPath}`);
    return;
  }

  const sampleConfig = {
    $schema: 'https://raw.githubusercontent.com/Albakarz/sec-guard/main/schema/secguardrc.schema.json',
    minSeverity: 'LOW',
    failOn: 'HIGH',
    ignoreDirs: ['coverage', 'test/fixtures', 'tmp'],
    targetExts: ['.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.env', '.yaml'],
    disableRules: [],
    customRules: [
      {
        id: 'CUSTOM_NO_PLAINTEXT_SECRET',
        severity: 'HIGH',
        category: 'Custom Rules',
        pattern: 'password\\s*=\\s*[\'"][^\'"]+[\'"]',
        flags: 'i',
        message: 'Potential hardcoded plaintext credential found.',
        remediation: 'Load secret dynamically from process.env.'
      },
      {
        id: 'CUSTOM_UNMASKED_SSN',
        severity: 'CRITICAL',
        category: 'Privacy',
        pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
        flags: '',
        message: 'Unmasked Social Security Number format detected in code.',
        remediation: 'Redact or mask sensitive national identity numbers.'
      }
    ]
  };

  fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2), 'utf-8');
  console.log(`✅ Created configuration file: ${configPath}`);
}

export function initSkill(targetDir = process.cwd()) {
  const skillContent = `---
name: sec-guard
description: Automated defensive security and compliance audit tool for source code, secrets, injection vectors, and youth privacy (COPPA / GDPR-K).
allowed-tools:
  - Bash
  - Read
  - Edit
  - Grep
---

# 🛡️ Application Security & Compliance Audit Contract

You are an expert security auditor and automated compliance engineer.
When asked to check, audit, or fix security in this codebase:

## Execution Steps:
1. Run the audit scanner in machine-readable JSON mode:
   \`\`\`bash
   npx sec-guard . --format json
   \`\`\`
2. Read the resulting JSON \`findings\` list.
3. For each finding:
   - Inspect the file and line indicated.
   - Determine the root cause (secret leak, SQL injection, unsafe command exec, COPPA age bias, unguarded tracker).
   - Write a minimal, non-breaking surgical patch.
4. Re-run \`npx sec-guard . --format json\` to verify that **0 issues remain**.
`;

  // Write to .agents/skills/sec-guard.md (Antigravity, Cursor, etc.)
  const agentSkillDir = path.join(targetDir, '.agents', 'skills');
  fs.mkdirSync(agentSkillDir, { recursive: true });
  fs.writeFileSync(path.join(agentSkillDir, 'sec-guard.md'), skillContent, 'utf-8');

  // Write to .claude/skills/sec-guard/SKILL.md (Claude Code)
  const claudeSkillDir = path.join(targetDir, '.claude', 'skills', 'sec-guard');
  fs.mkdirSync(claudeSkillDir, { recursive: true });
  fs.writeFileSync(path.join(claudeSkillDir, 'SKILL.md'), skillContent, 'utf-8');

  console.log(`✅ Installed AI agent skills:`);
  console.log(`   - ${path.join(agentSkillDir, 'sec-guard.md')}`);
  console.log(`   - ${path.join(claudeSkillDir, 'SKILL.md')}`);
}

export function initAgent(targetDir = process.cwd()) {
  initSkill(targetDir);

  const promptBlock = `
# 🛡️ Sec-Guard Rules for AI Coding Assistants
- Whenever modifying API routes, authentication logic, or database operations, run: \`npx sec-guard . --format json\`
- Ensure all secrets, cloud keys, and database passwords are read from environment variables.
- Ensure all SQL queries are parameterized (no raw template string interpolation).
- Ensure minor accounts comply with COPPA / GDPR-K: neutral age screening, default disabled trackers.
`;

  const cursorRulesPath = path.join(targetDir, '.cursorrules');
  fs.writeFileSync(cursorRulesPath, promptBlock, { flag: 'a', encoding: 'utf-8' });

  const windsurfRulesPath = path.join(targetDir, '.windsurfrules');
  fs.writeFileSync(windsurfRulesPath, promptBlock, { flag: 'a', encoding: 'utf-8' });

  console.log(`✅ Installed agent instructions for Cursor (.cursorrules) and Windsurf (.windsurfrules)`);
}

export function initGithubWorkflow(targetDir = process.cwd()) {
  const workflowDir = path.join(targetDir, '.github', 'workflows');
  fs.mkdirSync(workflowDir, { recursive: true });

  const workflowYml = `name: Security & Compliance Scan (sec-guard)

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  schedule:
    - cron: '0 4 * * 1' # Weekly Monday scan

permissions:
  contents: read
  security-events: write # Required for GitHub Code Scanning tab

jobs:
  audit:
    name: Run sec-guard & Upload SARIF
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run sec-guard Audit (SARIF)
        run: npx sec-guard . --format sarif --output results.sarif
        continue-on-error: true # Ensure SARIF uploads even when issues are flagged

      - name: Upload SARIF to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: results.sarif
          category: sec-guard
`;

  const workflowPath = path.join(workflowDir, 'sec-guard.yml');
  fs.writeFileSync(workflowPath, workflowYml, 'utf-8');
  console.log(`✅ Created GitHub Actions workflow at: ${workflowPath}`);
}

export function initGitHook(targetDir = process.cwd()) {
  const gitDir = path.join(targetDir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.warn(`⚠️ No .git directory found at ${targetDir}. Initialize git first.`);
    return;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  fs.mkdirSync(hooksDir, { recursive: true });

  const hookScript = `#!/bin/sh
# sec-guard automated pre-commit security gate
echo "🛡️  Running sec-guard pre-commit check on staged files..."
npx sec-guard --staged --fail-on HIGH
STATUS=$?
if [ $STATUS -ne 0 ]; then
  echo "❌ Commit rejected: Security or compliance vulnerabilities found in staged changes."
  echo "👉 Fix issues or use inline suppression (// sec-guard-ignore) to bypass intentional cases."
  exit 1
fi
echo "✅ Security check passed."
`;

  const hookPath = path.join(hooksDir, 'pre-commit');
  fs.writeFileSync(hookPath, hookScript, { mode: 0o755, encoding: 'utf-8' });
  console.log(`✅ Installed pre-commit hook at: ${hookPath}`);
}
