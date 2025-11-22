# 🚀 How to Publish UI Thing to NPM (Using Bun)

## Quick Publish (3 Steps)

### 1. Login to NPM
```bash
npm login
```

### 2. Build CLI
```bash
cd cli
bun install
cd ..
bun run build:cli
```

### 3. Publish
```bash
npm publish --access public
```

That's it! 🎉

## 📦 What Gets Published

Your package will be available as: **`@ui-thing/components`**

Users can install it with:
```bash
npm install @ui-thing/components
# or
bun add @ui-thing/components
```

## 🛠️ Using the CLI

After publishing, users can use your CLI:

```bash
# Initialize in their project
npx ui-thing init

# Add components
npx ui-thing add button
npx ui-thing add card input dialog
```

## 📝 Before Publishing Checklist

- [ ] Logged in to NPM (`npm whoami`)
- [ ] Version updated in package.json
- [ ] CLI dependencies installed (`cd cli && bun install`)
- [ ] CLI builds successfully (`bun run build:cli`)
- [ ] Test with dry-run (`npm publish --dry-run`)

## 🔄 Updating the Package

When you make changes:

```bash
# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Build and publish
bun run build:cli
npm publish

# Tag and push
git push
git push --tags
```

## 🎯 Package Details

- **Name**: `@ui-thing/components`
- **Version**: Check package.json
- **License**: MIT
- **Repository**: GitHub

## 💡 Tips

1. **Test First**: Always run `npm publish --dry-run` before publishing
2. **Versioning**: Follow semantic versioning (semver)
3. **Changelog**: Update CHANGELOG.md before each release
4. **Git Tags**: Tag each release with `git tag v1.0.0`
5. **Documentation**: Update docs after publishing

## ⚡ Using Bun for Everything

```bash
# Install dependencies
bun install

# Build CLI
bun run build:cli

# Test locally
bun link
cd /path/to/test-project
bun link @ui-thing/components

# Publish (still use npm for publishing)
npm publish --access public
```

## 🐛 Troubleshooting

**"You must be logged in"**
→ Run `npm login`

**"Package name already taken"**
→ Change name in package.json to something unique

**"403 Forbidden"**
→ Use `--access public` for scoped packages

**"CLI not found after install"**
→ Make sure `bin` field in package.json is correct

## 🎉 Success!

After publishing, your package will be available at:
- NPM: `https://www.npmjs.com/package/@ui-thing/components`
- Install: `npm install @ui-thing/components`
- CLI: `npx ui-thing add button`

---

Need help? Check the full PUBLISHING_GUIDE.md or open an issue on GitHub.
