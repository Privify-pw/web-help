import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'pii-keep';
const REPO_NAME = 'web-help';
const FEATURES_PATH = path.join(__dirname, '..', 'FEATURES.md');

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.log('Create a token at: https://github.com/settings/tokens');
  console.log('Required scopes: repo');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function getIssues() {
  return octokit.paginate(octokit.issues.listForRepo, {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'all',
    per_page: 100,
  });
}

function reNumberIssue(issue) {
  const issueNumber = issue.number;
  const issueName = issue.title;

  // Check if title matches [Feature #<number>] or [Bug #<number>]
  const match = issueName.match(/^\[(Feature|Bug) #(\d+)\]/);

  if (!match) {
    return { issue, oldNumber: null, type: null };
  }

  const type = match[1]; // "Feature" or "Bug"
  const oldNumber = match[2]; // The captured number

  // Only update if the numbers are different
  if (oldNumber === String(issueNumber)) {
    return { issue, oldNumber: null, type: null };
  }

  // Replace with the actual issue number
  const newTitle = issueName.replace(
    /^\[(Feature|Bug) #\d+\]/,
    `[${type} #${issueNumber}]`,
  );

  return {
    issue: { ...issue, title: newTitle },
    oldNumber,
    type,
  };
}

function updateFeaturesDocument(updates) {
  if (updates.length === 0) {
    return;
  }

  if (!fs.existsSync(FEATURES_PATH)) {
    console.warn(`⚠️  FEATURES.md not found at ${FEATURES_PATH}`);
    return;
  }

  let content = fs.readFileSync(FEATURES_PATH, 'utf-8');
  let modified = false;

  updates.forEach(({ oldNumber, newNumber, type }) => {
    if (type !== 'Feature') {
      return; // Only update Feature entries in FEATURES.md
    }

    // Update references like "**Feature #54**" or "Feature #54"
    const featurePattern = new RegExp(
      `(\\*\\*)?Feature #${oldNumber}(\\*\\*)?`,
      'g',
    );
    const replacementCount = (content.match(featurePattern) || []).length;

    if (replacementCount > 0) {
      content = content.replace(featurePattern, `$1Feature #${newNumber}$2`);
      modified = true;
      console.log(
        `  📝 Updated ${replacementCount} reference(s) in FEATURES.md: Feature #${oldNumber} -> Feature #${newNumber}`,
      );
    }
  });

  if (modified) {
    fs.writeFileSync(FEATURES_PATH, content, 'utf-8');
    console.log('✅ FEATURES.md updated successfully');
  }
}

// Main
const args = process.argv.slice(2);
const dryRun = !args.includes('--update');

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made');
  console.log('   Run with --update flag to apply changes\n');
}

getIssues()
  .then(async (issues) => {
    const updates = [];

    for (const issue of issues) {
      const { issue: updatedIssue, oldNumber, type } = reNumberIssue(issue);

      if (updatedIssue.title !== issue.title) {
        console.log(
          `Renaming Issue #${issue.number}: "${issue.title}" -> "${updatedIssue.title}"`,
        );

        updates.push({
          oldNumber,
          newNumber: issue.number,
          type,
        });

        if (!dryRun) {
          // Update the issue title on GitHub
          await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issue.number,
            title: updatedIssue.title,
          });
        }
      }
    }

    if (updates.length > 0) {
      console.log(`\n📊 Found ${updates.length} issue(s) to update`);

      if (!dryRun) {
        updateFeaturesDocument(updates);
      } else {
        console.log('\n📝 FEATURES.md updates (dry run):');
        updates
          .filter((u) => u.type === 'Feature')
          .forEach(({ oldNumber, newNumber }) => {
            console.log(`  Feature #${oldNumber} -> Feature #${newNumber}`);
          });
      }
    } else {
      console.log('✅ All issue numbers are already correct');
    }
  })
  .catch((error) => {
    console.error('❌ Error fetching issues:', error.message);
    process.exit(1);
  });
