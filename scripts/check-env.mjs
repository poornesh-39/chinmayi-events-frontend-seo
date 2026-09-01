/**
 * Guards against deploying with placeholder config.
 *
 * PUBLIC_SITE_URL feeds every canonical tag, Open Graph URL and sitemap entry,
 * so shipping the placeholder points search engines at a domain that does not
 * exist. Warns locally; fails the build on CI (Netlify sets CI=true).
 */
import { existsSync, readFileSync } from 'node:fs';

const PLACEHOLDERS = [
  'your-new-netlify-site.netlify.app',
  'your-render-backend-url.onrender.com'
];

// Astro loads .env through Vite, so a plain node script has to read it itself.
const fromEnvFile = (key) => {
  if (!existsSync('.env')) return '';
  const line = readFileSync('.env', 'utf8')
    .split('\n')
    .find((entry) => entry.trim().startsWith(`${key}=`));
  return line ? line.slice(line.indexOf('=') + 1).trim() : '';
};

const read = (key) => process.env[key] || fromEnvFile(key);

const siteUrl = read('PUBLIC_SITE_URL');
const apiUrl = read('PUBLIC_API_URL');

const problems = [];

if (!siteUrl) {
  problems.push('PUBLIC_SITE_URL is not set — falling back to the default in src/data/site.js.');
}

for (const [name, value] of [
  ['PUBLIC_SITE_URL', siteUrl],
  ['PUBLIC_API_URL', apiUrl]
]) {
  if (PLACEHOLDERS.some((placeholder) => value.includes(placeholder))) {
    problems.push(`${name} still contains a placeholder value: ${value}`);
  }
}

if (problems.length > 0) {
  const isCI = process.env.CI === 'true';
  const label = isCI ? 'ERROR' : 'WARNING';

  console.log('');
  for (const problem of problems) {
    console.log(`  [${label}] ${problem}`);
  }
  console.log(
    isCI
      ? '  Set the real values in the Netlify environment variables before deploying.\n'
      : '  Fine for local development — set real values before you deploy.\n'
  );

  if (isCI) process.exit(1);
}
