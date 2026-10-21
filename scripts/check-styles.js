#!/usr/bin/env node
/**
 * Compile the plugin's stylesheets against the installed Mailspring.
 *
 * Mailspring swallows a LESS compile error and ships an empty stylesheet, so
 * a typo in a variable name stays invisible until someone opens the popover
 * and finds it unstyled. This makes `npm run build` fail instead.
 *
 *   node scripts/check-styles.js           # skip when Mailspring is missing
 *   node scripts/check-styles.js --strict  # fail when Mailspring is missing
 */

const path = require('path');
const { compileStylesheet, findMailspringAsar } = require('./mailspring-styles');

const STYLESHEET = path.join(__dirname, '..', 'styles', 'index.less');
const STRICT = process.argv.includes('--strict');

async function main() {
  if (!findMailspringAsar()) {
    const message =
      'check:styles - Mailspring not found, skipping the stylesheet check. ' +
      'Install Mailspring to have this guard.';

    if (STRICT) {
      console.error(message.replace('skipping', 'failing instead of skipping'));
      process.exit(1);
    }

    console.warn(message);
    return;
  }

  try {
    await compileStylesheet(STYLESHEET);
    console.log('check:styles - the stylesheet compiles against Mailspring.');
  } catch (err) {
    console.error('check:styles - the stylesheet does NOT compile against Mailspring:');
    console.error(`  ${err.message}`);
    if (err.filename) console.error(`  in ${err.filename}:${err.line}`);
    if (err.extract) {
      for (const e of err.extract) {
        if (!e || !e.message) continue;
        console.error(`  ${e.message}${e.filename ? ` (${e.filename}:${e.line})` : ''}`);
      }
    }
    console.error('\nMailspring swallows this error and ships an empty stylesheet.');
    process.exitCode = 1;
  }
}

main();
