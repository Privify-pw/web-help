# GitHub Issues Generator

This script automatically creates GitHub issues from the features defined in `FEATURES.md`.

## Prerequisites

1. **GitHub Personal Access Token**

   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Required scopes: `repo` (Full control of private repositories)
   - Copy the token

2. **Install dependencies**
   ```bash
   npm install
   ```

## Usage

### 1. Preview (Dry Run)

See what issues would be created without actually creating them:

```bash
export GITHUB_TOKEN=your_github_token_here
npm run issues:preview
```

### 2. Create Issues

Actually create the issues on GitHub:

```bash
export GITHUB_TOKEN=your_github_token_here
npm run issues:create
```

Or set the token inline:

```bash
GITHUB_TOKEN=your_token npm run issues:create
```

## Configuration

Edit `scripts/create-github-issues.js` to update:

- `REPO_OWNER`: Your GitHub username or organization
- `REPO_NAME`: Your repository name

Current configuration:

- Owner: `pii-keep`
- Repo: `web-help`

## What It Does

1. **Parses FEATURES.md** to extract all features
2. **Creates labels** for phases, statuses, and categories
3. **Creates GitHub issues** with:
   - Title: `[Feature #N] Feature Title`
   - Body: Description, status, checklist, related links
   - Labels: phase, status, category
   - Feature number reference

## Labels Created

**Phases:**

- `phase-1` through `phase-5`

**Status:**

- `completed`
- `in-progress`
- `planned`

**Categories:**

- `navigation`
- `search`
- `media`
- `content`
- `feedback`
- `ui`
- `editor`
- `dx` (developer experience)

## Example Output

```
Feature #1: TypeScript type system and interfaces
  Phase: Phase 1A: Core Foundation (MVP - Dedicated Page Mode)
  Status: ✅ Complete
  Labels: enhancement, phase-1, completed, content
  ✅ Created issue #45
```

## Safety Features

- **Dry run by default** - Preview before creating
- **Rate limiting** - 1 second delay between API calls
- **Label creation** - Ensures all labels exist before creating issues
- **Error handling** - Continues on failure, reports errors

## Troubleshooting

**"GITHUB_TOKEN environment variable is required"**

- Make sure you've set the token: `export GITHUB_TOKEN=your_token`

**"404 Not Found"**

- Check that `REPO_OWNER` and `REPO_NAME` are correct in the script
- Ensure your token has `repo` scope

**Rate limiting errors**

- The script includes delays, but you can increase them if needed
- GitHub allows 5000 requests/hour for authenticated requests
