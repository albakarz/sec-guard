/**
 * Security Misconfiguration Detection Rules
 */
export const misconfigRules = [
  {
    id: 'CORS_WILDCARD_CREDENTIALS',
    category: 'Security Misconfiguration',
    severity: 'HIGH',
    multiline: true,
    regex: /(?:origin\s*:\s*['"]\*['"][\s\S]{0,120}credentials\s*:\s*true|credentials\s*:\s*true[\s\S]{0,120}origin\s*:\s*['"]\*['"]|Access-Control-Allow-Origin['"]?\s*:\s*['"]\*['"][\s\S]{0,120}credentials)/i,
    message: 'CORS configuration pairs wildcard origin (*) with credentials enabled. Vulnerable to credential theft.',
    cwe: 'CWE-942',
    remediation: 'Specify an explicit origin whitelist instead of "*" when credentials are true.'
  },
  {
    id: 'TLS_VERIFICATION_DISABLED',
    category: 'Security Misconfiguration',
    severity: 'HIGH',
    regex: /(?:rejectUnauthorized\s*:\s*false|verify\s*=\s*False|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]0['"])/,
    message: 'TLS/SSL certificate validation is disabled. Vulnerable to Man-In-The-Middle (MITM) attacks.',
    cwe: 'CWE-295',
    remediation: 'Enable TLS certificate verification. For local development, use trusted self-signed certificates instead of disabling verification.'
  },
  {
    id: 'UNVALIDATED_FILE_UPLOAD',
    category: 'Security Misconfiguration',
    severity: 'HIGH',
    regex: /(?:cb\s*\(\s*null\s*,\s*file\.originalname\)|destination\s*:\s*['"]public\/uploads['"]|path\.join\([^)]*file\.originalname\))/i,
    message: 'Direct use of unvalidated file.originalname in upload destination. Vulnerable to arbitrary file overwrite.',
    cwe: 'CWE-434',
    remediation: 'Generate cryptographically random filenames for uploads (e.g. crypto.randomUUID() + safeExtension) and validate MIME types against an allowlist.'
  },
  {
    id: 'PRODUCTION_DEBUG_ENABLED',
    category: 'Security Misconfiguration',
    severity: 'MEDIUM',
    regex: /(?:DEBUG\s*=\s*True|app\.run\([^)]*debug\s*=\s*True)/,
    message: 'Debug mode enabled in application configuration. Exposes interactive debuggers or sensitive stack traces.',
    cwe: 'CWE-489',
    remediation: 'Ensure debug mode is conditionally enabled only in local development via environment variables.'
  },
  {
    id: 'EXPOSED_SOURCE_MAPS',
    category: 'Security Misconfiguration',
    severity: 'LOW',
    regex: /(?:productionSourceMap\s*:\s*true|sourcemap\s*:\s*true)/i,
    message: 'Production source maps enabled. May expose internal code comments and server architecture to clients.',
    cwe: 'CWE-540',
    remediation: 'Disable production source maps or restrict access behind internal VPN/auth.'
  }
];
