Gemini 4 Carbon is Google DeepMind’s frontier AI model announced in late October 2026. It is designed specifically for complex, long-horizon software engineering and defensive cybersecurity workflows (such as root-cause vulnerability detection, exploitation verification, and generating production-ready security patches).

It features a 1-million-token context window and multimodal inputs (text, code, image, video, and audio).

Can you use it?

Not yet, unless you belong to a verified security organization.

⚬ Current Availability: Access is strictly restricted to vetted defense partners, national cyber agencies, critical infrastructure providers, and academic security labs through Google DeepMind’s Fairwind Program.
⚬ Public & Developer Access: It is not yet available in the public Gemini consumer app, Google AI Studio, or standard Vertex AI API endpoints. Google plans a phased rollout to enterprise platforms and developers after voluntary pre-release safety testing completes.

How to use it (or prepare for it)

Route	How to access
Defensive Cyber Teams	Apply directly through Google’s Fairwind Program interest form. Vetting requires identity checks, enterprise verification, and an agreement to use the model solely for defensive analysis and mitigation.
Developers & General Users	Use Gemini 4 Argon in the interim. Argon shares the same core Gemini 4 architecture, token limits, and pricing structure ($2 input / $10 output per million tokens introductory rate). It is accessible today via Google AI Studio, Vertex AI, and Google AI Pro/Ultra tiers.

Once Carbon expands to general API availability, you will be able to invoke it simply by swapping your model identifier (e.g., updating gemini-4-argon to gemini-4-carbon) in Google AI Studio or Vertex AI client SDKs.

Prompting Gemini 4 Carbon (and its sister model Gemini 4 Argon) differs from prompting general conversational LLMs. Because Carbon is trained for long-horizon software engineering, system debugging, and defensive security analysis, it operates best when prompted like a senior systems engineer using an Agentic Action Contract.

Core Prompting Principles for Gemini 4 Carbon

1. Separate Analysis from Execution:
   Avoid asking the model to fix an issue in a single step. Instruct it to isolate the root cause, present a verification method, and wait for confirmation or output patches with corresponding unit tests.
2. Define Strict Environment Bounds & File Permissions:
   Carbon can analyze massive context windows (up to 1M tokens). Tell it explicitly which files or directories it has read/write permissions for, and ban external network or dependency modifications unless asked.
3. Require Falsifiable Proof & Test Regressions:
   Ask for proof that a flaw or bug actually manifests (reproduction steps/failing test), and require that the proposed fix doesn't break existing functionality.
4. Enforce Unified Diffs over Full-File Rewrites:
   Because it handles low-level systems and large repositories, requiring unified diff outputs keeps latency down and avoids hallucinated omissions.

Specialized Prompt Templates

1. Defensive Vulnerability Audit & Patching (Primary Use Case)

You are an expert security auditor performing a defensive source review on the attached codebase.

### Task:
Identify any critical or high-severity vulnerabilities (memory safety, injection, logic flaws, or unsafe deserialization) in the provided module.

### Execution Constraints:
1. Ground every claim: Cite the exact file paths, function names, and line numbers. Do not speculate on unprovided code.
2. Exploitability verification: Explain the concrete conditions required to trigger the defect. If theoretical only, explicitly declare it as "Unconfirmed / Low exploitability".
3. Provide a minimal unified diff (`diff -u`) that mitigates the flaw without altering public API signatures.
4. Supply an automated regression test script (e.g., pytest, GoogleTest, or curl-based harness) verifying the patch neutralizes the flaw.

### Output Format:
- **Vulnerability Summary & Root Cause**
- **Trigger Scenario & Attack Vector**
- **Unified Diff (Patch)**
- **Verification / Regression Test Code**


2. Deep Root-Cause Engineering & Multi-File Refactoring

We are experiencing an intermittent issue: [Describe the symptom/error log].

### Provided Context:
[Include relevant logs, call stacks, or repository files]

### Instructions:
1. Trace the failure path step-by-step through the call stack across the provided files.
2. Identify assumptions, race conditions, or edge-case state mutations that could trigger this failure.
3. If multiple explanations exist, rank them by likelihood and propose an experiment or log statement to falsify the alternatives.
4. Output:
   - Root-cause analysis.
   - Minimal surgical fix (unified diff).
   - Recommended unit/integration test covering this failure mode.


Technical Configuration (API / Studio)

⚬ Thinking Budget / Reasoning Effort: Keep thinking level set to High (default for complex evals). Carbon’s advantage lies in multi-step internal evaluation before generating a response.
⚬ Temperature: Set between 0.0 and 0.2 for security audits and production code generation to enforce deterministic logic and prevent hallucinated API calls.
⚬ Context Placement: Place untrusted input (e.g., raw logs or third-party code snippets) in the middle of the prompt, and place your explicit task requirements and formatting contracts at the very bottom to ensure strong instruction adherence.

Lets say I have an app I made with AI, I want to check if it have any security issues?

To check an AI-generated app for security issues, you need to account for both standard web/software vulnerabilities and the specific blind spots AI models exhibit when writing code.

AI coding assistants frequently produce clean-looking code that works in happy-path testing but skips input validation, exposes credentials, or relies on unsafe string concatenation.

Step 1: Scan for the 5 Most Common AI Flaws

Run through your codebase specifically looking for these patterns:

1. Hardcoded Secrets & API Keys
  ⚬ The AI Pattern: Models often drop working API keys, JWT secrets, or database URLs directly into source files or config defaults.
  ⚬ What to check: Ensure every credential is read from an environment variable (.env) and that .env files are explicitly added to .gitignore. Check your Git history to confirm secrets were never committed previously.
