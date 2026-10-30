import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  runScan,
  compileCustomRules,
  loadConfig,
  resolveConfig,
  ALL_RULES,
  filterRules,
  formatJson,
  formatSarif,
  formatMarkdown,
  formatText
} from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Rules Suite: ALL_RULES contains valid rules', () => {
  assert.ok(ALL_RULES.length >= 25, `Expected at least 25 security and compliance rules, found ${ALL_RULES.length}`);
  for (const rule of ALL_RULES) {
    assert.ok(rule.id, 'Rule must have an ID');
    assert.ok(rule.severity, `Rule ${rule.id} must have a severity`);
    assert.ok(rule.regex instanceof RegExp, `Rule ${rule.id} must have a regex pattern`);
    assert.ok(rule.message, `Rule ${rule.id} must have a message`);
  }
});

test('Filter Rules: disables specified rules', () => {
  const filtered = filterRules(ALL_RULES, { disabledRuleIds: ['SECRET_AWS_KEY'] });
  assert.ok(!filtered.some(r => r.id === 'SECRET_AWS_KEY'));
});

test('Filter Rules: filters by minimum severity', () => {
  const filtered = filterRules(ALL_RULES, { minSeverity: 'CRITICAL' });
  for (const r of filtered) {
    assert.equal(r.severity, 'CRITICAL');
  }
});

test('Scanner: detects vulnerabilities including new AI-era rules & multi-line CORS', () => {
  const vulnFixture = path.join(__dirname, 'fixtures/vulnerable/sample_app.js');
  const config = resolveConfig({});
  const result = runScan(vulnFixture, config, { cwd: rootDir });

  assert.ok(result.findings.length >= 12, `Expected at least 12 findings, got ${result.findings.length}`);

  const foundRuleIds = new Set(result.findings.map(f => f.ruleId));
  assert.ok(foundRuleIds.has('SECRET_AWS_KEY'), 'Should detect AWS Key');
  assert.ok(foundRuleIds.has('SECRET_GOOGLE_API_KEY'), 'Should detect Google API Key');
  assert.ok(foundRuleIds.has('SECRET_GITHUB_TOKEN'), 'Should detect GitHub Token');
  assert.ok(foundRuleIds.has('SECRET_FRONTEND_ENV_LEAK'), 'Should detect Frontend Env Leak');
  assert.ok(foundRuleIds.has('SQL_INJECTION_RISK'), 'Should detect SQL injection');
  assert.ok(foundRuleIds.has('ORM_UNSAFE_RAW_QUERY'), 'Should detect Prisma raw query');
  assert.ok(foundRuleIds.has('UNSAFE_EXEC_COMMAND'), 'Should detect unsafe exec');
  assert.ok(foundRuleIds.has('CODE_INJECTION_EVAL'), 'Should detect eval');
  assert.ok(foundRuleIds.has('PLAINTEXT_PASSWORD_COMPARISON'), 'Should detect plaintext password comparison');
  assert.ok(foundRuleIds.has('COPPA_AGE_GATE_BIAS'), 'Should detect biased age gate');
  assert.ok(foundRuleIds.has('COPPA_UNGUARDED_TRACKER'), 'Should detect unguarded tracker');
  assert.ok(foundRuleIds.has('CORS_WILDCARD_CREDENTIALS'), 'Should detect multi-line CORS wildcard');
  assert.ok(foundRuleIds.has('UNVALIDATED_FILE_UPLOAD'), 'Should detect unvalidated file upload');
});

test('Scanner: redacts sensitive secrets in snippets by default', () => {
  const vulnFixture = path.join(__dirname, 'fixtures/vulnerable/sample_app.js');
  const result = runScan(vulnFixture, resolveConfig({}), { cwd: rootDir });

  const awsFinding = result.findings.find(f => f.ruleId === 'SECRET_AWS_KEY');
  assert.ok(awsFinding, 'Should have AWS finding');
  assert.ok(awsFinding.codeSnippet.includes('AKIA************'), 'Secret snippet should be redacted');
  assert.ok(!awsFinding.codeSnippet.includes('AKIAIOSFODNN7EXAMPLE'), 'Raw AWS key must not leak'); // sec-guard-ignore: SECRET_AWS_KEY
});

test('Scanner: clean fixture produces 0 findings with comments & inline suppression', () => {
  const cleanFixture = path.join(__dirname, 'fixtures/clean/clean_app.js');
  const config = resolveConfig({});
  const result = runScan(cleanFixture, config, { cwd: rootDir });

  assert.equal(result.findings.length, 0, `Clean fixture must have 0 findings, got: ${JSON.stringify(result.findings)}`);
});

test('Custom Rules: compiles and detects custom patterns', () => {
  const custom = [
    {
      id: 'CUSTOM_TEST_RULE',
      severity: 'HIGH',
      pattern: 'foo_bar_secret_123'
    }
  ];
  const compiled = compileCustomRules(custom);
  assert.equal(compiled.length, 1);
  assert.equal(compiled[0].id, 'CUSTOM_TEST_RULE');
  assert.ok(compiled[0].regex.test('const x = "foo_bar_secret_123";'));
});

test('Formatters: JSON output is valid and structured', () => {
  const vulnFixture = path.join(__dirname, 'fixtures/vulnerable/sample_app.js');
  const result = runScan(vulnFixture, resolveConfig({}), { cwd: rootDir });
  const jsonStr = formatJson(result);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.scanner, 'sec-guard');
  assert.ok(Array.isArray(parsed.findings));
  assert.ok(parsed.stats.totalFindings > 0);
});

test('Formatters: SARIF output conforms to OASIS schema specification', () => {
  const vulnFixture = path.join(__dirname, 'fixtures/vulnerable/sample_app.js');
  const result = runScan(vulnFixture, resolveConfig({}), { cwd: rootDir });
  const sarifStr = formatSarif(result);
  const parsed = JSON.parse(sarifStr);

  assert.equal(parsed.version, '2.1.0');
  assert.ok(parsed.$schema.includes('sarif-schema-2.1.0.json'));
  assert.ok(parsed.runs.length > 0);
  assert.equal(parsed.runs[0].tool.driver.name, 'sec-guard');
  assert.ok(parsed.runs[0].results.length > 0);
  assert.ok(parsed.runs[0].tool.driver.rules.length > 0);
});

test('Formatters: Markdown output includes executive summary and detailed findings', () => {
  const vulnFixture = path.join(__dirname, 'fixtures/vulnerable/sample_app.js');
  const result = runScan(vulnFixture, resolveConfig({}), { cwd: rootDir });
  const md = formatMarkdown(result);

  assert.ok(md.includes('# 🛡️ Security & Compliance Audit Report'));
  assert.ok(md.includes('## 📈 Executive Summary'));
  assert.ok(md.includes('## 🔍 Detailed Findings'));
});

test('Formatters: Text output formats without throwing', () => {
  const vulnFixture = path.join(__dirname, 'fixtures/vulnerable/sample_app.js');
  const result = runScan(vulnFixture, resolveConfig({}), { cwd: rootDir });
  const text = formatText(result, { noColor: true });

  assert.ok(text.includes('SEC-GUARD'));
  assert.ok(text.includes('Scan Summary:'));
  assert.ok(text.includes('Total Issues:'));
});
