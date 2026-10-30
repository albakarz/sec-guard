// Clean compliant code fixture for testing sec-guard

import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import bcrypt from 'bcrypt';

// 1. Secrets loaded safely from environment
const awsKey = process.env.AWS_ACCESS_KEY_ID;
const dbUrl = process.env.DATABASE_URL;

// Comment testing: comments mentioning dangerous functions should NOT trigger false positives
// Note: never call eval() in this codebase
// Warning: avoid query("SELECT * FROM " + input)

// Inline suppression testing: dummy token suppressed with comment
const dummyKey = "AKIAIOSFODNN7CLEANEX"; // sec-guard-ignore: SECRET_AWS_KEY

// 2. Safe parameterized SQL query & Prisma query
async function getUser(db, prisma, userId) {
  await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
}

// 3. Safe process execution without shell interpolation
function pingHost(host) {
  execFile('/sbin/ping', ['-c', '1', host]);
}

// 4. Safe JSON parsing instead of eval
function parseJson(str) {
  return JSON.parse(str);
}

// 5. Cryptographically secure random tokens & bcrypt comparison
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function verifyUser(user, req) {
  return await bcrypt.compare(req.body.password, user.passwordHash);
}

// 6. Secure cookie authentication (HttpOnly, Secure, SameSite)
function setAuthCookie(res, token) {
  res.cookie('session_id', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000
  });
}

// 7. Neutral age screening without biased default
const ageScreeningConfig = {
  requireParentalConsentUnder: 13,
  requireNeutralDateSelection: true
};

// 8. Consent-guarded tracking
function initAnalyticsIfConsented(userConsent, minorStatus) {
  if (userConsent && !minorStatus.isMinor) {
    // Only init trackers when adult and consented
  }
}

// 9. Specific CORS origin
const corsOptions = {
  origin: 'https://app.example.com',
  credentials: true
};

// 10. Safe file upload naming
function uploadHandler(req, file, cb) {
  const safeFilename = crypto.randomUUID() + '.png';
  cb(null, safeFilename);
}
