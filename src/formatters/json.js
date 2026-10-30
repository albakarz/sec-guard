import { VERSION } from '../version.js';
/**
 * Machine-readable JSON Formatter (Optimized for AI Agents and API consumers)
 */
export function formatJson(scanResult) {
  const payload = {
    scanner: 'sec-guard',
    version: VERSION,
    timestamp: new Date().toISOString(),
    stats: {
      target: scanResult.target,
      filesScanned: scanResult.filesScanned,
      totalLinesScanned: scanResult.totalLinesScanned,
      activeRulesCount: scanResult.activeRulesCount,
      durationMs: scanResult.durationMs,
      totalFindings: scanResult.findings.length
    },
    findings: scanResult.findings.map(f => ({
      ruleId: f.ruleId,
      category: f.category,
      severity: f.severity,
      message: f.message,
      cwe: f.cwe,
      remediation: f.remediation,
      location: {
        file: f.file,
        line: f.line
      },
      codeSnippet: f.codeSnippet
    }))
  };

  return JSON.stringify(payload, null, 2);
}

