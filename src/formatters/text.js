/**
 * Human-friendly Terminal Formatter with ANSI styling
 */

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgMagenta: '\x1b[45m'
};

const SEVERITY_BADGES = {
  CRITICAL: `${COLORS.bgRed}${COLORS.bold} CRITICAL ${COLORS.reset}`,
  HIGH: `${COLORS.red}${COLORS.bold} HIGH ${COLORS.reset}`,
  MEDIUM: `${COLORS.yellow}${COLORS.bold} MEDIUM ${COLORS.reset}`,
  COMPLIANCE: `${COLORS.magenta}${COLORS.bold} COMPLIANCE ${COLORS.reset}`,
  LOW: `${COLORS.blue}${COLORS.bold} LOW ${COLORS.reset}`,
  INFO: `${COLORS.cyan}${COLORS.bold} INFO ${COLORS.reset}`
};

export function formatText(scanResult, { noColor = false } = {}) {
  const { findings, filesScanned, totalLinesScanned, activeRulesCount, durationMs } = scanResult;

  let out = '';

  // Header Banner
  out += `\n${COLORS.bold}🛡️  SEC-GUARD — Application Security & Compliance Audit${COLORS.reset}\n`;
  out += `${COLORS.dim}   Scanned ${filesScanned} file(s) (${totalLinesScanned} lines) across ${activeRulesCount} active rules in ${durationMs}ms${COLORS.reset}\n\n`;

  if (findings.length === 0) {
    out += `${COLORS.green}✅ Clean codebase! No security or compliance red flags detected.${COLORS.reset}\n\n`;
    return out;
  }

  // Group findings by file
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  for (const [file, items] of byFile.entries()) {
    out += `📁 ${COLORS.bold}${COLORS.cyan}${file}${COLORS.reset} ${COLORS.dim}(${items.length} issue${items.length > 1 ? 's' : ''})${COLORS.reset}\n`;

    for (const item of items) {
      const badge = SEVERITY_BADGES[item.severity] || `[${item.severity}]`;
      out += `  ${badge} ${COLORS.bold}${item.ruleId}${COLORS.reset} ${COLORS.dim}(line ${item.line})${COLORS.reset}\n`;
      out += `    ${COLORS.dim}Issue:${COLORS.reset}        ${item.message}\n`;
      if (item.cwe) {
        out += `    ${COLORS.dim}CWE:${COLORS.reset}          ${item.cwe}\n`;
      }
      out += `    ${COLORS.dim}Snippet:${COLORS.reset}      ${COLORS.yellow}${item.codeSnippet}${COLORS.reset}\n`;
      if (item.remediation) {
        out += `    ${COLORS.dim}Remediation:${COLORS.reset}  ${COLORS.green}${item.remediation}${COLORS.reset}\n`;
      }
      out += '\n';
    }
  }

  // Summary counts
  const counts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    COMPLIANCE: 0,
    LOW: 0,
    INFO: 0
  };

  for (const f of findings) {
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  }

  out += `${COLORS.bold}📊 Scan Summary:${COLORS.reset}\n`;
  if (counts.CRITICAL) out += `  • Critical:   ${COLORS.red}${counts.CRITICAL}${COLORS.reset}\n`;
  if (counts.HIGH) out += `  • High:       ${COLORS.red}${counts.HIGH}${COLORS.reset}\n`;
  if (counts.MEDIUM) out += `  • Medium:     ${COLORS.yellow}${counts.MEDIUM}${COLORS.reset}\n`;
  if (counts.COMPLIANCE) out += `  • Compliance: ${COLORS.magenta}${counts.COMPLIANCE}${COLORS.reset}\n`;
  if (counts.LOW) out += `  • Low:        ${COLORS.blue}${counts.LOW}${COLORS.reset}\n`;
  if (counts.INFO) out += `  • Info:       ${COLORS.cyan}${counts.INFO}${COLORS.reset}\n`;
  out += `  ${COLORS.bold}Total Issues: ${findings.length}${COLORS.reset}\n\n`;

  if (noColor) {
    // Strip ANSI codes
    return out.replace(/\x1b\[[0-9;]*m/g, '');
  }

  return out;
}

