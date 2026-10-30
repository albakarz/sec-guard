import fs from 'node:fs';
import path from 'node:path';
import { ALL_RULES, filterRules } from './rules/index.js';

export const EXCLUDED_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'composer.lock',
  'Cargo.lock',
  'poetry.lock',
  'Gemfile.lock',
  '.secguardrc.json',
  '.secguardrc'
]);

/**
 * Mask sensitive secrets in snippets to avoid leaking credentials into logs and CI
 */
export function redactSnippet(snippet, rule) {
  if (rule.category !== 'Secrets Exposure') return snippet;

  return snippet.replace(rule.regex, match => {
    if (match.length <= 8) return '********';
    const prefix = match.slice(0, 4);
    const suffix = match.slice(-4);
    return `${prefix}************${suffix}`;
  });
}

/**
 * Check if a line is a pure comment
 */
export function isCommentLine(trimmedLine) {
  return (
    trimmedLine.startsWith('//') ||
    trimmedLine.startsWith('#') ||
    trimmedLine.startsWith('/*') ||
    trimmedLine.startsWith('*') ||
    trimmedLine.startsWith('<!--') ||
    trimmedLine.startsWith('--') // SQL comments
  );
}

/**
 * Check if a line has inline suppression (sec-guard-ignore)
 */
export function isSuppressed(line, prevLine, ruleId) {
  const current = line || '';
  const prev = prevLine || '';

  // 1. Current line: sec-guard-ignore [: RULE_ID]
  const currentMatch = current.match(/sec-guard-ignore(?:[:\s]+([A-Z0-9_]+))?/);
  if (currentMatch) {
    const targetRule = currentMatch[1];
    if (!targetRule || targetRule === ruleId) return true;
  }

  // 2. Previous line: sec-guard-ignore-next-line [: RULE_ID]
  const prevMatch = prev.match(/sec-guard-ignore-next-line(?:[:\s]+([A-Z0-9_]+))?/);
  if (prevMatch) {
    const targetRule = prevMatch[1];
    if (!targetRule || targetRule === ruleId) return true;
  }

  return false;
}

/**
 * Parse .gitignore if it exists in root directory
 */
export function parseGitignore(cwd) {
  const gitignorePath = path.join(cwd, '.gitignore');
  if (!fs.existsSync(gitignorePath)) return [];

  try {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.replace(/\/$/, '')); // trim trailing slash
  } catch {
    return [];
  }
}

/**
 * Compile custom regex rules safely
 */
export function compileCustomRules(customRules = []) {
  const compiled = [];

  for (const [idx, rule] of customRules.entries()) {
    if (!rule.id || !rule.pattern) {
      console.warn(`[WARN] Skipping custom rule at index ${idx}: Missing "id" or "pattern".`);
      continue;
    }
    try {
      compiled.push({
        id: rule.id,
        category: rule.category || 'Custom Rules',
        severity: (rule.severity || 'MEDIUM').toUpperCase(),
        regex: new RegExp(rule.pattern, rule.flags || ''),
        message: rule.message || 'Custom rule violation detected.',
        cwe: rule.cwe || 'CWE-Other',
        remediation: rule.remediation || 'Inspect code and remediate pattern.',
        multiline: Boolean(rule.multiline)
      });
    } catch (err) {
      console.warn(`[WARN] Invalid regex in custom rule "${rule.id}": ${err.message}`);
    }
  }

  return compiled;
}

/**
 * Scan a single file or directory
 */
