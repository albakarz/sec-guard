/**
 * Youth Privacy & Regulatory Compliance Detection Rules (COPPA, GDPR-K, UK AADC)
 */
export const complianceRules = [
  {
    id: 'COPPA_AGE_GATE_BIAS',
    category: 'Child Privacy & Compliance',
    severity: 'COMPLIANCE',
    regex: /(?:defaultAge\s*[:=]\s*(?:18|21)|ageSelect\.value\s*=\s*['"](?:18|21)['"]|initialValue:\s*(?:18|21)\b)/,
    message: 'Biased age selection default detected. Neutral age screening is required under COPPA and GDPR-K.',
    cwe: 'CWE-359',
    remediation: 'Do not nudge users toward adult ages or pre-fill age inputs. Require neutral birthdate input (Day, Month, Year dropdowns with no preselection).'
  },
  {
    id: 'COPPA_UNGUARDED_TRACKER',
    category: 'Child Privacy & Compliance',
    severity: 'COMPLIANCE',
    regex: /(?:fbq\s*\(\s*['"]init['"]|gtag\s*\(\s*['"]config['"]|(?:tiktokAnalytics|ttq\.load|mixpanel\.init)\s*\()/,
    message: 'Third-party tracking or advertising SDK initialized. Must be suppressed or disabled by default on youth accounts.',
    cwe: 'CWE-359',
    remediation: 'Wrap tracking initializations in a minor-check condition to prevent behavioral tracking of users under 13-16.'
  },
  {
    id: 'COPPA_GEOLOCATION_UNCHECKED',
    category: 'Child Privacy & Compliance',
    severity: 'COMPLIANCE',
    regex: /navigator\.geolocation\.(?:getCurrentPosition|watchPosition)\s*\(/,
    message: 'Geolocation requested directly. Precise geolocation collection for minors requires verifiable parental consent.',
    cwe: 'CWE-359',
    remediation: 'Check user age status before requesting GPS coordinates; high-accuracy geolocation must be disabled by default for youth.'
  },
  {
    id: 'COPPA_UNGUARDED_SOCIAL_DM',
    category: 'Child Privacy & Compliance',
    severity: 'COMPLIANCE',
    regex: /(?:enableDirectMessages|allowPublicProfile|openChatRooms)\s*[:=]\s*true/,
    message: 'Open public communications or direct messaging enabled by default without parental safety checks.',
    cwe: 'CWE-359',
    remediation: 'Under the UK Age-Appropriate Design Code, child profiles must default to private, with direct messaging disabled unless parent approved.'
  }
];
