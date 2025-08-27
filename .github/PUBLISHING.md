# Publishing Setup & Guide

This document explains how to set up automated NPM publishing for this repository using [GitHub's official tutorial](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).

## Setup

### Alternative: Command Line Publishing

You can also publish directly from your local machine:

```bash
# Update version
npm version patch  # or minor/major

# Test Publish to NPM
npm publish --dry-run

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