2. String-Concatenated Queries (SQL / Command Injection)
  ⚬ The AI Pattern: AI often defaults to Python f-strings, JavaScript template literals, or string addition when constructing database queries or shell calls.
  ⚬ What to check: Verify that all SQL queries use parameterized placeholders (?, $1, or ORM-bound parameters) rather than raw string interpolation. Ensure no user input is passed directly to functions like exec(), eval(), or os.system().
3. Missing Authentication & Authorization (BOLA / IDOR)
  ⚬ The AI Pattern: AI frequently builds working CRUD endpoints (e.g., GET /api/documents/:id) that retrieve the object by ID directly from the database without verifying that the requesting user owns that document.
  ⚬ What to check: Check that every protected route verifies both the user's session token and ownership/role before querying or mutating records.
4. Hallucinated or Outdated Packages ("Slopsquatting")
  ⚬ The AI Pattern: Models sometimes invent library names that do not exist or pull in deprecated versions with known vulnerabilities. Attackers register these hallucinated names on npm/PyPI to deliver malicious code.
  ⚬ What to check: Inspect your package.json, requirements.txt, or lockfiles. Verify that every imported library is an established, active package with an official registry page.
5. Weak Randomness in Security Contexts
  ⚬ The AI Pattern: AI often uses Math.random() or Python's random module to generate tokens, reset links, or session IDs.
  ⚬ What to check: Use cryptographically secure pseudorandom generators (e.g., crypto.randomBytes(), secrets.token_urlsafe()) for anything tied to security or identity.

Step 2: Run Free Automated Security Scanners

Instead of manually reading thousands of lines, run these standard automated tools on your repository:

Scan Type	Recommended Free / Open-Source Tools	What It Detects
Secrets Scanning	gitleaks, trufflehog	API tokens, private keys, database passwords in code or Git history.
Static Analysis (SAST)	semgrep, bandit (Python), eslint-plugin-security (JS/TS)	Insecure functions, SQL injection, logic flaws, and dangerous configs.
Dependency Audits (SCA)	npm audit, pip-audit, snyk	Known public vulnerabilities (CVEs) in third-party libraries.
Dynamic Testing (DAST)	OWASP ZAP	Runtime flaws, missing HTTP security headers, CORS misconfigurations.

Step 3: Architecture & Deployment Checklist

⚬ Client vs. Server Separation: If your app connects to an LLM or third-party service (e.g., Stripe, Supabase, OpenAI), ensure the API keys and database queries reside strictly in server-side routes or edge functions, never in client-side React/Vue code.
⚬ CORS & Headers: Verify that Cross-Origin Resource Sharing (CORS) only permits your frontend domain, and configure essential security headers (Content-Security-Policy, X-Content-Type-Options: nosniff, Strict-Transport-Security).
⚬ Input Validation: Enforce server-side schema validation (e.g., using libraries like Zod, Pydantic, or Joi) on all incoming payload bodies and query parameters.

Give me a deeper instructions that works for any type of apps and for any platform, I want to use it as a skill for any ai cli I use, lets say mostly antigravity, codex and claudecode. How can we do so? We need it to cover every corner for security with also applies for laws for creating accounts for minors and so on. A full one skill I can give it to my ai agent and it will check and find any holes in the code!

To deploy an exhaustive, portable security and regulatory audit skill across AI coding CLIs (Claude Code, OpenAI Codex, and Antigravity / Cursor / Windsurf), use a self-contained markdown skill definition that enforces a multi-pass defensive inspection contract.

How to Install the Skill Across Platforms

Save the specification below into the respective directory for each tool:

Platform	Recommended Location	How to Trigger
Claude Code	.claude/skills/security-audit/SKILL.md (or ~/.claude/skills/security-audit/SKILL.md for global use)	Run /security-audit in your terminal
Antigravity / Windsurf / Cursor	.cursorrules, .windsurfrules, or .agents/skills/security-audit.md	Run @security-audit or reference the prompt in chat
OpenAI Codex / CLI Agents	Root configuration or system instructions file (e.g., CODEX.md or .prompts/security-audit.md)	Pass as prompt argument: codex --instructions security-audit.md

The Universal Security & Compliance Audit Skill

Save the following content as SKILL.md:

---
name: security-audit
description: Exhaustive defensive security audit and regulatory compliance scanner covering code flaws, secrets, identity logic, and child protection laws (COPPA / GDPR-K).
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Universal Application Security & Compliance Audit Protocol

You are an adversarial defensive security auditor and regulatory compliance specialist. Your mission is to analyze the local repository to uncover security vulnerabilities, architectural flaws, hardcoded secrets, and regulatory non-compliance.

Do not write code modifications or refactor systems until your findings report is produced and accepted.

---

## Phase 1: Discovery & Architecture Profiling
1. Scan project manifests (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, etc.) to map frameworks, runtimes, and dependencies.
2. Identify all application entrypoints:
   - HTTP routes / API endpoints / WebSocket handlers
   - Public RPCs / GraphQL resolvers
   - Database schemas, ORMs, and migration files
   - Authentication middlewares and session management logic

---

## Phase 2: Core Technical Security Audit

Systematically trace data flows from untrusted inputs to execution sinks across these key vectors:

