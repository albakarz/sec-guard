import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { loadConfig, resolveConfig } from './config.js';
import { runScan } from './scanner.js';
import { formatText } from './formatters/text.js';
import { formatJson } from './formatters/json.js';
import { formatSarif } from './formatters/sarif.js';
import { formatMarkdown } from './formatters/markdown.js';
import { initConfig, initSkill, initAgent, initGithubWorkflow, initGitHook } from './scaffold.js';
import { ALL_RULES, SEVERITY_LEVELS } from './rules/index.js';

const VERSION = '1.0.0';

export function parseArgs(rawArgs) {
  const flags = {
    format: 'text',
    output: null,
    config: null,
    minSeverity: null,
    failOn: 'HIGH',
    noColor: false,
    noRedact: false,
    staged: false
  };
  const actions = {
    help: false,
    version: false,
    listRules: false,
    initConfig: false,
    initSkill: false,
    initAgent: false,
    initGithub: false,
    initHook: false
  };
  const positionalArgs = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg === '--help' || arg === '-h') {
      actions.help = true;
    } else if (arg === '--version' || arg === '-v') {
      actions.version = true;
    } else if (arg === '--list-rules') {
      actions.listRules = true;
    } else if (arg === '--init-config') {
      actions.initConfig = true;
    } else if (arg === '--init-skill') {
      actions.initSkill = true;
    } else if (arg === '--init-agent') {
      actions.initAgent = true;
    } else if (arg === '--init-github') {
      actions.initGithub = true;
    } else if (arg === '--init-hook') {
      actions.initHook = true;
    } else if (arg === '--no-color') {
      flags.noColor = true;
    } else if (arg === '--no-redact') {
      flags.noRedact = true;
    } else if (arg === '--staged') {
      flags.staged = true;
    } else if (arg === '--format' || arg === '-f') {
      flags.format = (rawArgs[++i] || 'text').toLowerCase();
    } else if (arg === '--output' || arg === '-o') {
      flags.output = rawArgs[++i];
    } else if (arg === '--config' || arg === '-c') {
      flags.config = rawArgs[++i];
    } else if (arg === '--min-severity' || arg === '-s') {
      flags.minSeverity = (rawArgs[++i] || '').toUpperCase();
    } else if (arg === '--fail-on') {
      flags.failOn = (rawArgs[++i] || 'HIGH').toUpperCase();
    } else if (arg.startsWith('--')) {
      flags[arg.slice(2)] = true;
    } else {
      positionalArgs.push(arg);
    }
  }

  return { flags, actions, positionalArgs };
}

export function printHelp() {
  console.log(`
🛡️  sec-guard v${VERSION}
Autonomous security, privacy, and compliance scanner for modern apps and AI coding agents.

USAGE:
  sec-guard [target-directory-or-file] [options]
  npx sec-guard [options]

OPTIONS:
  -f, --format <type>         Output format: text, json, sarif, markdown (default: text)
  -o, --output <file>         Write scan results to a specified file
  -c, --config <file>         Custom configuration file path (.secguardrc.json)
  -s, --min-severity <level>  Filter minimum severity: CRITICAL, HIGH, MEDIUM, COMPLIANCE, LOW, INFO
      --fail-on <level>       Exit with code 1 if issues >= severity exist (default: HIGH)
      --staged                Scan only git staged files (fast pre-commit check)
      --no-redact             Do not mask detected secrets in output snippets
      --no-color              Suppress ANSI color codes in terminal output
      --list-rules            List all available built-in security & compliance rules
  -v, --version               Display current version
  -h, --help                  Show this help menu

SCAFFOLDING & AI INTEGRATION:
  --init-config               Generate a starter .secguardrc.json configuration file
  --init-skill                Install AI agent skills (.agents/skills and .claude/skills)
  --init-agent                Install AI instructions across Cursor, Windsurf, Claude Code
  --init-github               Create GitHub Actions workflow for automated SARIF scanning
  --init-hook                 Install .git/hooks/pre-commit blocker script

INLINE SUPPRESSION:
  Use \`// sec-guard-ignore\` or \`// sec-guard-ignore: RULE_ID\` on the line,
  or \`// sec-guard-ignore-next-line\` on the preceding line.

EXAMPLES:
  # Scan current directory and print human-friendly report
  npx sec-guard .

  # Fast pre-commit scan on staged files
  npx sec-guard --staged

  # Machine-readable JSON output for AI agent pipelines
  npx sec-guard . --format json

  # Export SARIF for GitHub Code Scanning
  npx sec-guard . --format sarif --output results.sarif
`);
}

