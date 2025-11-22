# ⚡ Quick Publish to NPM (One Command)

## 🚀 Super Quick Publish

```bash
npm login && cd cli && bun install && cd .. && bun run build:cli && npm publish --access public
```

## 📝 Step by Step

```bash
# 1. Login
npm login

# 2. Install CLI dependencies
cd cli && bun install && cd ..

# 3. Build CLI
bun run build:cli

# 4. Publish
npm publish --access public
```

## ✅ That's It!

Your package is now live at: `@ui-thing/components`

Users can install it with:
```bash
npm install @ui-thing/components
# or
bun add @ui-thing/components
```

## 🎯 Using the Package

After publishing, users can:

```bash
# Use the CLI
npx ui-thing init
npx ui-thing add button card

# Or install directly
npm install @ui-thing/components
```

## 🔄 Update & Republish

```bash
# Update version
npm version patch

# Build & publish
bun run build:cli && npm publish
```

---

**Note**: You only need to use `npm` for login and publish. Everything else uses Bun! ⚡