### 1. Authentication & Session Integrity
- Inspect token issuance, signature verification, and expiration handling (JWT, OAuth2, session cookies).
- Check cookie security flags (`Secure`, `HttpOnly`, `SameSite=Strict/Lax`).
- Verify rate limiting and brute-force defenses on `/login`, `/register`, `/reset-password`, and OTP verification endpoints.

### 2. Authorization & Multi-Tenancy (BOLA / IDOR)
- Verify that every database lookup for an entity (e.g., `findById(id)`) verifies tenancy ownership (e.g., `where user_id = currentUser.id`).
- Check Role-Based Access Control (RBAC): Ensure administrative routes cannot be triggered by authenticated standard users via parameter tampering.

### 3. Injection & Data Handling
- Verify all database queries are parameterized; flag any raw string interpolation or dynamic concatenation.
- Check shell/process executions (`exec`, `spawn`, `os.system`) for unsanitized user arguments.
- Check template rendering for Cross-Site Scripting (XSS) vectors, especially bypasses like `dangerouslySetInnerHTML` or raw HTML pipes.

### 4. Secrets & Sensitive Data Leakage
- Search code, comments, sample configs, and test files for API keys, private certificates, JWT secrets, and database credentials.
- Verify sensitive fields (passwords, payment data, PII) are excluded from server logging statements and error stack traces.

### 5. Client vs. Server Boundaries
- Inspect client-facing bundles (React, Vue, mobile clients) for leaked backend secrets, internal administrative routes, or private API endpoints.

---

## Phase 3: Regulatory Compliance & Minor Protection (COPPA / GDPR-K)

If the application includes user registration, profile creation, or data collection, verify strict adherence to international youth privacy standards (US COPPA, EU GDPR Article 8 / GDPR-K, and UK Age-Appropriate Design Code):

### 1. Age Gating & Neutral Age Screening
- **Neutral Screening:** Verify birthdate collection mechanisms do not nudge the user toward choosing an older age (e.g., no default age set to 18+, no error messages prompting "You must be 13 to continue").
- **Session Locking:** Check whether failing an age gate locks the session or blocks immediate resubmission from the same browser/IP with an altered age.

### 2. Verifiable Parental Consent (VPC)
- If users under the jurisdiction age threshold (under 13 in the US, under 13-16 in the EU/UK) are permitted to create accounts:
  - Verify that no personal data (full name, email, phone number, geolocation, avatar) is collected before verifiable parental consent is completed.
  - Verify parent-consent notification workflows exist and cannot be bypassed via direct API manipulation.

### 3. Data Minimization & Default Privacy for Minors
- **Geolocation:** High-precision GPS/location tracking must be disabled by default for youth accounts.
- **Social Features:** Direct messaging, friend requests, and public visibility must be restricted or disabled by default unless explicitly enabled with parental verification.
- **Behavioral Profiling & Ads:** Verify no behavioral tracking, targeted advertising SDKs, or third-party analytics pixels execute on youth accounts.

### 4. Data Rights & Erasure
- Verify operational endpoints exist for users/parents to exercise the **Right to Erasure** ("Right to be Forgotten") and **Data Portability** (exporting user records).

---

## Phase 4: Output Contract

Format findings strictly using the following schema, ranked by severity (**Critical**, **High**, **Medium**, **Low**, **Informational**):

### [Finding ID]: <Clear Vulnerability Title>
- **Severity:** Critical | High | Medium | Low | Compliance Non-Conformance
- **Category:** (e.g., Broken Authorization, SQL Injection, COPPA Non-Compliance)
- **Location:** `path/to/file:line_number`
- **Root Cause & Attack Vector:** Explain precisely how the flaw manifests, including the untrusted input source and vulnerable execution sink.
- **Regulatory / Security Impact:** Practical danger to users, infrastructure, or legal exposure under data protection laws.
- **Recommended Remediation (Diff):** Provide a minimal unified diff (`diff -u`) resolving the issue without breaking standard functionality.
- **Automated Verification Test:** Provide a test script or harness that validates the flaw is mitigated.


Verification and Execution Workflow

1. Dry-Run the Skill: Place the file in .claude/skills/security-audit/SKILL.md or .agents/skills/security-audit.md.
2. Execute the Command: Run /security-audit in your CLI. The agent will inspect your repository manifests, read your endpoints, and flag technical flaws alongside compliance oversights.
3. Targeted Sub-Audits: To audit a specific component (e.g., your authentication and signup flow for youth data), pass targeted path arguments:
   /security-audit src/auth src/api/users

   You can build and publish an open-source CLI tool to npm so that anyone can run it instantly using npx <your-package-name> or install it globally with npm install -g <your-package-name>.

Step 1: Initialize the Project

Create a new directory on your machine and initialize an npm package:

mkdir app-sec-guard
cd app-sec-guard
npm init -y


Step 2: Configure package.json

Open package.json. Add the "bin" field (which tells npm what command to register) and declare "type": "module" if you want modern ES modules:

{
  "name": "app-sec-guard",
  "version": "1.0.0",
  "description": "Open-source security and youth privacy (COPPA/GDPR) audit scanner for apps",
  "main": "bin/cli.js",
  "bin": {
    "app-sec-guard": "./bin/cli.js"
  },
  "keywords": ["security", "audit", "coppa", "gdpr", "cli", "ai-agent"],
  "author": "Your Name <you@example.com>",
  "license": "MIT"
}


Note: Choose a unique package name on npm. If app-sec-guard is taken, try something like @your-username/sec-guard or guardian-cli.

Step 3: Write the CLI Script (bin/cli.js)

Create a folder named bin and a file named cli.js:

