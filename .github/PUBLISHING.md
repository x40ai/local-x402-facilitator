# Publishing Setup & Guide

This document explains how to set up automated NPM publishing for this repository using [GitHub's official tutorial](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).

## Setup

### 1. NPM Token Setup

1. **Create an NPM Access Token:**
   ```bash
   npm login
   npm token create --type=automation
   ```

2. **Add the token to GitHub Secrets:**
   - Go to your repository on GitHub
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Name: `NPM_TOKEN`
   - Value: Your NPM automation token from step 1

## Publishing Workflow

### Release-Based Publishing

Following GitHub's recommended approach, publishing happens when you create a GitHub release:

1. **Create a new release:**
   - Go to your repository on GitHub
   - Click `Releases` → `Create a new release`
   - Choose a tag (e.g., `v0.1.1`) 
   - Fill in release title and description
   - Click `Publish release`

2. **The GitHub Action will automatically:**
   - ✅ Install dependencies
   - ✅ Build the project (via `prepublishOnly` script)
   - ✅ Publish to NPM with provenance
   - ✅ Make the package publicly accessible

### Alternative: Command Line Publishing

You can also publish directly from your local machine:

```bash
# Update version
npm version patch  # or minor/major

# Publish to NPM
npm publish

# Push the version tag
git push --follow-tags
```

## Features

### Continuous Integration (`ci.yml`)

Runs on every push and pull request:
- ✅ Multi-version testing (Node.js 18, 20)
- ✅ Code quality (ESLint)
- ✅ Build verification
- ✅ Test execution

### Publishing Pipeline (`publish.yml`)

Runs when you create a GitHub release:
- ✅ Uses NPM provenance for supply chain security
- ✅ Publishes with public access
- ✅ Follows GitHub's official best practices
- ✅ Simple and reliable

## Troubleshooting

### Common Issues

1. **NPM Token Issues**
   - Generate new token: `npm token create --type=automation`
   - Update `NPM_TOKEN` secret in repository settings

2. **Build Failures**
   - Check Actions tab for logs
   - Test locally: `npm run build`
   - Verify `prepublishOnly` script works

3. **Publishing Fails**
   - Ensure package name is available on NPM
   - Check token permissions
   - Verify package.json configuration

### Testing Locally

Before creating a release, always test:

```bash
# Clean build
npm run clean && npm run build

# Test CLI
node dist/bin/cli.js --help

# Dry run
npm publish --dry-run
```
