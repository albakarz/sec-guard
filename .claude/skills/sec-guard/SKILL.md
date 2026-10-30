---
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
   ```bash
   npx sec-guard . --format json
   ```
2. Read the resulting JSON `findings` list.
3. For each finding:
   - Inspect the file and line indicated.
   - Determine the root cause (secret leak, SQL injection, unsafe command exec, COPPA age bias, unguarded tracker).
   - Write a minimal, non-breaking surgical patch.
4. Re-run `npx sec-guard . --format json` to verify that **0 issues remain**.