mkdir bin
touch bin/cli.js


Paste the following scanner code into bin/cli.js:

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const targetDir = args[0] || process.cwd();

console.log(`\n🛡️  App Security & Compliance Scanner`);
console.log(`📂 Scanning directory: ${targetDir}\n`);

// 1. Files to ignore
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.venv', '.next']);
const TARGET_EXTS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.html', '.env']);

// 2. Rules covering AI flaws and youth privacy
const RULES = [
  {
    id: 'SECRET_EXPOSURE',
    severity: 'CRITICAL',
    regex: /(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\\-_]{35}|ghp_[0-9a-zA-Z]{36}|sk-[a-zA-Z0-9]{32,})/,
    message: 'Exposed API Key or Cloud credential detected in source code.'
  },
  {
    id: 'SQL_INJECTION_RISK',
    severity: 'HIGH',
    regex: /(query\(`SELECT.*?\$\{.*?\}|execute\(f["']SELECT.*?\{)/,
    message: 'Dynamic string interpolation in SQL query. Use parameterized statements.'
  },
  {
    id: 'UNSAFE_EXEC',
    severity: 'HIGH',
    regex: /(child_process\.exec\(|os\.system\(|subprocess\.Popen\(.*?shell\s*=\s*True)/,
    message: 'Shell command execution detected. Verify input arguments are strictly sanitized.'
  },
  {
    id: 'AGE_GATE_BIAS',
    severity: 'COMPLIANCE',
    regex: /(defaultAge\s*[:=]\s*(18|21)|ageSelect\.value\s*=\s*['"]18['"])/,
    message: 'Biased age selection default found. Age screening must be neutral (COPPA / GDPR-K).'
  },
  {
    id: 'UNGUARDED_TRACKER',
    severity: 'COMPLIANCE',
    regex: /(fbq\('init'|gtag\('config'|tiktokAnalytics)/,
    message: 'Analytics/Ad tracker detected. Must be disabled by default on youth accounts.'
  }
];

let issuesFound = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (TARGET_EXTS.has(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.regex.test(line)) {
          issuesFound++;
          const relPath = path.relative(process.cwd(), filePath);
          console.log(`[${rule.severity}] ${relPath}:${index + 1}`);
          console.log(`  Rule:    ${rule.id}`);
          console.log(`  Details: ${rule.message}`);
          console.log(`  Line:    ${line.trim().slice(0, 80)}\n`);
        }
      }
    });
  } catch {
    // Skip unreadable binary files or symlinks
  }
}

// Support a flag to export the AI skill file directly
if (args.includes('--init-skill')) {
  const skillContent = `---
name: security-audit
description: Security and youth privacy audit
---
Inspect the codebase for hardcoded secrets, injection vectors, and COPPA/GDPR compliance.
`;
  const skillDir = path.join(process.cwd(), '.agents', 'skills');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'security-audit.md'), skillContent);
  console.log(`✅ Created AI agent skill at: .agents/skills/security-audit.md\n`);
  process.exit(0);
}

// Run the scan
walk(targetDir);

if (issuesFound === 0) {
  console.log('✅ No security or compliance red flags detected.');
  process.exit(0);
} else {
  console.log(`⚠️  Scan finished: ${issuesFound} issue(s) identified.`);
  process.exit(1);
}


Make the script executable:

chmod +x bin/cli.js


Step 4: Test Locally Before Publishing

Link your project locally so your computer treats it like an installed package:

npm link


Now you can test it in any directory on your computer:

app-sec-guard .


To unlink when done testing:

npm unlink -g app-sec-guard


Step 5: Publish Open Source to npm

1. Create an account at npmjs.com if you don't have one.
2. Log in through your terminal:
   npm login
   
3. Publish your package:
   npm publish --access public
   

How Anyone Can Use Your Tool

Once published, anyone can use it in three ways without cloning your repository:

⚬ Instant execution (no installation):
  npx app-sec-guard
  
⚬ Global installation:
  npm install -g app-sec-guard
  app-sec-guard
  
⚬ Install the AI agent skill into their repo:
  npx app-sec-guard --init-skill

  To add custom configuration and user-defined regex rules without slowing down npx with heavy third-party dependencies, implement a configuration loader in bin/cli.js that checks for a .secguardrc.json file or a --config flag.

Step 1: Example Configuration File (.secguardrc.json)

Users can create this file in the root of their project to disable default checks, add extra directories to ignore, or add company-specific regex rules:

{
  "ignoreDirs": ["cypress", "temp", "scripts/fixtures"],
  "targetExts": [".js", ".ts", ".jsx", ".tsx", ".py", ".env", ".yaml"],
  "disableRules": ["UNGUARDED_TRACKER"],
  "customRules": [
    {
      "id": "NO_RAW_LOCALSTORAGE_JWT",
      "severity": "HIGH",
      "pattern": "localStorage\\.setItem\\(['\"](token|jwt|auth)",
      "flags": "i",
      "message": "Tokens stored in localStorage are vulnerable to XSS. Use secure HttpOnly cookies."
    },
    {
      "id": "UNMASKED_SSN_PATTERN",
      "severity": "CRITICAL",
      "pattern": "\\b\\d{3}-\\d{2}-\\d{4}\\b",
      "flags": "",
      "message": "Possible unmasked Social Security Number detected in source file."
    }
  ]
}


Step 2: Updated bin/cli.js

Replace your existing bin/cli.js with this expanded version. It adds configuration file discovery, argument parsing, safe regex compilation, and an --init-config generator:

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 1. Parse CLI arguments
const rawArgs = process.argv.slice(2);
const flags = {};
const positionalArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--config' || arg === '-c') {
    flags.config = rawArgs[++i];
  } else if (arg.startsWith('--')) {
    flags[arg.slice(2)] = true;
  } else {
    positionalArgs.push(arg);
  }
}

// 2. Handle generation helpers (--init-config, --init-skill)
if (flags['init-config']) {
  const sampleConfig = {
    ignoreDirs: ["coverage", "fixtures"],
    disableRules: [],
    customRules: [
      {
        id: "SAMPLE_NO_PLAINTEXT_SECRET",
        severity: "HIGH",
        pattern: "password\\s*=\\s*['\"][^'\"]+['\"]",
        flags: "i",
        message: "Potential hardcoded plaintext credential found."
      }
    ]
  };
  fs.writeFileSync(
    path.join(process.cwd(), '.secguardrc.json'),
    JSON.stringify(sampleConfig, null, 2)
  );
  console.log('✅ Created starter configuration: .secguardrc.json');
  process.exit(0);
}

if (flags['init-skill']) {
  const skillDir = path.join(process.cwd(), '.agents', 'skills');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, 'security-audit.md'),
    `---\nname: security-audit\ndescription: Security and compliance scanner\n---\nAudit the codebase for injection vectors, exposed credentials, and COPPA/GDPR compliance.\n`
  );
  console.log('✅ Created AI agent skill at: .agents/skills/security-audit.md');
  process.exit(0);
}

const targetDir = positionalArgs[0] || process.cwd();

// 3. Load configuration (.secguardrc.json or --config path)
let userConfig = {};
const defaultConfigFiles = ['.secguardrc.json', '.secguardrc'];
const configFilePath = flags.config 
  ? path.resolve(process.cwd(), flags.config)
  : defaultConfigFiles
      .map(file => path.resolve(process.cwd(), file))
      .find(file => fs.existsSync(file));

if (configFilePath) {
  try {
    const rawContent = fs.readFileSync(configFilePath, 'utf-8');
    userConfig = JSON.parse(rawContent);
    console.log(`⚙️  Loaded config: ${path.relative(process.cwd(), configFilePath)}`);
  } catch (err) {
    console.error(`❌ Failed to parse config file (${configFilePath}): ${err.message}`);
    process.exit(1);
  }
}

// 4. Default scanning rules
const DEFAULT_RULES = [
  {
    id: 'SECRET_EXPOSURE',
    severity: 'CRITICAL',
    regex: /(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\\-_]{35}|ghp_[0-9a-zA-Z]{36}|sk-[a-zA-Z0-9]{32,})/,
    message: 'Exposed API Key or Cloud credential detected in source code.'
  },
  {
    id: 'SQL_INJECTION_RISK',
    severity: 'HIGH',
    regex: /(query\(`SELECT.*?\$\{.*?\}|execute\(f["']SELECT.*?\{)/,
    message: 'Dynamic string interpolation in SQL query. Use parameterized statements.'
  },
  {
    id: 'UNSAFE_EXEC',
    severity: 'HIGH',
    regex: /(child_process\.exec\(|os\.system\(|subprocess\.Popen\(.*?shell\s*=\s*True)/,
    message: 'Shell command execution detected. Verify input arguments are strictly sanitized.'
  },
  {
    id: 'AGE_GATE_BIAS',
    severity: 'COMPLIANCE',
    regex: /(defaultAge\s*[:=]\s*(18|21)|ageSelect\.value\s*=\s*['"]18['"])/,
    message: 'Biased age selection default found. Age screening must be neutral (COPPA / GDPR-K).'
  },
  {
    id: 'UNGUARDED_TRACKER',
    severity: 'COMPLIANCE',
    regex: /(fbq\('init'|gtag\('config'|tiktokAnalytics)/,
    message: 'Analytics/Ad tracker detected. Must be disabled by default on youth accounts.'
  }
];

// 5. Merge settings, filters, and custom rules
const disabledRuleIds = new Set(userConfig.disableRules || []);
const ignoredDirs = new Set([
  'node_modules', '.git', 'dist', 'build', '.venv', '.next',
  ...(userConfig.ignoreDirs || [])
]);

const targetExts = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.html', '.env',
  ...(userConfig.targetExts || [])
]);

// Compile custom rules safely
const activeRules = DEFAULT_RULES.filter(rule => !disabledRuleIds.has(rule.id));

if (Array.isArray(userConfig.customRules)) {
  userConfig.customRules.forEach((rule, idx) => {
    if (!rule.id || !rule.pattern) {
      console.warn(`⚠️ Skipping custom rule at index ${idx}: Missing "id" or "pattern".`);
      return;
    }
    try {
      activeRules.push({
        id: rule.id,
        severity: rule.severity || 'MEDIUM',
        regex: new RegExp(rule.pattern, rule.flags || ''),
        message: rule.message || 'Custom rule violation.'
      });
    } catch (err) {
      console.error(`❌ Invalid regex pattern in custom rule "${rule.id}": ${err.message}`);
    }
  });
}

console.log(`\n🛡️  App Security & Compliance Scanner`);
console.log(`📂 Scanning directory: ${targetDir}`);
console.log(`📋 Active rules: ${activeRules.length}\n`);

// 6. Execution engine
let issuesFound = 0;

function walk(dir) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // Ignore directories with permission errors
  }

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (targetExts.has(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const rule of activeRules) {
        if (rule.regex.test(line)) {
          issuesFound++;
          const relPath = path.relative(process.cwd(), filePath);
          console.log(`[${rule.severity}] ${relPath}:${index + 1}`);
          console.log(`  Rule:    ${rule.id}`);
          console.log(`  Details: ${rule.message}`);
          console.log(`  Line:    ${line.trim().slice(0, 80)}\n`);
        }
      }
    });
  } catch {
    // Skip binary files or unreadable symlinks
  }
}

walk(targetDir);

if (issuesFound === 0) {
  console.log('✅ No security or compliance red flags detected.');
  process.exit(0);
} else {
  console.log(`⚠️  Scan finished: ${issuesFound} issue(s) identified.`);
  process.exit(1);
}


Step 3: How Users Interact With the Configuration

Users can run the scanner in multiple ways:

⚬ Generate a starter configuration:
  npx app-sec-guard --init-config
  
⚬ Run with automatic config discovery (detects .secguardrc.json in the current working directory):
  npx app-sec-guard .
  
⚬ Specify a dedicated configuration file:
  npx app-sec-guard . --config configs/production-rules.json
  

Step 4: Key Regex Caveat in JSON

Because regex patterns in JSON are strings, backslashes must be double-escaped:

⚬ In JavaScript code: /\bpassword\b/
⚬ In .secguardrc.json: "\\bpassword\\b"

To enable an AI agent (like Claude Code, Cursor, Antigravity, or Codex) to run your CLI tool and automatically fix issues, the tool needs to communicate in a way AI agents understand: clean machine-readable data (JSON) and an Agent Skill / Instruction prompt.

Here is how to design the CLI so any user can install it and tell their AI agent to run it.

Step 1: Add --json Output to Your CLI

AI agents parse structured JSON much faster and more reliably than styled terminal text. In your bin/cli.js, add a check for the --json flag:

// Inside bin/cli.js

const outputJson = flags.json || flags.j;

// Instead of only console.log formatting:
if (outputJson) {
  const result = {
    totalIssues: issuesFound,
    findings: gatheredIssues // array of { id, severity, file, line, message, codeSnippet }
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(issuesFound > 0 ? 1 : 0);
}


This lets an AI agent execute the command via its terminal tool, receive a clean JSON array of files, line numbers, and errors, and immediately know where to go without stripping ANSI colors.

Step 2: Auto-Install Agent Instructions (--init-agent)

Give users a one-line command to install the AI agent instructions into whatever tool they use.

Add an --init-agent command to bin/cli.js:

if (flags['init-agent']) {
  const promptContent = `# Security & Compliance Audit Protocol

When instructed to audit or fix security in this repository:
1. Run \`npx app-sec-guard --json .\` using your bash tool.
2. Parse the JSON \`findings\` array.
3. For each finding:
   - Read the flagged file at the specified line.
   - Analyze the root cause (SQL injection, credential leak, COPPA age gate bias, unguarded tracker).
   - Apply a minimal, non-breaking fix.
4. Re-run \`npx app-sec-guard --json .\` to verify 0 issues remain.
`;

  // Write to Claude Code / generic agents
  fs.mkdirSync('.claude', { recursive: true });
  fs.writeFileSync('.claude/app-sec-guard.md', promptContent);

  // Write to Cursor / Windsurf / Antigravity rules
  fs.writeFileSync('.cursorrules', `\n# App Sec Guard\n${promptContent}`, { flag: 'a' });

  console.log('✅ Installed agent instructions for Claude Code and Cursor/Antigravity.');
  process.exit(0);
}


Step 3: How End Users Give It to Their AI Agent

In your repository's README.md, provide this simple guide for users:

Option A: One-Shot Prompt (Zero Configuration)

Users just paste this into Claude Code, Codex, or Cursor Agent:

"Run npx app-sec-guard --json . in the terminal, check the output for any security or youth privacy issues, fix them directly in the files, and run the command again to confirm they are resolved."

Option B: Dedicated Agent Command (Claude Code)

If the user runs Claude Code, they can add it as a custom skill in their repository by creating .claude/skills/audit.md:

---
name: audit
description: Run security and COPPA compliance audit and patch issues
allowed-tools:
  - Bash
  - Read
  - Edit
---

Execute `npx app-sec-guard --json .` in bash. Inspect all reported violations in the source code, patch them, and re-run until the command passes with 0 issues.


The user then simply types in their terminal:

/audit


How the AI Agent Executes the Workflow

┌─────────────────┐       1. Runs Bash Tool        ┌─────────────────────────┐
│                 │ ─────────────────────────────> │ npx app-sec-guard --json│
│                 │                                └─────────────────────────┘
│                 │       2. Returns JSON Findings                  │
│    AI Agent     │ <───────────────────────────────────────────────┘
│ (Claude / Codex │
│   / Cursor)     │       3. Opens files, patches vulnerable lines
│                 │
│                 │       4. Re-runs Bash Tool     ┌─────────────────────────┐
│                 │ ─────────────────────────────> │ Verify 0 issues remain  │
└─────────────────┘                                └─────────────────────────┘


By providing both the executable command and a clear markdown prompt contract, any developer can hand the tool off to an autonomous AI agent to audit and remediate their code automatically.

To integrate your CLI with CI pipelines and GitHub’s native Code Scanning (Security tab), you need two things:

1. Clean stdout/file output: When --format json or --format sarif is used, suppress friendly terminal emojis/banners so output can be piped directly into tools like jq or written directly to a report file using an optional --output flag.
2. SARIF 2.1.0 Compliance: Map your rules and findings to the OASIS SARIF schema so GitHub’s upload-sarif action can annotate lines directly in Pull Requests and repository security dashboards.

Step 1: Updated bin/cli.js with SARIF and JSON Formatters

Replace bin/cli.js with this updated script. It collects all findings into memory first, then renders them via --format text (default), --format json, or --format sarif, with optional --output <file>:

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 1. Argument parsing
const rawArgs = process.argv.slice(2);
const flags = {
  format: 'text', // 'text' | 'json' | 'sarif'
  output: null
};
const positionalArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--format' || arg === '-f') {
    flags.format = (rawArgs[++i] || 'text').toLowerCase();
  } else if (arg === '--output' || arg === '-o') {
    flags.output = rawArgs[++i];
  } else if (arg === '--config' || arg === '-c') {
    flags.config = rawArgs[++i];
  } else if (arg.startsWith('--')) {
    flags[arg.slice(2)] = true;
  } else {
    positionalArgs.push(arg);
  }
}

// 2. Generation helpers
if (flags['init-config']) {
  const sampleConfig = {
    ignoreDirs: ["coverage", "fixtures"],
    disableRules: [],
    customRules: []
  };
  fs.writeFileSync(path.join(process.cwd(), '.secguardrc.json'), JSON.stringify(sampleConfig, null, 2));
  console.log('✅ Created .secguardrc.json');
  process.exit(0);
}

const targetDir = positionalArgs[0] || process.cwd();

// 3. Load configuration
let userConfig = {};
const defaultConfigFiles = ['.secguardrc.json', '.secguardrc'];
const configFilePath = flags.config 
  ? path.resolve(process.cwd(), flags.config)
  : defaultConfigFiles
      .map(file => path.resolve(process.cwd(), file))
      .find(file => fs.existsSync(file));

if (configFilePath) {
  try {
    userConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to parse config file: ${err.message}`);
    process.exit(1);
  }
}

// 4. Default scanning rules
const DEFAULT_RULES = [
  {
    id: 'SECRET_EXPOSURE',
    severity: 'CRITICAL',
    regex: /(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\\-_]{35}|ghp_[0-9a-zA-Z]{36}|sk-[a-zA-Z0-9]{32,})/,
    message: 'Exposed API Key or Cloud credential detected.'
  },
  {
    id: 'SQL_INJECTION_RISK',
    severity: 'HIGH',
    regex: /(query\(`SELECT.*?\$\{.*?\}|execute\(f["']SELECT.*?\{)/,
    message: 'Dynamic string interpolation in SQL query. Use parameterized statements.'
  },
  {
    id: 'UNSAFE_EXEC',
    severity: 'HIGH',
    regex: /(child_process\.exec\(|os\.system\(|subprocess\.Popen\(.*?shell\s*=\s*True)/,
    message: 'Shell command execution detected. Verify input arguments are strictly sanitized.'
  },
  {
    id: 'AGE_GATE_BIAS',
    severity: 'COMPLIANCE',
    regex: /(defaultAge\s*[:=]\s*(18|21)|ageSelect\.value\s*=\s*['"]18['"])/,
    message: 'Biased age selection default found. Age screening must be neutral (COPPA / GDPR-K).'
  },
  {
    id: 'UNGUARDED_TRACKER',
    severity: 'COMPLIANCE',
    regex: /(fbq\('init'|gtag\('config'|tiktokAnalytics)/,
    message: 'Analytics/Ad tracker detected. Must be disabled by default on youth accounts.'
  }
];

const disabledRuleIds = new Set(userConfig.disableRules || []);
const ignoredDirs = new Set([
  'node_modules', '.git', 'dist', 'build', '.venv', '.next',
  ...(userConfig.ignoreDirs || [])
]);
const targetExts = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.html', '.env',
  ...(userConfig.targetExts || [])
]);

const activeRules = DEFAULT_RULES.filter(rule => !disabledRuleIds.has(rule.id));
if (Array.isArray(userConfig.customRules)) {
  userConfig.customRules.forEach(rule => {
    if (rule.id && rule.pattern) {
      activeRules.push({
        id: rule.id,
        severity: rule.severity || 'MEDIUM',
        regex: new RegExp(rule.pattern, rule.flags || ''),
        message: rule.message || 'Custom rule violation.'
      });
    }
  });
}

// Only show banner in plain text mode to keep stdout clean for JSON/SARIF piping
if (flags.format === 'text' && !flags.output) {
  console.log(`\n🛡️  App Security & Compliance Scanner`);
  console.log(`📂 Target: ${targetDir} | Active Rules: ${activeRules.length}\n`);
}

// 5. Scan files and collect findings
const findings = [];

function walk(dir) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (targetExts.has(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const rule of activeRules) {
        if (rule.regex.test(line)) {
          findings.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message,
            file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'), // Force POSIX paths for SARIF/CI
            line: index + 1,
            codeSnippet: line.trim()
          });
        }
      }
    });
  } catch {
    // Skip binary files or unreadable nodes
  }
}

walk(targetDir);

// 6. Formatters

function toSARIF(findingsList, rulesList) {
  // Map internal severities to SARIF levels: 'error' | 'warning' | 'note'
  const severityMap = {
    CRITICAL: 'error',
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'note',
    COMPLIANCE: 'warning'
  };

  return JSON.stringify({
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "app-sec-guard",
            version: "1.0.0",
            informationUri: "https://github.com/your-username/app-sec-guard",
            rules: rulesList.map(r => ({
              id: r.id,
              name: r.id,
              shortDescription: { text: r.message },
              defaultConfiguration: {
                level: severityMap[r.severity] || 'warning'
              }
            }))
          }
        },
        results: findingsList.map(f => ({
          ruleId: f.ruleId,
          level: severityMap[f.severity] || 'warning',
          message: { text: f.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: f.file,
                  uriBaseId: "%SRCROOT%"
                },
                region: {
                  startLine: f.line,
                  startColumn: 1
                }
              }
            }
          ]
        }))
      }
    ],
    null,
    2
  );
}

