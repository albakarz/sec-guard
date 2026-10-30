/**
 * OASIS Static Analysis Results Interchange Format (SARIF) v2.1.0
 * Fully compliant with GitHub Code Scanning (upload-sarif action)
 */

const SARIF_LEVEL_MAP = {
  CRITICAL: 'error',
  HIGH: 'error',
  MEDIUM: 'warning',
  COMPLIANCE: 'warning',
  LOW: 'note',
  INFO: 'note'
};

export function formatSarif(scanResult) {
  const { findings, activeRules } = scanResult;

  // Build unique rules dictionary
  const ruleMap = new Map();
  for (const r of activeRules) {
    if (!ruleMap.has(r.id)) {
      ruleMap.set(r.id, {
        id: r.id,
        name: r.id,
        shortDescription: {
          text: r.message
        },
        fullDescription: {
          text: `${r.message} Category: ${r.category || 'Security'}. Remediation: ${r.remediation || 'Inspect code.'}`
        },
        help: {
          text: r.remediation || r.message,
          markdown: `### ${r.id}\n\n**Issue:** ${r.message}\n\n**CWE:** ${r.cwe || 'N/A'}\n\n**Remediation:** ${r.remediation || 'Review and remediate.'}`
        },
        defaultConfiguration: {
          level: SARIF_LEVEL_MAP[r.severity] || 'warning'
        },
        properties: {
          category: r.category,
          cwe: r.cwe,
          precision: 'high'
        }
      });
    }
  }

  const results = findings.map(f => {
    return {
      ruleId: f.ruleId,
      level: SARIF_LEVEL_MAP[f.severity] || 'warning',
      message: {
        text: `${f.message} (Remediation: ${f.remediation || 'Inspect finding'})`
      },
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: f.file,
              uriBaseId: '%SRCROOT%'
            },
            region: {
              startLine: f.line,
              startColumn: 1,
              snippet: {
                text: f.codeSnippet
              }
            }
          }
        }
      ]
    };
  });

  const sarifLog = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'sec-guard',
            version: '1.0.1',
            informationUri: 'https://github.com/Albakarz/sec-guard',
            rules: Array.from(ruleMap.values())
          }
        },
        results
      }
    ]
  };

  return JSON.stringify(sarifLog, null, 2);
}

