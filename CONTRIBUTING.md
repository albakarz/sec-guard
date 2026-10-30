# Contributing to sec-guard

Thank you for your interest in contributing to **sec-guard**! We welcome bug reports, rule suggestions, performance optimizations, and documentation improvements.

---

## 🛠️ Design Philosophy & Principles

1. **Zero External Runtime Dependencies:**
   `sec-guard` runs instantaneously via `npx sec-guard` without downloading heavy `node_modules`. All runtime code must use native Node.js APIs (`node:fs`, `node:path`, `node:crypto`, `node:process`).
2. **Deterministic & High-Precision:**
   Rules must avoid noisy false positives. Provide precise regexes and clear, actionable remediation guidance.
3. **Multi-Platform Interoperability:**
   Support both humans (pretty terminal text), CI pipelines (SARIF 2.1.0), and autonomous AI agents (clean JSON).

---

## 🚀 Development Workflow

### 1. Clone & Setup
```bash
git clone https://github.com/Albakarz/sec-guard.git
cd sec-guard
```

### 2. Run Tests
The test suite uses Node's native test runner (`node:test`):
```bash
npm test
```

### 3. Test Scans Locally
```bash
node ./bin/sec-guard.js test/fixtures/vulnerable
node ./bin/sec-guard.js test/fixtures/clean
```

---

## ➕ Adding a New Rule

1. Open the relevant file in `src/rules/`:
   - `secrets.js` for API keys, tokens, credentials
   - `injection.js` for SQLi, XSS, Command/Code Injection
   - `auth-crypto.js` for hashing, randomness, session handling
   - `compliance.js` for COPPA, GDPR-K, youth privacy
   - `misconfiguration.js` for CORS, TLS, debug flags
2. Add your rule specification:
   ```javascript
   {
     id: 'YOUR_RULE_NAME',
     category: 'Category Name',
     severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'COMPLIANCE' | 'LOW' | 'INFO',
     regex: /your-regex-pattern/,
     message: 'What the vulnerability is.',
     cwe: 'CWE-XXX',
     remediation: 'How to fix it.'
   }
   ```
3. Add a sample test case to `test/fixtures/vulnerable/sample_app.js` and an assertion in `test/sec-guard.test.js`.
4. Run `npm test` to verify.

---

## 📋 Pull Request Guidelines

- Keep PRs focused on a single feature or bug fix.
- Ensure all tests pass (`npm test`).
- Include test fixtures demonstrating any new or modified rule behavior.
- Ensure no runtime dependencies are introduced in `package.json`.