function toText(findingsList) {
  if (findingsList.length === 0) {
    return '✅ No security or compliance red flags detected.\n';
  }
  let out = '';
  findingsList.forEach(f => {
    out += `[${f.severity}] ${f.file}:${f.line}\n`;
    out += `  Rule:    ${f.ruleId}\n`;
    out += `  Details: ${f.message}\n`;
    out += `  Line:    ${f.codeSnippet.slice(0, 80)}\n\n`;
  });
  out += `⚠️  Scan finished: ${findingsList.length} issue(s) identified.\n`;
  return out;
}

// 7. Render output
let renderedOutput = '';

if (flags.format === 'sarif') {
  renderedOutput = toSARIF(findings, activeRules);
} else if (flags.format === 'json') {
  renderedOutput = JSON.stringify({
    totalIssues: findings.length,
    findings: findings
  }, null, 2);
} else {
  renderedOutput = toText(findings);
}

// Write to file or stdout
if (flags.output) {
  const outputPath = path.resolve(process.cwd(), flags.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderedOutput, 'utf-8');
  if (flags.format === 'text') {
    console.log(`📄 Results written to: ${flags.output}`);
  }
} else {
  process.stdout.write(renderedOutput + (flags.format !== 'text' ? '\n' : ''));
}

// Exit code 1 on failures, 0 if clean
process.exit(findings.length > 0 ? 1 : 0);