export function runScan(targetPath, resolvedConfig, { cwd = process.cwd() } = {}) {
  const startTime = Date.now();
  const absoluteTarget = path.resolve(cwd, targetPath);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  // Active built-in rules
  const activeBuiltin = filterRules(ALL_RULES, {
    disabledRuleIds: resolvedConfig.disableRules,
    minSeverity: resolvedConfig.minSeverity
  });

  // Custom rules
  const compiledCustom = compileCustomRules(resolvedConfig.customRules);
  const activeCustom = filterRules(compiledCustom, {
    disabledRuleIds: resolvedConfig.disableRules,
    minSeverity: resolvedConfig.minSeverity
  });

  const activeRules = [...activeBuiltin, ...activeCustom];

  // Load .gitignore patterns
  const gitignorePatterns = parseGitignore(cwd);
  const ignoredDirsSet = new Set([
    ...resolvedConfig.ignoreDirs,
    ...gitignorePatterns
  ]);

  const targetExtsSet = new Set(resolvedConfig.targetExts);
  const noRedact = Boolean(resolvedConfig.noRedact);

  const findings = [];
  const findingKeys = new Set();
  let filesScanned = 0;
  let totalLinesScanned = 0;

  function addFinding(rule, relFile, lineNum, rawSnippet) {
    const key = `${relFile}:${lineNum}:${rule.id}`;
    if (findingKeys.has(key)) return;
    findingKeys.add(key);

    const displaySnippet = noRedact
      ? rawSnippet
      : redactSnippet(rawSnippet, rule);

    findings.push({
      ruleId: rule.id,
      category: rule.category,
      severity: rule.severity,
      message: rule.message,
      cwe: rule.cwe,
      remediation: rule.remediation,
      file: relFile || '.',
      line: lineNum,
      codeSnippet: displaySnippet.slice(0, 160)
    });
  }

  function scanFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      // Skip large files > 5MB
      if (stats.size > 5 * 1024 * 1024) return;

      const baseName = path.basename(filePath);
      if (EXCLUDED_FILES.has(baseName) || baseName.endsWith('.min.js') || baseName.endsWith('.map')) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      totalLinesScanned += lines.length;
      filesScanned++;

      const relFile = path.relative(cwd, filePath).replace(/\\/g, '/');

      // 1. Line-by-line inspection
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const isComment = isCommentLine(trimmed);
        const prevLine = index > 0 ? lines[index - 1] : null;

        for (const rule of activeRules) {
          if (rule.multiline) continue; // Handled in multi-line pass

          // If it's a comment line, only run Secrets Exposure rules
          if (isComment && rule.category !== 'Secrets Exposure') {
            continue;
          }

          if (isSuppressed(line, prevLine, rule.id)) {
            continue;
          }

          if (rule.regex.test(line)) {
            addFinding(rule, relFile, index + 1, trimmed);
          }
        }
      });

      // 2. Multi-line inspection for rules with multiline: true
      const multilineRules = activeRules.filter(r => r.multiline);
      for (const rule of multilineRules) {
        // Ensure global flag for iterating all occurrences
        const globalRegex = new RegExp(rule.regex.source, rule.regex.flags.includes('g') ? rule.regex.flags : rule.regex.flags + 'g');
        let match;
        while ((match = globalRegex.exec(content)) !== null) {
          const matchIndex = match.index;
          const lineNum = content.slice(0, matchIndex).split('\n').length;
          const matchedLine = lines[lineNum - 1] || '';
          const prevLine = lineNum > 1 ? lines[lineNum - 2] : null;

          if (isSuppressed(matchedLine, prevLine, rule.id)) {
            continue;
          }

          addFinding(rule, relFile, lineNum, match[0].split('\n')[0].trim());
        }
      }
    } catch {
      // Ignore unreadable binary files or broken symlinks
    }
  }

  function isIgnored(dirName, fullPath) {
    if (ignoredDirsSet.has(dirName)) return true;
    const rel = path.relative(cwd, fullPath).replace(/\\/g, '/');
    for (const ignored of ignoredDirsSet) {
      if (rel === ignored || rel.startsWith(ignored + '/') || rel.endsWith('/' + ignored)) {
        return true;
      }
    }
    return false;
  }

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (isIgnored(entry.name, fullPath)) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (targetExtsSet.has(ext) || entry.name.startsWith('.env')) {
          scanFile(fullPath);
        }
      }
    }
  }

  const stat = fs.statSync(absoluteTarget);
  if (stat.isDirectory()) {
    // Check repository posture: check unignored .env files
    const envCandidate = path.join(absoluteTarget, '.env');
    if (fs.existsSync(envCandidate)) {
      const isEnvIgnored = gitignorePatterns.some(pat => pat === '.env' || pat === '*.env' || pat.includes('.env'));
      if (!isEnvIgnored) {
        findings.push({
          ruleId: 'EXPOSED_ENV_GITIGNORE',
          category: 'Secrets Exposure',
          severity: 'CRITICAL',
          message: '.env file exists in repository root but is not listed in .gitignore! Secrets will be committed to git.',
          cwe: 'CWE-526',
          remediation: 'Add .env and .env.local to your .gitignore immediately.',
          file: '.env',
          line: 1,
          codeSnippet: '.env exists without .gitignore protection'
        });
      }
    }

    walk(absoluteTarget);
  } else if (stat.isFile()) {
    scanFile(absoluteTarget);
  }

  const durationMs = Date.now() - startTime;

  return {
    target: targetPath,
    filesScanned,
    totalLinesScanned,
    activeRulesCount: activeRules.length,
    durationMs,
    findings,
    activeRules
  };
}
