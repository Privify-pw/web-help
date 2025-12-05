import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'pii-keep'; // Update to your GitHub username/org
const REPO_NAME = 'web-help';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.log('Create a token at: https://github.com/settings/tokens');
  console.log('Required scopes: repo');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Parse FEATURES.md
function parseFeatures() {
  const featuresPath = path.join(__dirname, '..', 'FEATURES.md');
  const content = fs.readFileSync(featuresPath, 'utf-8');

  const features = [];
  const lines = content.split('\n');

  let currentPhase = '';
  let phaseDescription = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect phase headers
    if (line.startsWith('## Phase')) {
      currentPhase = line.replace('## ', '').trim();
      // Get phase description from next line if exists
      if (i + 1 < lines.length && !lines[i + 1].startsWith('|')) {
        phaseDescription = lines[i + 1].trim();
      }
      continue;
    }

    // Parse table rows (skip header and separator)
    if (line.startsWith('| #') && !line.includes('Feature #')) {
      const columns = line
        .split('|')
        .map((col) => col.trim())
        .filter(Boolean);

      if (columns.length >= 4) {
        const featureNum = columns[0].replace('#', '');
        const title = columns[1];
        const status = columns[2];
        const description = columns[3];

        features.push({
          number: parseInt(featureNum),
          title,
          status,
          description,
          phase: currentPhase,
          phaseDescription,
        });
      }
    }
  }

  return features;
}

// Create issue body from feature
function createIssueBody(feature) {
  const statusEmoji = {
    '✅ Complete': '✅',
    '🚧 In Progress': '🚧',
    '🔲 Planned': '📋',
    '⏸️ On Hold': '⏸️',
    '❌ Cancelled': '❌',
  };

  return `## ${feature.phase}

${feature.phaseDescription}

### Description

${feature.description}

### Status

${statusEmoji[feature.status] || '📋'} ${feature.status}

### Implementation Checklist

- [ ] Design API and types
- [ ] Implement core functionality
- [ ] Add TypeScript definitions
- [ ] Write documentation
- [ ] Add usage examples
- [ ] Update CHANGELOG.md
- [ ] Update FEATURES.md

### Related

- See [\`FEATURES.md\`](../blob/main/FEATURES.md) for full feature tracking
- See [\`docs/web-help.md\`](../blob/main/docs/web-help.md) for architecture details

---

**Feature Number:** #${feature.number}
`;
}

// Get appropriate labels for feature
function getLabels(feature) {
  const labels = ['enhancement'];

  // Add phase label
  if (feature.phase.includes('Phase 1')) labels.push('phase-1');
  else if (feature.phase.includes('Phase 2')) labels.push('phase-2');
  else if (feature.phase.includes('Phase 3')) labels.push('phase-3');
  else if (feature.phase.includes('Phase 4')) labels.push('phase-4');
  else if (feature.phase.includes('Phase 5')) labels.push('phase-5');

  // Add status labels
  if (feature.status === '✅ Complete') labels.push('completed');
  else if (feature.status === '🚧 In Progress') labels.push('in-progress');
  else if (feature.status === '🔲 Planned') labels.push('planned');

  // Add category labels
  if (feature.phase.includes('Navigation')) labels.push('navigation');
  if (feature.phase.includes('Search')) labels.push('search');
  if (feature.phase.includes('Media')) labels.push('media');
  if (feature.phase.includes('Content')) labels.push('content');
  if (feature.phase.includes('Feedback')) labels.push('feedback');
  if (feature.phase.includes('Display')) labels.push('ui');
  if (feature.phase.includes('Editor')) labels.push('editor');
  if (feature.phase.includes('Developer')) labels.push('dx');

  return labels;
}

// Create labels if they don't exist
async function ensureLabels() {
  const requiredLabels = [
    {
      name: 'enhancement',
      color: 'a2eeef',
      description: 'New feature or request',
    },
    { name: 'phase-1', color: '0e8a16', description: 'Phase 1 feature' },
    { name: 'phase-2', color: '1d76db', description: 'Phase 2 feature' },
    { name: 'phase-3', color: '5319e7', description: 'Phase 3 feature' },
    { name: 'phase-4', color: 'd93f0b', description: 'Phase 4 feature' },
    { name: 'phase-5', color: 'e99695', description: 'Phase 5 feature' },
    { name: 'completed', color: '0e8a16', description: 'Feature is complete' },
    {
      name: 'in-progress',
      color: 'fbca04',
      description: 'Currently being worked on',
    },
    {
      name: 'planned',
      color: 'd4c5f9',
      description: 'Planned for future release',
    },
    { name: 'navigation', color: 'c5def5', description: 'Navigation related' },
    { name: 'search', color: 'c5def5', description: 'Search related' },
    {
      name: 'media',
      color: 'c5def5',
      description: 'Media and content display',
    },
    {
      name: 'content',
      color: 'c5def5',
      description: 'Content parsing and loading',
    },
    {
      name: 'feedback',
      color: 'c5def5',
      description: 'User feedback features',
    },
    { name: 'ui', color: 'c5def5', description: 'UI components' },
    { name: 'editor', color: 'c5def5', description: 'Content editor features' },
    { name: 'dx', color: 'c5def5', description: 'Developer experience' },
  ];

  console.log('📋 Ensuring labels exist...');

  for (const label of requiredLabels) {
    try {
      await octokit.issues.getLabel({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        name: label.name,
      });
      console.log(`✅ Label "${label.name}" exists`);
    } catch (error) {
      if (error.status === 404) {
        await octokit.issues.createLabel({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          name: label.name,
          color: label.color,
          description: label.description,
        });
        console.log(`✨ Created label "${label.name}"`);
      }
    }
  }
}

// Create GitHub issues
async function createIssues(dryRun = true) {
  const features = parseFeatures();

  console.log(`\n📊 Found ${features.length} features in FEATURES.md\n`);

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No issues will be created\n');
  }

  await ensureLabels();

  console.log('\n🚀 Creating issues...\n');

  for (const feature of features) {
    const issueTitle = `[Feature #${feature.number}] ${feature.title}`;
    const issueBody = createIssueBody(feature);
    const labels = getLabels(feature);

    console.log(`Feature #${feature.number}: ${feature.title}`);
    console.log(`  Phase: ${feature.phase}`);
    console.log(`  Status: ${feature.status}`);
    console.log(`  Labels: ${labels.join(', ')}`);

    if (!dryRun) {
      try {
        const response = await octokit.issues.create({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          title: issueTitle,
          body: issueBody,
          labels: labels,
        });
        console.log(`  ✅ Created issue #${response.data.number}`);
      } catch (error) {
        console.error(`  ❌ Failed to create issue: ${error.message}`);
      }
    } else {
      console.log(`  🔍 Would create issue`);
    }

    console.log('');

    // Rate limiting: wait 1 second between API calls
    if (!dryRun) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(
    `\n✨ Done! ${
      dryRun
        ? 'Run with --create flag to actually create issues.'
        : 'All issues created!'
    }\n`,
  );
}

// Main
const args = process.argv.slice(2);
const dryRun = !args.includes('--create');

createIssues(dryRun).catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
