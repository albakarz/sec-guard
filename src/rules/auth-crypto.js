/**
 * Authentication, Session and Cryptography Vulnerability Detection Rules
 */
export const authCryptoRules = [
  {
    id: 'PLAINTEXT_PASSWORD_COMPARISON',
    category: 'Authentication',
    severity: 'CRITICAL',
    regex: /(?:user\.password|storedPassword|savedHash|account\.password)\s*===?\s*(?:req\.body\.password|inputPassword|password|plainPassword)/i,
    message: 'Plaintext password comparison detected. Passwords must be hashed using bcrypt or Argon2 with constant-time comparison.',
    cwe: 'CWE-256',
    remediation: 'Use bcrypt.compare() or argon2.verify() to check passwords securely against their hashes.'
  },
  {
    id: 'WEAK_BCRYPT_ROUNDS',
    category: 'Cryptography',
    severity: 'MEDIUM',
    regex: /bcrypt\.(?:hash|genSalt)\s*\([^,]+,\s*([1-9])\s*[,)]/,
    message: 'Bcrypt salt rounds set too low (< 10). Low work factors make offline brute-forcing easy.',
    cwe: 'CWE-916',
    remediation: 'Configure bcrypt salt rounds to at least 10 (recommended: 12 or higher in modern production environments).'
  },
  {
    id: 'WEAK_HASHING_ALGORITHM',
    category: 'Cryptography',
    severity: 'MEDIUM',
    regex: /(?:crypto\.createHash\s*\(\s*['"](?:md5|sha1)['"]\)|hashlib\.(?:md5|sha1)\s*\()/,
    message: 'Cryptographically broken hash algorithm (MD5/SHA-1) detected.',
    cwe: 'CWE-327',
    remediation: 'Use SHA-256 / SHA-3 for digests, or Argon2id / bcrypt / PBKDF2 for password hashing.'
  },
  {
    id: 'WEAK_PSEUDORANDOM_SECURITY',
    category: 'Cryptography',
    severity: 'HIGH',
    regex: /(?:token|secret|session|nonce|salt|csrf|resetToken)\s*[:=].*?Math\.random\(\)/i,
    message: 'Math.random() used in security-sensitive context. Pseudo-random generator is predictable.',
    cwe: 'CWE-338',
    remediation: 'Use crypto.randomBytes() or crypto.getRandomValues() for security tokens and session identifiers.'
  },
  {
    id: 'INSECURE_TOKEN_LOCALSTORAGE',
    category: 'Authentication',
    severity: 'HIGH',
    regex: /localStorage\.setItem\s*\(\s*['"](?:token|jwt|auth|access_token|bearer)['"]/i,
    message: 'Authentication token stored in localStorage, making it accessible to XSS attacks.',
    cwe: 'CWE-922',
    remediation: 'Store session tokens in HttpOnly, Secure, SameSite cookies.'
  },
  {
    id: 'JWT_NONE_ALGORITHM_ALLOWED',
    category: 'Authentication',
    severity: 'CRITICAL',
    regex: /(?:algorithms\s*:\s*\[[^\]]*['"]none['"][^\]]*\]|jwt\.verify\([^)]*algorithm\s*:\s*['"]none['"])/i,
    message: 'JWT "none" algorithm allowed, completely bypassing signature verification.',
    cwe: 'CWE-347',
    remediation: 'Enforce strong algorithms like RS256, ES256, or HS256 and reject "none".'
  },
  {
    id: 'JWT_UNVERIFIED_DECODE',
    category: 'Authentication',
    severity: 'MEDIUM',
    regex: /jwt\.decode\s*\([^)]+\)/,
    message: 'jwt.decode() does not verify token authenticity or expiration. Ensure jwt.verify() is used for access control.',
    cwe: 'CWE-345',
    remediation: 'Always verify tokens using jwt.verify(token, secret, { algorithms: [...] }) before trusting claims.'
  },
  {
    id: 'INSECURE_COOKIE_ATTRIBUTES',
    category: 'Session Security',
    severity: 'MEDIUM',
    regex: /res\.cookie\s*\([^)]*\{\s*(?!.*httpOnly:\s*true).*\}\s*\)/,
    message: 'Cookie set without httpOnly: true flag, allowing client-side JavaScript access.',
    cwe: 'CWE-1004',
    remediation: 'Always configure cookies with { httpOnly: true, secure: true, sameSite: "lax" | "strict" }.'
  }
];
