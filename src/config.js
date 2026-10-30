import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_IGNORED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.venv',
  'venv',
  '__pycache__',
  'coverage',
  '.turbo',
  '.cache'
];

export const DEFAULT_TARGET_EXTENSIONS = [
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.mts',
  '.cts',
  '.jsx',
  '.tsx',
  '.py',
  '.json',
  '.html',
  '.htm',
  '.env',
  '.yaml',
  '.yml',
  '.sql'
];

export const DEFAULT_CONFIG_FILENAMES = [
  '.secguardrc.json',
  '.secguardrc',
  'secguard.config.json'
];

/**
 * Locate and parse the user configuration file
 */
export function loadConfig(customConfigPath = null, cwd = process.cwd()) {
  let configPath = null;

  if (customConfigPath) {
    configPath = path.resolve(cwd, customConfigPath);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${customConfigPath}`);
    }
  } else {
    for (const filename of DEFAULT_CONFIG_FILENAMES) {
      const candidate = path.resolve(cwd, filename);
      if (fs.existsSync(candidate)) {
        configPath = candidate;
        break;
      }
    }
  }

  if (!configPath) {
    return {
      configPath: null,
      config: {}
    };
  }

  try {
    const rawContent = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(rawContent);
    return {
      configPath,
      config: parsed
    };
  } catch (err) {
    throw new Error(`Failed to parse configuration file (${configPath}): ${err.message}`);
  }
}

/**
 * Merge user configuration with built-in defaults
 */
export function resolveConfig(userConfig = {}, cliOverrides = {}) {
  const ignoreDirs = new Set([
    ...DEFAULT_IGNORED_DIRS,
    ...(userConfig.ignoreDirs || []),
    ...(cliOverrides.ignoreDirs || [])
  ]);

  const targetExts = new Set([
    ...DEFAULT_TARGET_EXTENSIONS,
    ...(userConfig.targetExts || []),
    ...(cliOverrides.targetExts || [])
  ]);

  const disableRules = new Set([
    ...(userConfig.disableRules || []),
    ...(cliOverrides.disableRules || [])
  ]);

  const customRules = [
    ...(userConfig.customRules || []),
    ...(cliOverrides.customRules || [])
  ];

  return {
    ignoreDirs: Array.from(ignoreDirs),
    targetExts: Array.from(targetExts),
    disableRules: Array.from(disableRules),
    customRules,
    minSeverity: cliOverrides.minSeverity || userConfig.minSeverity || null,
    failOn: cliOverrides.failOn || userConfig.failOn || 'HIGH',
    format: cliOverrides.format || userConfig.format || 'text',
    output: cliOverrides.output || userConfig.output || null
  };
}

