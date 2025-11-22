# Publishing ui-thing to NPM

This guide explains how to publish ui-thing as an NPM package.

## 📦 Package Structure

The package is structured to allow users to:
1. Install the CLI tool globally or use with npx
2. Add individual components to their projects
3. Access all components through the package

## 🚀 Publishing Steps

### 1. Prepare for Publishing

```bash
# Make sure you're logged in to NPM
npm login

# Verify your NPM account
npm whoami
```

### 2. Update Version

Update the version in `package.json`:
```json
{
  "version": "1.0.0"  // or "1.0.1", "1.1.0", etc.
}
```

### 3. Build the Package

```bash
# Build the CLI tool
npm run build:cli

# Build the main package
npm run build:package
```

### 4. Test Locally (Optional)

```bash
# Create a local link
npm link

# In another project, test the package
npm link @ui-thing/components

# Or test the CLI
npx ui-thing init
npx ui-thing add button
```

### 5. Publish to NPM

```bash
# Dry run to see what will be published
npm publish --dry-run

# Publish to NPM
npm publish --access public
```

## 📝 Version Management

Follow semantic versioning:
- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features, backwards compatible
- **Major** (x.0.0): Breaking changes

```bash
# Update version automatically
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## 🔧 Package Configuration

The package includes:
- **Main package**: `@ui-thing/components`
- **CLI tool**: `ui-thing` command
- **Components**: Individual Vue components
- **Utils**: Utility functions
- **Types**: TypeScript definitions

## 📖 Usage After Publishing

Users can install and use your package:

```bash
# Install the package
npm install @ui-thing/components

# Or use the CLI
npx ui-thing init
npx ui-thing add button card input
```

## 🎯 What Gets Published

The following files/folders are included in the package:
- `dist/` - Built CLI and library files
- `app/components/Ui/` - All UI components
- `app/utils/` - Utility functions
- `README.md` - Documentation
- `LICENSE.md` - License file

## 🚫 What's Excluded

These are NOT published (via `.npmignore` or package.json `files` field):
- `node_modules/`
- `.nuxt/`
- `content/`
- `server/`
- Development files
- Test files

## 🔐 Publishing Checklist

Before publishing:
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Test the CLI locally
- [ ] Run `npm run build:package`
- [ ] Run `npm publish --dry-run`
- [ ] Verify the package contents
- [ ] Run `npm publish --access public`
- [ ] Create a git tag: `git tag v1.0.0`
- [ ] Push the tag: `git push --tags`

## 📚 Post-Publishing

After publishing:
1. Update the documentation website
2. Announce on social media
3. Update the GitHub repository
4. Add release notes on GitHub
