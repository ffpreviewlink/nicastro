/**
 * `npm run deploy`: pubblica il sito su Aruba.
 *
 * Avvia da terminale il workflow GitHub "Pubblica su Aruba (FTP)" (che esegue test, build
 * e caricamento FTP con i segreti salvati su GitHub) e ne segue l'esito. Il workflow
 * pubblica ciò che è su GitHub, quindi prima controlla che il codice locale sia committato
 * e inviato (push): altrimenti pubblicherebbe una versione diversa da quella che hai.
 *
 * Serve la GitHub CLI (`gh`) con login fatto (`gh auth login`).
 */
import { execFileSync, spawnSync } from 'node:child_process';

const WORKFLOW = 'deploy-aruba.yml';
const SITE = 'https://www.studio-nicastro.it/';

const out = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();
const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

try {
  out('gh', ['--version']);
} catch {
  fail('GitHub CLI (gh) non trovata: installala e fai `gh auth login`.');
}

const branch = out('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch !== 'main') fail(`Sei su "${branch}": si pubblica solo da main.`);
if (out('git', ['status', '--porcelain'])) fail('Ci sono modifiche non committate: committa (e fai push) prima di pubblicare.');

out('git', ['fetch', 'origin', 'main']);
const local = out('git', ['rev-parse', 'HEAD']);
const remote = out('git', ['rev-parse', 'origin/main']);
if (local !== remote) fail('main locale e origin/main sono diversi: fai `git push` (o `git pull`) prima di pubblicare.');

console.log(`Pubblico ${local.slice(0, 7)} su ${SITE}`);
out('gh', ['workflow', 'run', WORKFLOW, '--ref', 'main']);

// La run compare dopo un attimo: si cerca quella appena creata per questo commit
let runId = '';
for (let i = 0; i < 15 && !runId; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  runId = out('gh', [
    'run', 'list', '--workflow', WORKFLOW, '--branch', 'main', '--event', 'workflow_dispatch',
    '--limit', '1', '--json', 'databaseId,headSha,status', '--jq',
    `.[] | select(.headSha == "${local}" and .status != "completed") | .databaseId`,
  ]);
}
if (!runId) fail('Workflow avviato ma non riesco a trovarlo: controllalo su GitHub → Actions.');

const watch = spawnSync('gh', ['run', 'watch', runId, '--exit-status'], { stdio: 'inherit' });
if (watch.status !== 0) fail('Pubblicazione fallita: vedi il log qui sopra (o `gh run view ' + runId + ' --log-failed`).');

console.log(`\n✔ Pubblicato: ${SITE}\n  Per PageSpeed usa un URL con ?x=1 per evitare la cache.`);
