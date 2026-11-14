import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const APP_DIRECTORIES = ['backend', 'frontend'];

/**
 * Runs `npm audit --audit-level=high` in the repo root and in each app that already has a package.json.
 * Apps that are not scaffolded yet are skipped, so the pre-push hook works during phase 1.
 * Exits with code 1 when any audit reports a high or critical advisory.
 */
function main() {
  const directories = [process.cwd()];

  for (const appDirectory of APP_DIRECTORIES) {
    if (existsSync(path.join(process.cwd(), appDirectory, 'package.json'))) {
      directories.push(path.join(process.cwd(), appDirectory));
    }
  }

  let failed = false;

  for (const directory of directories) {
    const result = spawnSync('npm audit --audit-level=high', {
      cwd: directory,
      stdio: 'inherit',
      shell: true,
    });

    if (result.status !== 0) {
      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main();