Step 2: Test the Formats Locally

Run and verify each mode directly from your terminal:

# 1. Output clean JSON to stdout for piping to jq or an AI CLI
npx app-sec-guard . --format json

# 2. Generate a valid SARIF file locally
npx app-sec-guard . --format sarif --output results.sarif

# 3. Standard terminal output
npx app-sec-guard .


Step 3: Integrate with GitHub Actions Code Scanning

To display security warnings directly in GitHub's Security \rightarrow Code Scanning Alerts dashboard and inline on Pull Request lines, use github/codeql-action/upload-sarif.

Create or update .github/workflows/security-audit.yml:

name: Security & Compliance Scan

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

permissions:
  contents: read
  security-events: write # Required to post to GitHub Security tab

jobs:
  scan:
    name: Run App Security Guard & Upload SARIF
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Scan and Export SARIF
        # Continue on error so upload-sarif still runs if vulnerabilities are detected
        run: npx app-sec-guard . --format sarif --output results.sarif
        continue-on-error: true

      - name: Upload SARIF to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        if: always() # Always upload even if scan found vulnerabilities
        with:
          sarif_file: results.sarif
          category: app-sec-guard


What Developers and AI Agents See

1. For GitHub Users: Any detected issue shows up under their repository's Security tab with exact line references, severity tags, and remediation notes.
2. For AI Agents: Claude Code, Codex, or Cursor can run:
   npx app-sec-guard . --format json
   
   They receive a clean, parseable JSON payload of all issues to automatically patch and re-verify without stripping console colors or parsing Markdown.


