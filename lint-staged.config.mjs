import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Returns an ESLint --fix command for one app.
 * Returns no commands when that app is not installed yet, so a root-only commit still passes.
 * @param {string} appDir
 * @returns {(filenames: string[]) => string[]}
 */
function eslintFix(appDir) {
  return (filenames) => {
    const configPath = path.join(appDir, 'eslint.config.mjs');
    const binaryPath = path.join(appDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (!existsSync(configPath) || !existsSync(binaryPath)) {
      return [];
    }

    const files = filenames.map((filename) => JSON.stringify(filename)).join(' ');
    return [`node ${JSON.stringify(binaryPath)} --fix ${files}`];
  };
}

export default {
  '*': 'secretlint',
  '*.{js,mjs,cjs,ts,tsx,json,md,mdc,yml,yaml,css,html}': 'prettier --write --ignore-unknown',
  'backend/**/*.{js,mjs,cjs,ts}': eslintFix('backend'),
  'frontend/**/*.{js,mjs,cjs,ts,tsx}': eslintFix('frontend'),
};