export function printRulesList() {
  console.log(`\n🛡️  sec-guard Built-in Rules Catalog (${ALL_RULES.length} rules):\n`);
  console.log(
    'Rule ID'.padEnd(32) +
    'Severity'.padEnd(14) +
    'Category'.padEnd(26) +
    'CWE'
  );
  console.log('-'.repeat(80));

  for (const r of ALL_RULES) {
    console.log(
      r.id.padEnd(32) +
      r.severity.padEnd(14) +
      (r.category || 'Security').padEnd(26) +
      (r.cwe || 'N/A')
    );
  }
  console.log('');
}

export function getStagedFiles(cwd = process.cwd()) {
  try {
    const stdout = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return stdout
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function runCli(argv = process.argv.slice(2)) {
  const { flags, actions, positionalArgs } = parseArgs(argv);

  if (actions.version) {
    console.log(`sec-guard v${VERSION}`);
    return 0;
  }

  if (actions.help) {
    printHelp();
    return 0;
  }

  if (actions.listRules) {
    printRulesList();
    return 0;
  }

  // Scaffolding commands
  if (actions.initConfig) {
    initConfig(process.cwd());
    return 0;
  }
  if (actions.initSkill) {
    initSkill(process.cwd());
    return 0;
  }
  if (actions.initAgent) {
    initAgent(process.cwd());
    return 0;
  }
  if (actions.initGithub) {
    initGithubWorkflow(process.cwd());
    return 0;
  }
  if (actions.initHook) {
    initGitHook(process.cwd());
    return 0;
  }

  // Load configuration
  let loadedConfig = {};
  try {
    const configResult = loadConfig(flags.config);
    loadedConfig = configResult.config;
  } catch (err) {
    console.error(`❌ Configuration Error: ${err.message}`);
    return 1;
  }

  const resolvedConfig = resolveConfig(loadedConfig, flags);

  // If --staged mode is requested
  let targets = [];
  if (flags.staged) {
    const stagedFiles = getStagedFiles(process.cwd());
    if (stagedFiles.length === 0) {
      if (resolvedConfig.format === 'text') {
        console.log('ℹ️ No staged files found in git to scan.');
      }
      return 0;
    }
    targets = stagedFiles;
  } else {
    targets = [positionalArgs[0] || process.cwd()];
  }

  // Execute scans across targets
  let totalFindings = [];
  let totalFilesScanned = 0;
  let totalLines = 0;
  let totalDuration = 0;
  let activeRules = [];

  for (const target of targets) {
    try {
      const res = runScan(target, resolvedConfig);
      totalFindings.push(...res.findings);
      totalFilesScanned += res.filesScanned;
      totalLines += res.totalLinesScanned;
      totalDuration += res.durationMs;
      activeRules = res.activeRules;
    } catch (err) {
      console.error(`❌ Scan Error on "${target}": ${err.message}`);
      return 1;
    }
  }

  const aggregatedResult = {
    target: flags.staged ? 'git:staged' : (positionalArgs[0] || process.cwd()),
    filesScanned: totalFilesScanned,
    totalLinesScanned: totalLines,
    activeRulesCount: activeRules.length,
    durationMs: totalDuration,
    findings: totalFindings,
    activeRules
  };

  // Render output
  let rendered = '';
  switch (resolvedConfig.format) {
    case 'json':
      rendered = formatJson(aggregatedResult);
      break;
    case 'sarif':
      rendered = formatSarif(aggregatedResult);
      break;
    case 'markdown':
    case 'md':
      rendered = formatMarkdown(aggregatedResult);
      break;
    case 'text':
    default:
      rendered = formatText(aggregatedResult, { noColor: flags.noColor });
      break;
  }

  // Write output
  if (resolvedConfig.output) {
    const outPath = path.resolve(process.cwd(), resolvedConfig.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, rendered, 'utf-8');
    if (resolvedConfig.format === 'text') {
      console.log(`📄 Results saved to: ${resolvedConfig.output}`);
    }
  } else {
    process.stdout.write(rendered + (resolvedConfig.format !== 'text' ? '\n' : ''));
  }

  // Determine exit code
  const failThreshold = SEVERITY_LEVELS[resolvedConfig.failOn.toUpperCase()] || SEVERITY_LEVELS.HIGH;
  const hasFailures = aggregatedResult.findings.some(f => {
    const sevVal = SEVERITY_LEVELS[f.severity.toUpperCase()] || 0;
    return sevVal >= failThreshold;
  });

  return hasFailures ? 1 : 0;
}
