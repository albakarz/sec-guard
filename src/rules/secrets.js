/**
 * Secret and Credential Exposure Detection Rules
 */
export const secretRules = [
  {
    id: 'SECRET_AWS_KEY',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    message: 'Hardcoded AWS Access Key ID detected. Rotate key immediately and load from environment variables.',
    cwe: 'CWE-798',
    remediation: 'Remove AWS credentials from source code and load via AWS_ACCESS_KEY_ID environment variable or IAM role.'
  },
  {
    id: 'SECRET_GOOGLE_API_KEY',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /AIza[0-9A-Za-z_-]{30,45}/,
    message: 'Hardcoded Google / Firebase API Key detected in source code.',
    cwe: 'CWE-798',
    remediation: 'Store Google API keys in server-side environment variables (.env) or apply strict API key restrictions in Google Cloud Console.'
  },
  {
    id: 'SECRET_GITHUB_TOKEN',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /gh[pousr]_[0-9a-zA-Z]{36,255}/,
    message: 'Hardcoded GitHub Personal Access Token or OAuth token detected.',
    cwe: 'CWE-798',
    remediation: 'Revoke and rotate the GitHub token immediately. Use GitHub Secrets or environment variables.'
  },
  {
    id: 'SECRET_OPENAI_KEY',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /sk-(?:proj-)?[a-zA-Z0-9_\-]{32,}/,
    message: 'Hardcoded OpenAI API key detected in source code.',
    cwe: 'CWE-798',
    remediation: 'Revoke key in OpenAI dashboard and use process.env.OPENAI_API_KEY.'
  },
  {
    id: 'SECRET_ANTHROPIC_KEY',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /sk-ant-[a-zA-Z0-9_\-]{32,}/,
    message: 'Hardcoded Anthropic API key detected in source code.',
    cwe: 'CWE-798',
    remediation: 'Revoke key in Anthropic console and use process.env.ANTHROPIC_API_KEY.'
  },
  {
    id: 'SECRET_STRIPE_KEY',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /sk_(?:live|test)_[0-9a-zA-Z]{24,}/,
    message: 'Hardcoded Stripe API secret key detected in source code.',
    cwe: 'CWE-798',
    remediation: 'Keep secret keys strictly server-side in environment variables. Never expose in code.'
  },
  {
    id: 'SECRET_SLACK_TOKEN',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /(?:xox[baprs]-[0-9a-zA-Z]{10,}|https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]+\/B[0-9A-Z]+\/[0-9a-zA-Z]+)/,
    message: 'Hardcoded Slack token or webhook URL detected.',
    cwe: 'CWE-798',
    remediation: 'Store webhook URLs and bot tokens in environment variables.'
  },
  {
    id: 'SECRET_PRIVATE_KEY',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    message: 'Plaintext private cryptographic key detected in source code.',
    cwe: 'CWE-312',
    remediation: 'Move private keys to a secure vault or secret manager (e.g. HashiCorp Vault, AWS Secrets Manager).'
  },
  {
    id: 'SECRET_DATABASE_URL',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\s'"]+:[^@\s'"]+@[a-zA-Z0-9.\-_]+/,
    message: 'Database connection string containing plaintext credentials detected.',
    cwe: 'CWE-798',
    remediation: 'Use DATABASE_URL environment variable and exclude connection strings with passwords from code.'
  },
  {
    id: 'SECRET_JWT_HARDCODED',
    category: 'Secrets Exposure',
    severity: 'HIGH',
    regex: /jwt\.sign\(.*,\s*['"][a-zA-Z0-9_\-]{8,}['"]\s*[,)]/,
    message: 'Hardcoded JWT signing secret detected directly in jwt.sign call.',
    cwe: 'CWE-798',
    remediation: 'Load JWT secret from process.env.JWT_SECRET.'
  },
  {
    id: 'SECRET_GENERIC_PLAINTEXT_CREDENTIAL',
    category: 'Secrets Exposure',
    severity: 'HIGH',
    regex: /(?:password|passwd|api_secret|client_secret)\s*[:=]\s*['"][^'"]{6,}['"]/i,
    message: 'Potential hardcoded plaintext credential or secret detected.',
    cwe: 'CWE-798',
    remediation: 'Store sensitive credentials in environment configuration or secret manager.'
  },
  {
    id: 'SECRET_FRONTEND_ENV_LEAK',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /(?:NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_)[A-Z0-9_]*(?:SECRET|PRIVATE|API_KEY|TOKEN|PASSWORD)\s*[:=]\s*['"][^'"]{6,}['"]/i,
    message: 'Secret credential assigned to a frontend-exposed environment variable prefix. This will be bundled into client-side JS!',
    cwe: 'CWE-526',
    remediation: 'Frontend prefixes (NEXT_PUBLIC_, VITE_, etc.) expose variables to all users in the browser. Store secrets only in server-side variables.'
  },
  {
    id: 'SECRET_SUPABASE_SERVICE_ROLE',
    category: 'Secrets Exposure',
    severity: 'CRITICAL',
    regex: /(?:supabase.*?(?:service_role|serviceRole).*?['"]ey[A-Za-z0-9_\-]{20,}|createClient\(.*?['"][^'"]+['"]\s*,\s*['"]ey[A-Za-z0-9_\-]{20,service_role)/i,
    message: 'Supabase service_role key exposed. Service role bypasses all Row Level Security (RLS) policies!',
    cwe: 'CWE-798',
    remediation: 'Never use service_role keys on client applications. Use SUPABASE_SERVICE_ROLE_KEY strictly in server-side protected edge functions.'
  }
];
