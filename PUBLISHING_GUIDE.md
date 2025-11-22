# 📦 Publishing UI Thing to NPM - Quick Start Guide

## ✅ Prerequisites

1. **NPM Account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **Git Repository**: Ensure your code is committed
3. **Bun**: Latest version installed ([bun.sh](https://bun.sh))

## 🚀 Step-by-Step Publishing

### Step 1: Login to NPM

```bash
npm login
```

Enter your NPM credentials when prompted.

### Step 2: Verify Your Login

```bash
npm whoami
```

Should display your NPM username.

### Step 3: Install CLI Dependencies

```bash
cd cli
bun install
cd ..
```

### Step 4: Build the CLI

```bash
bun run build:cli
```

### Step 5: Test Locally (Optional but Recommended)

```bash
# Dry run to see what will be published
npm publish --dry-run
```

Review the output to ensure only the correct files are included.

### Step 6: Publish to NPM

```bash
# Publish with public access
npm publish --access public
```

### Step 7: Verify Publication

```bash
# Check if package is published
npm view @ui-thing/components
```

### Step 8: Create Git Tag

```bash
# Create a version tag
git tag v1.0.0

# Push the tag
git push --tags
```

## 🎯 Using the Published Package

After publishing, users can install your package:

```bash
# Install the package
npm install @ui-thing/components

# Use the CLI
npx ui-thing init
npx ui-thing add button card
```

## 🔄 Updating the Package

When you want to publish a new version:

### 1. Update Version

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 2. Publish Update

```bash
bun run build:cli
npm publish
```

### 3. Push Changes

```bash
git push
git push --tags
```

## 📋 Pre-Publishing Checklist

- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] README is up to date
- [ ] CHANGELOG is updated
- [ ] Version number is correct
- [ ] Git changes are committed
- [ ] Logged in to NPM
- [ ] CLI builds successfully
- [ ] Dry run passes

## 🛠️ Automated Publishing (Recommended)

Use the provided scripts for easier publishing:

### Windows (PowerShell):
```powershell
.\scripts\publish-package.ps1
```

### Linux/Mac (Bash):
```bash
chmod +x scripts/publish-package.sh
./scripts/publish-package.sh
```

## ⚠️ Important Notes

1. **Package Name**: The package is published as `@ui-thing/components`
2. **Public Access**: Use `--access public` for scoped packages
3. **Version**: Follow semantic versioning (semver)
4. **Files**: Only necessary files are published (see .npmignore)
5. **License**: MIT license is included

## 🎉 After Publishing

1. **Announce**: Share on social media, Discord, Twitter
2. **Documentation**: Update your documentation site
3. **GitHub Release**: Create a release on GitHub
4. **Changelog**: Update CHANGELOG.md
5. **Examples**: Add usage examples

## 🐛 Troubleshooting

### "You must be logged in to publish packages"
Run `npm login` and enter your credentials.

### "Package name already exists"
Change the package name in package.json or use a scoped name like `@your-username/ui-thing`.

### "403 Forbidden"
You don't have permission to publish this package name. Choose a different name.

### "Files not included in package"
Check your `.npmignore` file and `files` field in package.json.

## 📞 Need Help?

- Check [NPM Documentation](https://docs.npmjs.com/)
- Open an issue on GitHub
- Join our Discord community

---

Good luck with your publishing! 🚀
