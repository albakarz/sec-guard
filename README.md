<div align="center">

# 🛡️ sec-guard

### Autonomous Security, Privacy & Compliance Scanner for Modern Apps and AI Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20runtime-brightgreen.svg)]()
[![SARIF 2.1.0](https://img.shields.io/badge/OASIS-SARIF%202.1.0-purple.svg)](https://sarifweb.azurewebsites.net)
[![AI Agent Ready](https://img.shields.io/badge/AI%20Agent-Native%20(JSON%20%2B%20Skills)-orange.svg)]()
[![41 Built-in Rules](https://img.shields.io/badge/Rules-41%20Rules-blueviolet.svg)]()

**Instant static security audit (SAST), secrets scanner, and child protection compliance tool (COPPA / GDPR-K).**  
Runs in milliseconds with zero dependencies. Designed for developers, git pre-commit hooks, CI/CD pipelines, and autonomous AI coding agents.

</div>

---

## ⚡ Highlights

- **⚡ Zero Runtime Dependencies:** Starts instantly in milliseconds via `npx sec-guard .` with 0 megabytes of dependencies to download.
- **🔒 Automatic Secret Redaction:** Mask sensitive tokens in logs and CI (`AKIA************MPLE`) to prevent scanner reports from leaking your credentials.
- **🤖 AI Agent Native:** Produces structured machine-readable JSON for Claude Code, Cursor, Antigravity, and Codex to find, patch, and verify vulnerabilities in a closed loop.
- **👶 Child Privacy & Youth Protection:** First-class auditing for international youth data privacy laws (**US COPPA**, **EU GDPR Article 8**, and **UK Age-Appropriate Design Code**), detecting biased age gates, rogue ad pixels, and unguarded GPS tracking.
- **🧠 Vibe-Coding Blindspot Defense:** Catches AI coding assistant flaws like client-exposed env vars (`NEXT_PUBLIC_...SECRET`), Prisma `$queryRawUnsafe`, Supabase `service_role` in frontend code, and plaintext password comparisons.
- **🪝 Git Pre-Commit Hook:** Run `sec-guard --staged` or install a pre-commit blocker via `npx sec-guard --init-hook`.
- **🤫 Granular Inline Suppression:** Suppress false positives on specific lines with `// sec-guard-ignore` or `// sec-guard-ignore-next-line: RULE_ID`.
- **🐙 GitHub Security Tab Integration:** Exports compliant **OASIS SARIF 2.1.0** reports that annotate lines directly on Pull Requests and in repository Security dashboards.

---

## 🚀 Quickstart

Run directly in any directory without installing anything:

```bash
npx sec-guard .
```

Or install globally:

```bash
npm install -g sec-guard
sec-guard .
```

---

## 🪝 Git Pre-Commit Security Gate

Catch vulnerabilities before they are ever committed to version control:

```bash
# 1. Install pre-commit blocker hook
npx sec-guard --init-hook

# 2. Or scan only staged files anytime
npx sec-guard --staged
```

If a developer or AI assistant accidentally stages a cloud secret, an unescaped SQL query, or a critical vulnerability, the pre-commit hook automatically blocks `git commit`.

---

## 🤖 Using with Autonomous AI Agents

AI coding models (such as Claude 3.7, Codex, Cursor Agent, Antigravity, and Gemini 4) write working code quickly, but frequently introduce subtle security blind spots: string-interpolated SQL queries, hardcoded keys, predictable tokens, or non-compliant age gates.

`sec-guard` gives AI agents an automated verification feedback loop:

```
┌─────────────────┐       1. Runs Bash Tool        ┌─────────────────────────┐
│                 │ ─────────────────────────────> │ npx sec-guard . --format│
│                 │                                │          json           │
│    AI Agent     │       2. Returns JSON Findings └─────────────────────────┘
│ (Claude / Codex │ <───────────────────────────────────────────────┘
│   / Cursor)     │
│                 │       3. Opens files, patches vulnerable lines
│                 │
│                 │       4. Re-runs Bash Tool     ┌─────────────────────────┐
│                 │ ─────────────────────────────> │ Verify 0 issues remain  │
└─────────────────┘                                └─────────────────────────┘
```

### 1. One-Click AI Setup

Install ready-to-use skills and rule files across **Cursor**, **Windsurf**, and **Claude Code**:

```bash
npx sec-guard --init-agent
```

This creates:
- `.agents/skills/sec-guard.md` (Antigravity & Agent skills)
- `.claude/skills/sec-guard/SKILL.md` (Claude Code `/sec-guard` command)
- `.cursorrules` & `.windsurfrules` (Cursor & Windsurf agent instructions)

### 2. Zero-Config One-Shot Prompt

Copy and paste this instruction directly into your AI assistant:

> *"Run `npx sec-guard . --format json` in the terminal. Inspect all reported security and compliance issues in the source code, apply minimal drop-in fixes, and re-run the scan until 0 issues remain."*

---

## 🤫 Inline False-Positive Suppression

To suppress an intentional exception or test fixture, add an inline comment:

```javascript
// Suppress all rules for this line
const testSecret = "dummy-secret"; // sec-guard-ignore

// Suppress a specific rule for this line
const dummyAwsKey = "AKIAIOSFODNN7EXAMPLE"; // sec-guard-ignore: SECRET_AWS_KEY

// Suppress the following line
// sec-guard-ignore-next-line: SQL_INJECTION_RISK
db.query(`SELECT * FROM ${trustedTable}`);
```

`sec-guard` automatically ignores code comment lines (`//`, `#`, `/*`) for injection and configuration rules, preventing documentation from triggering false positives.

---

## 🛡️ Built-in Rule Catalog (41 Rules)

List all rules dynamically in your terminal anytime:

```bash
npx sec-guard --list-rules
```

### Secrets & Credentials
- `SECRET_AWS_KEY` (CRITICAL): AWS Access Key ID (`AKIA...`)
- `SECRET_GOOGLE_API_KEY` (CRITICAL): Google / Firebase API Key (`AIza...`)
- `SECRET_GITHUB_TOKEN` (CRITICAL): GitHub Personal Access or OAuth Token (`ghp_...`)
- `SECRET_OPENAI_KEY` (CRITICAL): OpenAI API Key (`sk-...`, `sk-proj-...`)
- `SECRET_ANTHROPIC_KEY` (CRITICAL): Anthropic API Key (`sk-ant-...`)
- `SECRET_STRIPE_KEY` (CRITICAL): Stripe Secret Key (`sk_live_...`)
- `SECRET_SLACK_TOKEN` (CRITICAL): Slack Bot Token or Webhook URL
- `SECRET_PRIVATE_KEY` (CRITICAL): Embedded RSA / EC / OpenSSH Private Key Header
- `SECRET_DATABASE_URL` (CRITICAL): Database URI with embedded username & password
- `SECRET_FRONTEND_ENV_LEAK` (CRITICAL): Secret variable assigned to frontend prefix (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`)
- `SECRET_SUPABASE_SERVICE_ROLE` (CRITICAL): Exposed Supabase `service_role` key bypassing Row-Level Security
- `SECRET_JWT_HARDCODED` (HIGH): Plaintext JWT signing secret in `jwt.sign()`
- `SECRET_GENERIC_PLAINTEXT_CREDENTIAL` (HIGH): Hardcoded plaintext password or client secret

### Injection & Arbitrary Execution
- `SQL_INJECTION_RISK` (HIGH): Dynamic template literal / f-string in SQL query
- `SQL_INJECTION_CONCATENATION` (HIGH): Raw SQL query built via string concatenation (`+`)
- `ORM_UNSAFE_RAW_QUERY` (HIGH): Prisma `$queryRawUnsafe` or `$executeRawUnsafe`
- `NOSQL_INJECTION_WHERE` (HIGH): MongoDB/Mongoose `$where` clause executing dynamic JavaScript
- `UNSAFE_EXEC_COMMAND` (HIGH): Dynamic shell execution (`exec`, `execSync`, `os.system`)
- `CODE_INJECTION_EVAL` (CRITICAL): Dynamic code evaluation (`eval`, `new Function`, `vm`)
- `UNSAFE_DESERIALIZATION` (CRITICAL): Python `pickle.loads` or `yaml.load` without SafeLoader
- `PATH_TRAVERSAL_RISK` (HIGH): User-controlled input passed directly to file operations
- `SSRF_UNVALIDATED_REQUEST` (HIGH): Outbound HTTP request made with unvalidated user URL
- `OPEN_REDIRECT_RISK` (MEDIUM): Open redirect via user-supplied parameter (`res.redirect(req.query.url)`)
- `XSS_DANGEROUS_HTML` (HIGH): Raw HTML injection (`dangerouslySetInnerHTML`, `.innerHTML`)

### Authentication & Cryptography
- `PLAINTEXT_PASSWORD_COMPARISON` (CRITICAL): Plaintext password comparison (`user.password === req.body.password`)
- `WEAK_BCRYPT_ROUNDS` (MEDIUM): Bcrypt salt rounds configured below 10
- `WEAK_HASHING_ALGORITHM` (MEDIUM): Deprecated broken hashing algorithm (MD5, SHA-1)
- `WEAK_PSEUDORANDOM_SECURITY` (HIGH): Predictable `Math.random()` used for tokens/salts/keys
- `INSECURE_TOKEN_LOCALSTORAGE` (HIGH): Auth token stored in localStorage (vulnerable to XSS)
- `JWT_NONE_ALGORITHM_ALLOWED` (CRITICAL): JWT verification permits `"none"` algorithm
- `JWT_UNVERIFIED_DECODE` (MEDIUM): `jwt.decode()` used without signature verification
- `INSECURE_COOKIE_ATTRIBUTES` (MEDIUM): Session cookie missing `httpOnly: true`

### Youth Privacy & Minor Protection Laws (COPPA / GDPR-K / UK AADC)
- `COPPA_AGE_GATE_BIAS` (COMPLIANCE): Biased age default (e.g. 18+) nudging minor users
- `COPPA_UNGUARDED_TRACKER` (COMPLIANCE): Ad/behavioral tracker (FB Pixel, TikTok, gtag) without consent gate
- `COPPA_GEOLOCATION_UNCHECKED` (COMPLIANCE): GPS / Geolocation queried without checking minor age status
- `COPPA_UNGUARDED_SOCIAL_DM` (COMPLIANCE): Direct messaging enabled by default without parental controls

### Security Misconfigurations
- `CORS_WILDCARD_CREDENTIALS` (HIGH): CORS wildcard `*` origin configured with credentials
- `TLS_VERIFICATION_DISABLED` (HIGH): TLS certificate verification explicitly disabled (`rejectUnauthorized: false`)
- `UNVALIDATED_FILE_UPLOAD` (HIGH): Storing uploads directly with user-supplied `file.originalname`
- `PRODUCTION_DEBUG_ENABLED` (MEDIUM): Application debug mode enabled (`DEBUG = True`)
- `EXPOSED_SOURCE_MAPS` (LOW): Production source maps enabled
- `EXPOSED_ENV_GITIGNORE` (CRITICAL): `.env` file present in workspace without being added to `.gitignore`

---

## ⚙️ Configuration (`.secguardrc.json`)

Generate a starter configuration file:

```bash
npx sec-guard --init-config
```

Example `.secguardrc.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/Albakarz/sec-guard/main/schema/secguardrc.schema.json",
  "minSeverity": "LOW",
  "failOn": "HIGH",
  "ignoreDirs": ["coverage", "test/fixtures", "tmp"],
  "targetExts": [".js", ".ts", ".jsx", ".tsx", ".py", ".json", ".env"],
  "disableRules": ["WEAK_HASHING_ALGORITHM"],
  "customRules": [
    {
      "id": "CUSTOM_NO_PLAINTEXT_SECRET",
      "severity": "HIGH",
      "category": "Custom Rules",
      "pattern": "password\\s*=\\s*['\"][^'\"]+['\"]",
      "flags": "i",
      "message": "Potential hardcoded plaintext credential found.",
      "remediation": "Load secret dynamically from process.env."
    }
  ]
}
```

> **Note on Regex in JSON:** Double-escape backslashes in JSON string patterns (`"\\bpassword\\b"`).

---

## 📊 Output Formats

### 1. Terminal Output (Default)
Styled with ANSI colors, category badges, line snippets, masked secrets, and remediation advice:
```bash
npx sec-guard .
```

### 2. Machine-Readable JSON
Pure stdout JSON stream without banners or ANSI noise, ready for `jq` or AI agent consumption:
```bash
npx sec-guard . --format json
```

### 3. OASIS SARIF 2.1.0
Exports standard SARIF for GitHub Code Scanning:
```bash
npx sec-guard . --format sarif --output results.sarif
```

### 4. GitHub-Flavored Markdown
Generates clean tables and checklists for Pull Request summaries:
```bash
npx sec-guard . --format markdown --output audit-report.md
```

---

## 🐙 GitHub Actions CI/CD Integration

Generate the workflow automatically:

```bash
npx sec-guard --init-github
```

Or add `.github/workflows/sec-guard.yml` to your repository:

```yaml
name: Security & Compliance Scan

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  schedule:
    - cron: '0 4 * * 1' # Weekly Monday scan

permissions:
  contents: read
  security-events: write # Required to publish alerts to GitHub Security tab

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

      - name: Run sec-guard
        run: npx sec-guard . --format sarif --output results.sarif
        continue-on-error: true

      - name: Upload SARIF to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: results.sarif
          category: sec-guard
```

All flagged issues will automatically appear under your repository's **Security** &rarr; **Code scanning alerts** tab and directly on pull request line diffs!

---

## 💻 Programmatic Node.js API

You can also use `sec-guard` as a library inside custom Node.js tools:

```javascript
import { runScan, resolveConfig, formatJson } from 'sec-guard';

const config = resolveConfig({
  minSeverity: 'HIGH',
  ignoreDirs: ['dist', 'coverage']
});

const results = runScan('./src', config);
console.log(`Found ${results.findings.length} vulnerabilities.`);
```

---

## 🧪 Testing

Run the native test suite:

```bash
npm test
```

---

## 📄 License

[MIT](LICENSE) © 2026 Albakarz
