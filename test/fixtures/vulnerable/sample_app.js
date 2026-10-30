// Intentional vulnerability fixture for testing sec-guard

// 1. Secrets exposure
const awsKey = "AKIAIOSFODNN7EXAMPLE";
const googleKey = "AIzaSyD-x_abcdefghijklmnopqrstuvw1234";
const githubToken = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";
const dbUrl = "postgres://admin:supersecret123@db.example.com:5432/production";
const NEXT_PUBLIC_OPENAI_API_KEY = "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz";

// 2. SQL Injection & ORM unescaped query
function getUser(req, res) {
  const userId = req.query.id;
  db.query(`SELECT * FROM users WHERE id = ${userId}`);
  prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
}

// 3. Command Injection
import child_process from 'child_process';
function runUserScript(req) {
  child_process.exec("ping -c 1 " + req.query.host);
}

// 4. Code Injection (eval) & Deserialization
function parseDynamicExpression(expr) {
  return eval(expr);
}

// 5. Weak Randomness & Insecure Password Check
function generateResetToken() {
  const resetToken = Math.random().toString(36).substring(2);
  return resetToken;
}

function verifyUser(user, req) {
  if (user.password === req.body.password) {
    return true;
  }
}

// 6. Insecure localStorage JWT
function saveAuthToken(jwtToken) {
  localStorage.setItem('token', jwtToken);
}

// 7. COPPA Non-compliance: Biased Age Gate
const defaultAge = 18;

// 8. COPPA Non-compliance: Unguarded Analytics Tracker
fbq('init', '1234567890');

// 9. Security Misconfiguration: Multi-line CORS wildcard with credentials
const corsOptions = {
  origin: "*",
  credentials: true
};

// 10. Disabled TLS verification
const agentOptions = {
  rejectUnauthorized: false
};

// 11. Unvalidated file upload
function uploadHandler(req, file, cb) {
  cb(null, file.originalname);
}