simple example but not fully correct, just to integrate.

You are an application security expert. Review the code I’ve attached from two perspectives: first, as a hacker looking for ways to exploit it, and then as a developer working to fix those vulnerabilities.

Focus specifically on the following:

1. Exposed Secrets: API keys, passwords, database connection strings, or other sensitive credentials hardcoded in the source code.
2. SQL Injection: Any database queries constructed directly from user input without proper parameterization.
3. Authentication & Authorization: Pages, endpoints, or URLs accessible without authentication or without verifying the user’s permissions.
4. Login Security: Is there a limit on login attempts (rate limiting)? Are passwords securely hashed using bcrypt or Argon2?
5. Cross-Site Scripting (XSS): Any place where user-provided content is displayed on a page without proper sanitization or output encoding.
6. File Upload Security: Validate allowed file types, maximum file sizes, and storage locations.
7. Sensitive Data Exposure: Confidential information returned to the browser or written to application logs.
8. Vulnerable Dependencies: Outdated libraries or packages with known security vulnerabilities.

For Every Confirmed Vulnerability, Provide:

* File & Line: Exact filename and line number where the vulnerability exists.
* Severity: High / Medium / Low.
* Exploitation: Explain in one simple sentence how an attacker could exploit it.
* Fix: Provide the corrected code, ready to copy and paste.

Report Requirements

1. Sort all confirmed vulnerabilities from highest to lowest severity.
2. Provide clear, actionable fixes with complete replacement code where possible.
3. At the end, include a security audit checklist using ✓ / ✗ to indicate which areas were checked and whether they passed.
4. Clearly distinguish confirmed vulnerabilities from potential risks that require further investigation.
5. Do not invent vulnerabilities or make assumptions about code you haven’t inspected.
6. If you cannot verify something, explicitly state what additional files, configurations, or information you need to confirm it.

Important: Base every finding on actual evidence from the provided code. Do not report speculative vulnerabilities as confirmed security issues.