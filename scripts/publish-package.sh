#!/bin/bash

echo "📦 UI Thing - NPM Publishing Script"
echo "===================================="
echo ""

# Check if logged in to NPM
echo "🔐 Checking NPM authentication..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ You are not logged in to NPM"
    echo "Please run: npm login"
    exit 1
fi

echo "✅ Logged in as: $(npm whoami)"
echo ""

# Check for uncommitted changes
echo "🔍 Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Build the package
echo "🔨 Building the package..."
bun run build:cli
if [ $? -ne 0 ]; then
    echo "❌ CLI build failed"
    exit 1
fi

echo "✅ CLI built successfully"
echo ""

# Dry run
echo "🧪 Running dry-run..."
npm publish --dry-run
if [ $? -ne 0 ]; then
    echo "❌ Dry run failed"
    exit 1
fi

echo ""
echo "✅ Dry run successful"
echo ""

# Confirm publishing
read -p "Ready to publish to NPM? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled"
    exit 1
fi

# Publish
echo ""
echo "🚀 Publishing to NPM..."
npm publish --access public

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Package published successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Create a git tag: git tag v$(node -p "require('./package.json').version")"
    echo "  2. Push the tag: git push --tags"
    echo "  3. Create a GitHub release"
    echo "  4. Update documentation"
else
    echo "❌ Publishing failed"
    exit 1
fi
