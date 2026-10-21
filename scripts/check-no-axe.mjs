#!/usr/bin/env node
/**
 * Fails if axe-core is resolvable in this project's dependency tree.
 *
 * axe-core is banned in this repository (see CLAUDE.md), directly and
 * transitively. package.json carries an override that redirects any axe-core
 * request to an empty package, but an override is easy to drop by accident
 * during a dependency bump -- this check makes that a build failure instead of
 * a silent regression. The override also only covers the package literally
 * named `axe-core`, so a new direct dependency on `@axe-core/playwright`,
 * `jest-axe` or similar would not be caught by it at all.
 *
 * It reads package-lock.json rather than running `npm ls`, so it needs no
 * network and no installed node_modules.
 *
 * Adapted from the reference implementation in eventably/mailinglist-ui.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = join(repoRoot, 'package-lock.json');
const manifestPath = join(repoRoot, 'package.json');

const EXIT_OK = 0;
const EXIT_VIOLATION = 1;
const EXIT_UNREADABLE = 2;

/**
 * Packages banned as a direct dependency even when an override neutralises
 * them, because the intent is wrong and the override may later be removed.
 */
const BANNED_DIRECT = [
  'axe-core',
  'jest-axe',
  '@types/jest-axe',
  'vitest-axe',
  'axe-playwright',
  'axe-puppeteer',
  'cypress-axe',
];

/**
 * A registry URL for a genuine axe tarball, e.g.
 * `https://registry.npmjs.org/axe-core/-/axe-core-4.10.2.tgz`. The package name
 * in the path is the *real* one even when the dependency is installed under an
 * alias, which is what makes this a more reliable signal than the entry key.
 */
const AXE_TARBALL = /\/(@axe-core\/[^/]+|axe-core)\/-\//;

/**
 * Whether a package name is axe-core itself or lives under the @axe-core scope.
 *
 * @param name - npm package name.
 * @returns True when the name belongs to axe-core.
 */
const isAxePackageName = name => {
  return name === 'axe-core' || name.startsWith('@axe-core/');
};

/**
 * Read and parse a JSON file, or report why it could not be read.
 *
 * @param path - Absolute path to a JSON file.
 * @returns The parsed document, or null when it could not be read.
 */
const readJson = path => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Could not read ${path}: ${error.message}`);
    return null;
  }
};

/**
 * Lockfile entries that resolve to a genuine axe tarball.
 *
 * An entry is only a real axe-core if it actually resolves to the axe-core
 * tarball. The override leaves an entry keyed "axe-core" that resolves to
 * empty-npm-package; that is the desired state, not a violation.
 *
 * @param lock - Parsed package-lock.json.
 * @returns One record per offending lockfile entry.
 */
const findResolvedAxe = lock => {
  const offenders = [];
  for (const [key, entry] of Object.entries(lock.packages ?? {})) {
    if (key === '') {
      continue;
    }
    // Keyed on the resolved tarball rather than the entry key, so that
    // `"a11y-engine": "npm:axe-core@4.10.2"` -- which is keyed by its alias --
    // cannot slip past. The override's stub entry resolves to
    // empty-npm-package, so it still does not match.
    const resolved = entry.resolved ?? '';
    if (AXE_TARBALL.test(resolved)) {
      offenders.push({ key, resolved, version: entry.version });
    }
  }
  return offenders;
};

/**
 * Whether a dependency spec aliases a banned package, as in
 * `"a11y-engine": "npm:axe-core@4.10.2"`.
 *
 * @param spec - The version spec from a manifest dependency section.
 * @returns True when the spec resolves to a banned package.
 */
const isBannedAliasTarget = spec => {
  if (typeof spec !== 'string' || !spec.startsWith('npm:')) {
    return false;
  }
  const target = spec.slice('npm:'.length).replace(/@[^@/]*$/, '');
  return BANNED_DIRECT.includes(target) || isAxePackageName(target);
};

/**
 * Banned packages declared directly in package.json.
 *
 * @param manifest - Parsed package.json.
 * @returns The offending dependency names.
 */
const findDeclaredAxe = manifest => {
  const declared = new Set();
  // Every section that can introduce a dependency, not just the two obvious
  // ones -- an optional or peer dependency installs just as readily.
  const sections = [
    manifest.dependencies,
    manifest.devDependencies,
    manifest.optionalDependencies,
    manifest.peerDependencies,
  ];
  for (const section of sections) {
    for (const [name, spec] of Object.entries(section ?? {})) {
      if (BANNED_DIRECT.includes(name) || isAxePackageName(name)) {
        declared.add(name);
        continue;
      }
      if (isBannedAliasTarget(spec)) {
        declared.add(name);
      }
    }
  }
  return [...declared];
};

/**
 * Report the violations found and explain how to clear them.
 *
 * @param declared - Banned direct dependencies.
 * @param offenders - Lockfile entries resolving to real axe tarballs.
 */
const reportViolations = (declared, offenders) => {
  console.error('axe-core is banned in this repository (see CLAUDE.md).\n');

  if (declared.length > 0) {
    console.error('Declared in package.json:');
    for (const name of declared) {
      console.error(`  - ${name}`);
    }
    console.error('');
  }

  if (offenders.length > 0) {
    console.error('Resolving to a real axe-core tarball in package-lock.json:');
    for (const { key, version, resolved } of offenders) {
      console.error(`  - ${key} @ ${version}\n      ${resolved}`);
    }
    console.error(
      '\nAdd or restore the override in package.json:\n' +
        '  "overrides": { "axe-core": "npm:empty-npm-package@1.0.0" }\n' +
        'then re-run `npm install`.',
    );
  }
};

/**
 * Run the check.
 *
 * @returns A process exit code.
 */
const main = () => {
  const lock = readJson(lockPath);
  const manifest = readJson(manifestPath);
  if (lock === null || manifest === null) {
    return EXIT_UNREADABLE;
  }

  const offenders = findResolvedAxe(lock);
  const declared = findDeclaredAxe(manifest);

  if (offenders.length === 0 && declared.length === 0) {
    console.log('OK: axe-core does not resolve anywhere in the dependency tree.');
    return EXIT_OK;
  }

  reportViolations(declared, offenders);
  return EXIT_VIOLATION;
};

process.exitCode = main();
