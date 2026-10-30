/**
 * Injection Vulnerability Detection Rules (SQLi, Command Injection, Code Injection, Path Traversal, SSRF, XSS, Deserialization)
 */
export const injectionRules = [
  {
    id: 'SQL_INJECTION_RISK',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:query|execute|raw)\s*\(\s*(?:`[^`]*\$\{[^}]+\}[^`]*`|f["'][^"']*\{[^}]+\}[^"']*["'])/i,
    message: 'Dynamic string interpolation or f-string in SQL query. Vulnerable to SQL Injection.',
    cwe: 'CWE-89',
    remediation: 'Use parameterized queries (?, $1) or ORM-bound parameters rather than string concatenation.'
  },
  {
    id: 'SQL_INJECTION_CONCATENATION',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\s+.*?\+\s*[a-zA-Z0-9_.]+/i,
    message: 'Raw SQL query constructed via string concatenation (+).',
    cwe: 'CWE-89',
    remediation: 'Replace string concatenation with parameterized SQL bindings.'
  },
  {
    id: 'ORM_UNSAFE_RAW_QUERY',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:\$queryRawUnsafe|\$executeRawUnsafe)\s*\(/,
    message: 'Prisma unescaped raw query execution detected ($queryRawUnsafe / $executeRawUnsafe).',
    cwe: 'CWE-89',
    remediation: 'Use Prisma\'s parameterized $queryRaw`...` tagged template or Prisma client model queries.'
  },
  {
    id: 'NOSQL_INJECTION_WHERE',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:\$where\s*:\s*['"][^'"]*['"]|\$where\s*:\s*function\s*\()/,
    message: 'MongoDB/Mongoose $where clause detected. Evaluates arbitrary JavaScript in the database engine.',
    cwe: 'CWE-943',
    remediation: 'Avoid $where. Use standard MongoDB query operators ($eq, $in, $gte) or aggregation pipelines.'
  },
  {
    id: 'UNSAFE_EXEC_COMMAND',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:child_process\.(?:exec|execSync)|os\.system|subprocess\.(?:Popen|call|run)\s*\([^)]*shell\s*=\s*True)/,
    message: 'Shell command execution detected. Highly vulnerable to Command Injection if untrusted input is passed.',
    cwe: 'CWE-78',
    remediation: 'Use execFile or spawn with an array of arguments rather than running a raw shell command.'
  },
  {
    id: 'CODE_INJECTION_EVAL',
    category: 'Injection',
    severity: 'CRITICAL',
    regex: /(?:\beval\s*\(|new\s+Function\s*\(|vm\.runIn(?:ThisContext|NewContext)\s*\()/,
    message: 'Dynamic code execution (eval/Function/vm) detected. Vulnerable to arbitrary code execution.',
    cwe: 'CWE-95',
    remediation: 'Avoid dynamic code execution. Parse structured data using JSON.parse() or dedicated domain parsers.'
  },
  {
    id: 'UNSAFE_DESERIALIZATION',
    category: 'Injection',
    severity: 'CRITICAL',
    regex: /(?:pickle\.loads\s*\(|yaml\.load\s*\([^)]*(?:Loader\s*=\s*yaml\.(?:Loader|UnsafeLoader))|serialize-javascript|unserialize\s*\()/, // sec-guard-ignore: UNSAFE_DESERIALIZATION
    message: 'Unsafe deserialization detected. Can lead to Remote Code Execution (RCE).',
    cwe: 'CWE-502',
    remediation: 'Use safe serializers/deserializers (JSON.parse or yaml.safe_load). Never deserialize untrusted binary data.'
  },
  {
    id: 'PATH_TRAVERSAL_RISK',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:fs\.(?:readFile|readFileSync|createReadStream|unlink|writeFile)\s*\([^)]*(?:req\.(?:query|params|body)|request\.(?:args|form)))/i,
    message: 'User-controlled input directly passed to file system operation. Vulnerable to Path Traversal (../).',
    cwe: 'CWE-22',
    remediation: 'Sanitize file paths with path.basename() and verify the resolved path remains inside an allowed base directory.'
  },
  {
    id: 'SSRF_UNVALIDATED_REQUEST',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:fetch|axios(?:\.get|\.post)?|http\.get|requests\.(?:get|post))\s*\([^)]*(?:req\.(?:query|body|params)\.(?:url|target|endpoint|dest))/i,
    message: 'Server-Side Request Forgery (SSRF) risk: Outbound HTTP request with user-supplied URL destination.',
    cwe: 'CWE-918',
    remediation: 'Enforce an explicit whitelist of allowed destination domains and block loopback/internal IP addresses (127.0.0.1, 169.254.169.254, 10.0.0.0/8).'
  },
  {
    id: 'OPEN_REDIRECT_RISK',
    category: 'Injection',
    severity: 'MEDIUM',
    regex: /res\.redirect\s*\(\s*(?:req\.(?:query|params|body)\.(?:url|next|redirect|target|to|dest)|request\.(?:args|form)\.get\(['"](?:next|url)['"]\))/i,
    message: 'Unvalidated open redirect detected using direct user-controlled destination.',
    cwe: 'CWE-601',
    remediation: 'Validate redirect URLs against a whitelist of relative paths or known internal hosts.'
  },
  {
    id: 'XSS_DANGEROUS_HTML',
    category: 'Injection',
    severity: 'HIGH',
    regex: /(?:dangerouslySetInnerHTML\s*=\s*\{\s*__html:|\.innerHTML\s*=|\bv-html\s*=|ng-bind-html\s*=)/,
    message: 'Unescaped raw HTML injection detected. Potential Cross-Site Scripting (XSS).',
    cwe: 'CWE-79',
    remediation: 'Use framework text interpolations (e.g. {text}) or sanitize HTML with DOMPurify before rendering.'
  }
];
