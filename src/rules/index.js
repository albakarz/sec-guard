import { secretRules } from './secrets.js';
import { injectionRules } from './injection.js';
import { authCryptoRules } from './auth-crypto.js';
import { complianceRules } from './compliance.js';
import { misconfigRules } from './misconfiguration.js';

export const ALL_RULES = [
  ...secretRules,
  ...injectionRules,
  ...authCryptoRules,
  ...complianceRules,
  ...misconfigRules
];

export const SEVERITY_LEVELS = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  COMPLIANCE: 3,
  LOW: 2,
  INFO: 1
};

export function getRuleById(id) {
  return ALL_RULES.find(rule => rule.id === id);
}

export function filterRules(rules, { disabledRuleIds = [], minSeverity = null } = {}) {
  const disabledSet = new Set(disabledRuleIds);
  const minVal = minSeverity ? (SEVERITY_LEVELS[minSeverity.toUpperCase()] || 0) : 0;

  return rules.filter(rule => {
    if (disabledSet.has(rule.id)) return false;
    if (minVal > 0) {
      const ruleVal = SEVERITY_LEVELS[rule.severity.toUpperCase()] || 0;
      if (ruleVal < minVal) return false;
    }
    return true;
  });
}

